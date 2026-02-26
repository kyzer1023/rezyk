import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { callGemini, ONLINE_MODEL_ID } from "@/lib/gemini";
import {
  HistoryAnalysisGenerationSchema,
  buildHistoryAnalysisPrompt,
  type HistoryAnalysisResult,
} from "@/lib/analysis/history-analysis-schema";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { session } = await requireAuth();
    const { courseId, maxQuizzes = 10 } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const courseSnap = await adminDb.collection("courses").doc(courseId).get();
    const courseName = (courseSnap.data()?.name as string) ?? "Course";

    const quizzesSnap = await adminDb
      .collection("quizzes")
      .where("courseId", "==", courseId)
      .where("ownerId", "==", session.sub)
      .where("analysisStatus", "==", "completed")
      .get();

    const analysedQuizzes = quizzesSnap.docs.slice(0, maxQuizzes);

    if (analysedQuizzes.length < 2) {
      const result = {
        courseId,
        overallTrend: "insufficient_data" as const,
        confidence: "low" as const,
        evidenceSummary: {
          scoreTrajectory: "Not enough data to determine a trajectory.",
          riskTrajectory: "Not enough data to determine a trajectory.",
          recurringWeakConcepts: [],
        },
        interventionImpactHypothesis: { improving: [], unresolved: [] },
        nextCycleActions: ["Complete and analyze at least 2 quizzes to enable trend analysis."],
        analyzedQuizIds: analysedQuizzes.map((d) => d.id),
        quizCount: analysedQuizzes.length,
        generatedAt: Date.now(),
        modelId: ONLINE_MODEL_ID,
        ownerId: session.sub,
        status: "insufficient_data" as const,
      };
      await adminDb.collection("historyAnalyses").doc(courseId).set(result);
      return NextResponse.json({ success: true, analysis: result, status: "insufficient_data" });
    }

    const quizSequence: Parameters<typeof buildHistoryAnalysisPrompt>[0]["quizSequence"] = [];

    for (const doc of analysedQuizzes) {
      const qData = doc.data();
      const analysisSnap = await adminDb.collection("analyses").doc(doc.id).get();
      if (!analysisSnap.exists) continue;

      const aData = analysisSnap.data()!;
      quizSequence.push({
        quizId: doc.id,
        title: (qData.title as string) ?? "Quiz",
        date: qData.lastSynced ? new Date(qData.lastSynced as number).toISOString().slice(0, 10) : "unknown",
        scoreMetrics: aData.derivedAnalysis?.scoreMetrics ?? { averageScore: 0, medianScore: 0, averageCompletionRate: 0 },
        riskDistribution: aData.derivedAnalysis?.riskDistribution ?? [],
        conceptHeatmap: aData.derivedAnalysis?.conceptHeatmap ?? [],
        errorTypeBreakdown: aData.derivedAnalysis?.errorTypeBreakdown ?? [],
        studentCount: aData.modelOutput?.students?.length ?? 0,
      });
    }

    const prompt = buildHistoryAnalysisPrompt({ courseName, quizSequence });
    const rawText = await callGemini({ prompt, responseSchema: HistoryAnalysisGenerationSchema });
    const parsed = JSON.parse(rawText) as HistoryAnalysisResult;

    const result = {
      courseId,
      ...parsed,
      analyzedQuizIds: quizSequence.map((q) => q.quizId),
      quizCount: quizSequence.length,
      generatedAt: Date.now(),
      modelId: ONLINE_MODEL_ID,
      ownerId: session.sub,
      status: "success" as const,
    };

    await adminDb.collection("historyAnalyses").doc(courseId).set(result);

    return NextResponse.json({ success: true, analysis: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("History analysis error:", msg);
    const status = msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
