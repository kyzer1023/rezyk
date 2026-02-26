import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { generateStructuredContent } from "@/lib/analysis/gemini-client";
import { buildCourseMaterialPrompt } from "@/lib/analysis/course-material-prompt";
import {
  CourseMaterialGenerationSchema,
  type CourseMaterialInput,
  type CourseMaterialAnalysisOutput,
  type SavedCourseMaterialAnalysis,
} from "@/lib/analysis/course-material-schema";
import { ONLINE_MODEL_ID } from "@/lib/analysis/quiz-analysis-schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const courseSnap = await adminDb.collection("courses").doc(courseId).get();
    if (!courseSnap.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const courseName = courseSnap.data()?.name ?? "Course";

    const quizzesSnap = await adminDb
      .collection("quizzes")
      .where("courseId", "==", courseId)
      .where("ownerId", "==", session.sub)
      .where("analysisStatus", "==", "completed")
      .get();

    const quizSummaries: CourseMaterialInput["quizSummaries"] = [];
    const analyzedQuizIds: string[] = [];

    for (const quizDoc of quizzesSnap.docs) {
      const quizData = quizDoc.data();
      const docId = quizDoc.id;
      const analysisSnap = await adminDb.collection("analyses").doc(docId).get();
      if (!analysisSnap.exists) continue;

      const analysisData = analysisSnap.data()!;
      const derived = analysisData.derivedAnalysis;
      if (!derived) continue;

      const concepts = (derived.conceptHeatmap ?? []).map(
        (c: { concept: string }) => c.concept,
      );
      const weakConcepts = (derived.conceptHeatmap ?? [])
        .slice(0, 3)
        .map((c: { concept: string }) => c.concept);
      const errorTypeBreakdown = (derived.errorTypeBreakdown ?? []).map(
        (e: { errorType: string; percentage: number }) => ({
          errorType: e.errorType,
          percentage: e.percentage,
        }),
      );

      quizSummaries.push({
        quizId: docId,
        quizTitle: quizData.title ?? "Quiz",
        concepts,
        averageScore: derived.scoreMetrics?.averageScore ?? 0,
        studentCount: analysisData.modelOutput?.students?.length ?? 0,
        weakConcepts,
        errorTypeBreakdown,
      });

      analyzedQuizIds.push(docId);
    }

    if (quizSummaries.length < 1) {
      return NextResponse.json(
        { error: "No analyzed quizzes found for this course. Run quiz analysis first." },
        { status: 400 },
      );
    }

    const input: CourseMaterialInput = { courseId, courseName, quizSummaries };
    const prompt = buildCourseMaterialPrompt(input);
    const rawText = await generateStructuredContent(prompt, CourseMaterialGenerationSchema, {
      maxOutputTokens: 8192,
    });

    let analysis: CourseMaterialAnalysisOutput;
    try {
      analysis = JSON.parse(rawText) as CourseMaterialAnalysisOutput;
    } catch {
      return NextResponse.json({ error: "Failed to parse model response" }, { status: 422 });
    }

    const saved: SavedCourseMaterialAnalysis = {
      courseId,
      analysis,
      analyzedQuizIds,
      analyzedAt: Date.now(),
      modelId: ONLINE_MODEL_ID,
      ownerId: session.sub,
      status: "success",
    };

    await adminDb.collection("courseMaterialAnalyses").doc(courseId).set(saved);

    return NextResponse.json({ success: true, analysis: saved });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Course material analysis error:", msg);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const courseId = req.nextUrl.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const snap = await adminDb.collection("courseMaterialAnalyses").doc(courseId).get();
    if (!snap.exists) {
      return NextResponse.json({ found: false });
    }

    const data = snap.data()!;
    if (data.ownerId !== session.sub) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, ...data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
