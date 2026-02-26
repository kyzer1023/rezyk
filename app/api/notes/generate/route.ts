import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { generateStructuredContent } from "@/lib/analysis/gemini-client";
import { buildStudentNotePrompt } from "@/lib/analysis/student-notes-prompt";
import {
  StudentNoteGenerationSchema,
  type StudentNoteInput,
  type StudentNoteOutput,
  type SavedStudentNote,
} from "@/lib/analysis/student-notes-schema";
import { ONLINE_MODEL_ID } from "@/lib/analysis/quiz-analysis-schema";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const { courseId, quizId, studentId } = await req.json();

    if (!courseId || !quizId || !studentId) {
      return NextResponse.json(
        { error: "courseId, quizId, and studentId are required" },
        { status: 400 },
      );
    }

    const analysisDocId = `${courseId}_${quizId}`;
    const analysisSnap = await adminDb.collection("analyses").doc(analysisDocId).get();
    if (!analysisSnap.exists) {
      return NextResponse.json(
        { error: "No analysis found. Run quiz analysis first." },
        { status: 404 },
      );
    }

    const analysisData = analysisSnap.data()!;
    const students = analysisData.modelOutput?.students ?? [];
    const studentAnalysis = students.find(
      (s: { studentId: string }) => s.studentId === studentId,
    );

    if (!studentAnalysis) {
      return NextResponse.json(
        { error: `Student ${studentId} not found in analysis` },
        { status: 404 },
      );
    }

    const emailMapping: Record<string, string> = analysisData.emailMapping ?? {};
    const email = emailMapping[studentId] ?? studentId;
    const displayName = email.split("@")[0].replace(/[._]/g, " ");

    const courseSnap = await adminDb.collection("courses").doc(courseId).get();
    const courseName = courseSnap.exists ? (courseSnap.data()?.name ?? "Course") : "Course";

    const quizDocId = analysisDocId;
    const quizSnap = await adminDb.collection("quizzes").doc(quizDocId).get();
    const quizTitle = quizSnap.exists ? (quizSnap.data()?.title ?? "Quiz") : "Quiz";

    const analysisInput = analysisData.analysisInput;
    const studentInput = analysisInput?.students?.find(
      (s: { studentId: string }) => s.studentId === studentId,
    );

    const noteInput: StudentNoteInput = {
      studentId,
      displayName,
      email,
      riskLevel: studentAnalysis.riskLevel,
      score: studentInput?.score ?? 0,
      maxScore: studentInput?.maxScore ?? 0,
      misconceptions: studentAnalysis.misconceptions,
      interventions: studentAnalysis.interventions,
      rationale: studentAnalysis.rationale,
      quizTitle,
      courseName,
    };

    const prompt = buildStudentNotePrompt(noteInput);
    const rawText = await generateStructuredContent(prompt, StudentNoteGenerationSchema);

    let noteOutput: StudentNoteOutput;
    try {
      noteOutput = JSON.parse(rawText) as StudentNoteOutput;
    } catch {
      return NextResponse.json(
        { error: "Failed to parse model response as JSON" },
        { status: 422 },
      );
    }

    noteOutput.studentId = studentId;
    noteOutput.displayName = displayName;

    const noteId = `${analysisDocId}_${studentId}`;
    const savedNote: Omit<SavedStudentNote, "noteId"> & { noteId: string } = {
      noteId,
      courseId,
      quizId,
      studentId,
      displayName,
      note: noteOutput,
      generatedAt: Date.now(),
      modelId: ONLINE_MODEL_ID,
      sourceAnalysisId: analysisDocId,
      status: "success",
      ownerId: session.sub,
    };

    await adminDb.collection("studentNotes").doc(noteId).set(savedNote);

    return NextResponse.json({ success: true, note: savedNote });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Note generation error:", msg);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
