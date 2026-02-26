import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { callGemini, ONLINE_MODEL_ID } from "@/lib/gemini";
import { NoteGenerationSchema, buildNotePrompt, type StudentNote } from "@/lib/notes/note-schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { session } = await requireAuth();
    const { courseId, quizId, studentId } = await req.json();

    if (!courseId || !quizId || !studentId) {
      return NextResponse.json({ error: "courseId, quizId, and studentId are required" }, { status: 400 });
    }

    const analysisDocId = `${courseId}_${quizId}`;
    const analysisSnap = await adminDb.collection("analyses").doc(analysisDocId).get();
    if (!analysisSnap.exists) {
      return NextResponse.json({ error: "Analysis not found. Run quiz analysis first." }, { status: 404 });
    }

    const analysisData = analysisSnap.data()!;
    const students = (analysisData.modelOutput?.students ?? []) as Array<{
      studentId: string;
      riskLevel: string;
      misconceptions: { concept: string; errorType: string; evidence: string; affectedQuestions: string[] }[];
      interventions: { type: string; focusArea: string; action: string }[];
      rationale: string;
    }>;

    const studentAnalysis = students.find((s) => s.studentId === studentId);
    if (!studentAnalysis) {
      return NextResponse.json({ error: "Student not found in analysis results" }, { status: 404 });
    }

    const emailMapping = (analysisData.emailMapping ?? {}) as Record<string, string>;
    const email = emailMapping[studentId] ?? studentId;
    const displayName = email.split("@")[0].replace(/[._]/g, " ");

    const quizDocId = analysisDocId;
    const quizSnap = await adminDb.collection("quizzes").doc(quizDocId).get();
    const quizTitle = (quizSnap.data()?.title as string) ?? "Quiz";

    const prompt = buildNotePrompt({
      displayName,
      riskLevel: studentAnalysis.riskLevel,
      misconceptions: studentAnalysis.misconceptions.map((m) => ({
        concept: m.concept,
        errorType: m.errorType,
        evidence: m.evidence,
      })),
      interventions: studentAnalysis.interventions,
      rationale: studentAnalysis.rationale,
      quizTitle,
    });

    const rawText = await callGemini({ prompt, responseSchema: NoteGenerationSchema });
    const parsed = JSON.parse(rawText) as StudentNote;

    const noteDocId = `${courseId}_${quizId}_${studentId}`;
    const noteData = {
      courseId,
      quizId,
      studentId,
      displayName,
      riskLevel: studentAnalysis.riskLevel,
      note: parsed,
      generatedAt: Date.now(),
      modelId: ONLINE_MODEL_ID,
      sourceAnalysisId: analysisDocId,
      status: "success" as const,
      ownerId: session.sub,
    };

    await adminDb.collection("notes").doc(noteDocId).set(noteData);

    return NextResponse.json({ success: true, note: noteData });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Note generation error:", msg);
    const status = msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
