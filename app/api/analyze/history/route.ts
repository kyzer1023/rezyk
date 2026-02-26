import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { GoogleGenAI } from "@google/genai";
import {
  HISTORY_ANALYSIS_MODEL_ID,
  HISTORY_ANALYSIS_GENERATION_PROFILE,
  HistoryAnalysisGenerationSchema,
  type HistoryAnalysisOutput,
  type StoredHistoryAnalysis,
} from "@/lib/analysis/history-analysis-schema";
import { buildHistoryAnalysisPrompt, type HistoryAnalysisPromptInput } from "@/lib/analysis/history-analysis-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

function resolveApiKey(): string {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
    process.env.GEMINI_API_KEY4,
    process.env.GEMINI_API_KEY5,
  ].filter((k): k is string => !!k && k.length > 0);
  if (keys.length === 0) throw new Error("No GEMINI_API_KEY configured");
  return keys[Math.floor(Math.random() * keys.length)];
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const quizzesSnap = await adminDb
      .collection("quizzes")
      .where("courseId", "==", courseId)
      .where("ownerId", "==", session.sub)
      .get();

    const completedQuizIds: string[] = [];
    for (const doc of quizzesSnap.docs) {
      const d = doc.data();
      if (d.analysisStatus === "completed") {
        completedQuizIds.push(d.courseWorkId as string);
      }
    }

    if (completedQuizIds.length < 2) {
      const result: StoredHistoryAnalysis = {
        courseId,
        analyzedQuizIds: completedQuizIds,
        generatedAt: Date.now(),
        modelId: HISTORY_ANALYSIS_MODEL_ID,
        status: "insufficient_data",
        error: `Need at least 2 analyzed quizzes for history analysis. Found ${completedQuizIds.length}.`,
        ownerId: session.sub,
      };
      await adminDb.collection("historyAnalyses").doc(courseId).set(result);
      return NextResponse.json({ success: true, status: "insufficient_data", error: result.error });
    }

    const courseSnap = await adminDb.collection("courses").doc(courseId).get();
    const courseName = courseSnap.exists ? (courseSnap.data()!.name as string) : "Unknown Course";

    const quizDataPoints: HistoryAnalysisPromptInput["quizDataPoints"] = [];

    for (const quizWorkId of completedQuizIds) {
      const docId = `${courseId}_${quizWorkId}`;
      const aSnap = await adminDb.collection("analyses").doc(docId).get();
      if (!aSnap.exists) continue;

      const aData = aSnap.data()!;
      const derived = aData.derivedAnalysis ?? {};
      const students = aData.modelOutput?.students ?? [];

      const qSnap = await adminDb.collection("quizzes").doc(docId).get();
      const quizTitle = qSnap.exists ? (qSnap.data()!.title as string) : quizWorkId;

      quizDataPoints.push({
        quizId: docId,
        quizTitle,
        analyzedAt: aData.createdAt ?? Date.now(),
        averageScore: derived.scoreMetrics?.averageScore ?? 0,
        medianScore: derived.scoreMetrics?.medianScore ?? 0,
        completionRate: derived.scoreMetrics?.averageCompletionRate ?? 0,
        studentCount: students.length,
        riskDistribution: derived.riskDistribution ?? [],
        topWeakConcepts: (derived.conceptHeatmap ?? []).slice(0, 5).map((c: Record<string, unknown>) => ({
          concept: c.concept as string,
          affectedStudentCount: c.affectedStudentCount as number,
        })),
        errorTypeBreakdown: derived.errorTypeBreakdown ?? [],
      });
    }

    quizDataPoints.sort((a, b) => a.analyzedAt - b.analyzedAt);

    const promptInput: HistoryAnalysisPromptInput = {
      courseName,
      courseId,
      quizDataPoints,
    };

    const prompt = buildHistoryAnalysisPrompt(promptInput);
    const client = new GoogleGenAI({ apiKey: resolveApiKey() });

    const response = await client.models.generateContent({
      model: HISTORY_ANALYSIS_MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: HISTORY_ANALYSIS_GENERATION_PROFILE.responseMimeType,
        responseJsonSchema: HistoryAnalysisGenerationSchema,
        temperature: HISTORY_ANALYSIS_GENERATION_PROFILE.temperature,
        topP: HISTORY_ANALYSIS_GENERATION_PROFILE.topP,
        maxOutputTokens: HISTORY_ANALYSIS_GENERATION_PROFILE.maxOutputTokens,
      },
    });

    const rawText = typeof response.text === "string" ? response.text : String(response.text ?? "");
    const analysis: HistoryAnalysisOutput = JSON.parse(rawText);

    const result: StoredHistoryAnalysis = {
      courseId,
      analyzedQuizIds: completedQuizIds,
      generatedAt: Date.now(),
      modelId: HISTORY_ANALYSIS_MODEL_ID,
      status: "success",
      analysis,
      ownerId: session.sub,
    };

    await adminDb.collection("historyAnalyses").doc(courseId).set(result);

    return NextResponse.json({
      success: true,
      status: "success",
      analysis,
      analyzedQuizCount: quizDataPoints.length,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const snap = await adminDb.collection("historyAnalyses").doc(courseId).get();
    if (!snap.exists) {
      return NextResponse.json({ found: false });
    }

    const data = snap.data()!;
    if (data.ownerId !== session.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ found: true, ...data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
