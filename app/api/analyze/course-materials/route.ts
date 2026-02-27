import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { generateStructuredContent } from "@/lib/analysis/gemini-client";
import { buildCourseMaterialPrompt } from "@/lib/analysis/course-material-prompt";
import {
  COURSE_MATERIAL_GENERATION_PROFILE,
  COURSE_MATERIAL_MODEL_ID,
  CourseMaterialGenerationSchema,
  type CourseMaterialAnalysisOutput,
  type CourseMaterialInput,
  type SavedCourseMaterialAnalysis,
} from "@/lib/analysis/course-material-schema";

export const runtime = "nodejs";
export const maxDuration = 90;

interface QuizQuestion {
  title?: string;
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const { courseId } = (await req.json()) as { courseId?: string };

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
      .get();

    const quizSummaries: CourseMaterialInput["quizSummaries"] = [];
    const analyzedQuizIds: string[] = [];

    for (const quizDoc of quizzesSnap.docs) {
      const quizData = quizDoc.data();
      if (quizData.analysisStatus !== "completed") {
        continue;
      }

      const analysisSnap = await adminDb.collection("analyses").doc(quizDoc.id).get();
      if (!analysisSnap.exists) {
        continue;
      }

      const analysisData = analysisSnap.data();
      if (!analysisData || analysisData.ownerId !== session.sub) {
        continue;
      }

      const derived = analysisData.derivedAnalysis;
      if (!derived) {
        continue;
      }

      const questions = (quizData.questions ?? []) as QuizQuestion[];
      const concepts = questions
        .map((question) => question.title ?? "")
        .map((title) => title.trim())
        .filter((title) => title.length > 0);

      const weakConcepts = (derived.conceptHeatmap ?? [])
        .slice(0, 3)
        .map((entry: { concept?: string }) => entry.concept ?? "")
        .filter((concept: string) => concept.length > 0);

      const errorTypeBreakdown = (derived.errorTypeBreakdown ?? [])
        .map((entry: { errorType?: string; percentage?: number }) => ({
          errorType: entry.errorType ?? "unknown",
          percentage: typeof entry.percentage === "number" ? entry.percentage : 0,
        }));

      quizSummaries.push({
        quizId: quizDoc.id,
        quizTitle: quizData.title ?? "Quiz",
        concepts,
        averageScore: derived.scoreMetrics?.averageScore ?? 0,
        studentCount: analysisData.modelOutput?.students?.length ?? 0,
        weakConcepts,
        errorTypeBreakdown,
      });

      analyzedQuizIds.push(quizDoc.id);
    }

    if (quizSummaries.length === 0) {
      const insufficient: SavedCourseMaterialAnalysis = {
        courseId,
        analyzedQuizIds: [],
        analyzedAt: Date.now(),
        modelId: COURSE_MATERIAL_MODEL_ID,
        ownerId: session.sub,
        status: "insufficient_data",
        error: "No analyzed quizzes found for this course. Run quiz analysis first.",
      };
      await adminDb.collection("courseMaterialAnalyses").doc(courseId).set(insufficient);
      return NextResponse.json({ success: true, analysis: insufficient });
    }

    const input: CourseMaterialInput = { courseId, courseName, quizSummaries };
    const prompt = buildCourseMaterialPrompt(input);
    const rawText = await generateStructuredContent(prompt, CourseMaterialGenerationSchema, {
      modelId: COURSE_MATERIAL_MODEL_ID,
      temperature: COURSE_MATERIAL_GENERATION_PROFILE.temperature,
      maxOutputTokens: COURSE_MATERIAL_GENERATION_PROFILE.maxOutputTokens,
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
      modelId: COURSE_MATERIAL_MODEL_ID,
      ownerId: session.sub,
      status: "success",
    };

    await adminDb.collection("courseMaterialAnalyses").doc(courseId).set(saved);
    return NextResponse.json({ success: true, analysis: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const courseId = new URL(req.url).searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const snap = await adminDb.collection("courseMaterialAnalyses").doc(courseId).get();
    if (!snap.exists) {
      return NextResponse.json({ found: false });
    }

    const data = snap.data() as SavedCourseMaterialAnalysis;
    if (data.ownerId !== session.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ found: true, ...data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
