import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { callGemini, ONLINE_MODEL_ID } from "@/lib/gemini";
import {
  CourseAnalysisGenerationSchema,
  buildCourseAnalysisPrompt,
  type CourseAnalysisResult,
} from "@/lib/analysis/course-analysis-schema";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { session } = await requireAuth();
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const quizzesSnap = await adminDb
      .collection("quizzes")
      .where("courseId", "==", courseId)
      .where("ownerId", "==", session.sub)
      .get();

    if (quizzesSnap.empty) {
      return NextResponse.json({
        success: true,
        status: "insufficient_data",
        reason: "No quizzes found for this course. Sync quizzes first.",
      });
    }

    const courseSnap = await adminDb.collection("courses").doc(courseId).get();
    const courseName = (courseSnap.data()?.name as string) ?? "Course";

    const quizData: {
      title: string;
      questions: { title: string; questionType: string }[];
      analysisConceptHeatmap?: { concept: string; affectedStudentCount: number; dominantErrorType: string }[];
      analysisErrorBreakdown?: { errorType: string; percentage: number }[];
      scoreMetrics?: { averageScore: number; medianScore: number };
    }[] = [];

    const analyzedQuizIds: string[] = [];

    for (const doc of quizzesSnap.docs) {
      const qData = doc.data();
      const quizEntry: (typeof quizData)[number] = {
        title: (qData.title as string) ?? "Quiz",
        questions: ((qData.questions ?? []) as { title: string; questionType: string }[]).map((q) => ({
          title: q.title,
          questionType: q.questionType,
        })),
      };

      const docId = doc.id;
      const analysisSnap = await adminDb.collection("analyses").doc(docId).get();
      if (analysisSnap.exists) {
        const aData = analysisSnap.data()!;
        quizEntry.analysisConceptHeatmap = aData.derivedAnalysis?.conceptHeatmap;
        quizEntry.analysisErrorBreakdown = aData.derivedAnalysis?.errorTypeBreakdown;
        quizEntry.scoreMetrics = aData.derivedAnalysis?.scoreMetrics;
        analyzedQuizIds.push(docId);
      }

      quizData.push(quizEntry);
    }

    const prompt = buildCourseAnalysisPrompt({ courseName, quizzes: quizData });
    const rawText = await callGemini({ prompt, responseSchema: CourseAnalysisGenerationSchema });
    const parsed = JSON.parse(rawText) as CourseAnalysisResult;

    await adminDb.collection("courseAnalyses").doc(courseId).set({
      courseId,
      ...parsed,
      analyzedQuizIds,
      quizCount: quizData.length,
      generatedAt: Date.now(),
      modelId: ONLINE_MODEL_ID,
      ownerId: session.sub,
      status: "success",
    });

    return NextResponse.json({ success: true, analysis: parsed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Course analysis error:", msg);
    const status = msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
