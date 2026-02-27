import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { generateStructuredContent } from "@/lib/analysis/gemini-client";
import { buildHistoryAnalysisPrompt } from "@/lib/analysis/history-analysis-prompt";
import {
  HISTORY_ANALYSIS_GENERATION_PROFILE,
  HISTORY_ANALYSIS_MODEL_ID,
  HistoryAnalysisGenerationSchema,
  type HistoryAnalysisInput,
  type HistoryAnalysisOutput,
  type SavedHistoryAnalysis,
} from "@/lib/analysis/history-analysis-schema";

export const runtime = "nodejs";
export const maxDuration = 90;

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

    const quizSequence: HistoryAnalysisInput["quizSequence"] = [];
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

      const createdAt =
        typeof analysisData.createdAt === "number" ? analysisData.createdAt : Date.now();

      quizSequence.push({
        quizId: quizDoc.id,
        quizTitle: quizData.title ?? "Quiz",
        date: new Date(createdAt).toISOString().slice(0, 10),
        responseCount: analysisData.modelOutput?.students?.length ?? 0,
        averageScore: derived.scoreMetrics?.averageScore ?? 0,
        medianScore: derived.scoreMetrics?.medianScore ?? 0,
        completionRate: derived.scoreMetrics?.averageCompletionRate ?? 0,
        riskDistribution: (derived.riskDistribution ?? []).map(
          (entry: { riskLevel?: string; count?: number; percentage?: number }) => ({
            riskLevel: entry.riskLevel ?? "unknown",
            count: typeof entry.count === "number" ? entry.count : 0,
            percentage: typeof entry.percentage === "number" ? entry.percentage : 0,
          }),
        ),
        topWeakConcepts: (derived.conceptHeatmap ?? [])
          .slice(0, 5)
          .map((entry: { concept?: string }) => entry.concept ?? "")
          .filter((concept: string) => concept.length > 0),
        errorTypeBreakdown: (derived.errorTypeBreakdown ?? []).map(
          (entry: { errorType?: string; percentage?: number }) => ({
            errorType: entry.errorType ?? "unknown",
            percentage: typeof entry.percentage === "number" ? entry.percentage : 0,
          }),
        ),
      });

      analyzedQuizIds.push(quizDoc.id);
    }

    quizSequence.sort((left, right) => left.date.localeCompare(right.date));

    if (quizSequence.length < 2) {
      const insufficient: SavedHistoryAnalysis = {
        courseId,
        analyzedQuizIds,
        analyzedAt: Date.now(),
        modelId: HISTORY_ANALYSIS_MODEL_ID,
        ownerId: session.sub,
        status: "insufficient_data",
        error: `Need at least 2 analyzed quizzes for history analysis. Found ${quizSequence.length}.`,
      };

      await adminDb.collection("historyAnalyses").doc(courseId).set(insufficient);
      return NextResponse.json({ success: true, analysis: insufficient });
    }

    const input: HistoryAnalysisInput = {
      courseId,
      courseName,
      quizSequence,
    };

    const prompt = buildHistoryAnalysisPrompt(input);
    const rawText = await generateStructuredContent(prompt, HistoryAnalysisGenerationSchema, {
      modelId: HISTORY_ANALYSIS_MODEL_ID,
      temperature: HISTORY_ANALYSIS_GENERATION_PROFILE.temperature,
      maxOutputTokens: HISTORY_ANALYSIS_GENERATION_PROFILE.maxOutputTokens,
    });

    let analysis: HistoryAnalysisOutput;
    try {
      analysis = JSON.parse(rawText) as HistoryAnalysisOutput;
    } catch {
      return NextResponse.json({ error: "Failed to parse model response" }, { status: 422 });
    }

    const saved: SavedHistoryAnalysis = {
      courseId,
      analysis,
      analyzedQuizIds,
      analyzedAt: Date.now(),
      modelId: HISTORY_ANALYSIS_MODEL_ID,
      ownerId: session.sub,
      status: "success",
    };

    await adminDb.collection("historyAnalyses").doc(courseId).set(saved);
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

    const snap = await adminDb.collection("historyAnalyses").doc(courseId).get();
    if (!snap.exists) {
      return NextResponse.json({ found: false });
    }

    const data = snap.data() as SavedHistoryAnalysis;
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
