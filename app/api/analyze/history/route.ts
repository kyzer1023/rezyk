import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { generateStructuredContent } from "@/lib/analysis/gemini-client";
import { buildHistoryAnalysisPrompt } from "@/lib/analysis/history-analysis-prompt";
import {
  HistoryAnalysisGenerationSchema,
  type HistoryAnalysisInput,
  type HistoryAnalysisOutput,
  type SavedHistoryAnalysis,
} from "@/lib/analysis/history-analysis-schema";
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

    const quizSequence: HistoryAnalysisInput["quizSequence"] = [];
    const analyzedQuizIds: string[] = [];

    for (const quizDoc of quizzesSnap.docs) {
      const quizData = quizDoc.data();
      const docId = quizDoc.id;
      const analysisSnap = await adminDb.collection("analyses").doc(docId).get();
      if (!analysisSnap.exists) continue;

      const analysisData = analysisSnap.data()!;
      const derived = analysisData.derivedAnalysis;
      if (!derived) continue;

      quizSequence.push({
        quizId: docId,
        quizTitle: quizData.title ?? "Quiz",
        date: new Date(analysisData.createdAt ?? Date.now()).toISOString().slice(0, 10),
        responseCount: analysisData.modelOutput?.students?.length ?? 0,
        averageScore: derived.scoreMetrics?.averageScore ?? 0,
        medianScore: derived.scoreMetrics?.medianScore ?? 0,
        completionRate: derived.scoreMetrics?.averageCompletionRate ?? 0,
        riskDistribution: (derived.riskDistribution ?? []).map(
          (r: { riskLevel: string; count: number; percentage: number }) => ({
            riskLevel: r.riskLevel,
            count: r.count,
            percentage: r.percentage,
          }),
        ),
        topWeakConcepts: (derived.conceptHeatmap ?? [])
          .slice(0, 5)
          .map((c: { concept: string }) => c.concept),
        errorTypeBreakdown: (derived.errorTypeBreakdown ?? []).map(
          (e: { errorType: string; percentage: number }) => ({
            errorType: e.errorType,
            percentage: e.percentage,
          }),
        ),
      });

      analyzedQuizIds.push(docId);
    }

    quizSequence.sort((a, b) => a.date.localeCompare(b.date));

    if (quizSequence.length < 2) {
      const insufficientResult: SavedHistoryAnalysis = {
        courseId,
        analysis: {
          overallTrend: "insufficient_data",
          confidence: "low",
          evidenceSummary: {
            scoreTrajectorySummary: "Not enough data points to determine trend.",
            riskTrajectorySummary: "Not enough data points to determine risk trajectory.",
            recurringWeakConcepts: [],
          },
          interventionImpactHypothesis: {
            appearsToImprove: [],
            remainsUnresolved: [],
          },
          nextCycleActions: ["Analyze at least 2 quizzes before running history analysis."],
        },
        analyzedQuizIds,
        analyzedAt: Date.now(),
        modelId: ONLINE_MODEL_ID,
        ownerId: session.sub,
        status: "success",
      };

      await adminDb.collection("historyAnalyses").doc(courseId).set(insufficientResult);
      return NextResponse.json({ success: true, analysis: insufficientResult });
    }

    const input: HistoryAnalysisInput = { courseId, courseName, quizSequence };
    const prompt = buildHistoryAnalysisPrompt(input);
    const rawText = await generateStructuredContent(prompt, HistoryAnalysisGenerationSchema);

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
      modelId: ONLINE_MODEL_ID,
      ownerId: session.sub,
      status: "success",
    };

    await adminDb.collection("historyAnalyses").doc(courseId).set(saved);

    return NextResponse.json({ success: true, analysis: saved });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("History analysis error:", msg);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
