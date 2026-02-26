import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { GoogleGenAI } from "@google/genai";
import {
  NOTES_MODEL_ID,
  NOTES_GENERATION_PROFILE,
  StudentNoteGenerationSchema,
  type StudentNoteOutput,
  type StoredStudentNote,
} from "@/lib/analysis/student-notes-schema";
import { buildStudentNotePrompt, buildNotePromptContext } from "@/lib/analysis/student-notes-prompt";
import type { ModelStudentAnalysis } from "@/lib/analysis/quiz-analysis-schema";

export const runtime = "nodejs";
export const maxDuration = 30;

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
    const { courseId, quizId, studentId } = body;

    if (!courseId || !quizId || !studentId) {
      return NextResponse.json(
        { error: "courseId, quizId, and studentId are required" },
        { status: 400 },
      );
    }

    const analysisDocId = `${courseId}_${quizId}`;
    const analysisSnap = await adminDb.collection("analyses").doc(analysisDocId).get();

    if (!analysisSnap.exists) {
      return NextResponse.json({ error: "Analysis not found. Run analysis first." }, { status: 404 });
    }

    const analysisData = analysisSnap.data()!;
    if (analysisData.ownerId !== session.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const students: ModelStudentAnalysis[] = analysisData.modelOutput?.students ?? [];
    const student = students.find((s) => s.studentId === studentId);

    if (!student) {
      return NextResponse.json({ error: "Student not found in analysis" }, { status: 404 });
    }

    const emailMap: Record<string, string> = analysisData.emailMapping ?? {};
    const email = emailMap[studentId] ?? studentId;
    const displayName = email.split("@")[0].replace(/[._]/g, " ");
    const quizTitle = analysisData.analysisInput?.quizTitle ?? "Quiz";

    const context = buildNotePromptContext(student, displayName, quizTitle);
    const prompt = buildStudentNotePrompt(context);

    const client = new GoogleGenAI({ apiKey: resolveApiKey() });
    const response = await client.models.generateContent({
      model: NOTES_MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: NOTES_GENERATION_PROFILE.responseMimeType,
        responseJsonSchema: StudentNoteGenerationSchema,
        temperature: NOTES_GENERATION_PROFILE.temperature,
        topP: NOTES_GENERATION_PROFILE.topP,
        maxOutputTokens: NOTES_GENERATION_PROFILE.maxOutputTokens,
      },
    });

    const rawText = typeof response.text === "string" ? response.text : String(response.text ?? "");
    const note: StudentNoteOutput = JSON.parse(rawText);

    const noteDoc: StoredStudentNote = {
      courseId,
      quizId,
      studentId,
      generatedAt: Date.now(),
      modelId: NOTES_MODEL_ID,
      sourceAnalysisId: analysisDocId,
      status: "success",
      note,
    };

    const noteDocId = `${analysisDocId}_${studentId}`;
    await adminDb.collection("studentNotes").doc(noteDocId).set(noteDoc);

    return NextResponse.json({ success: true, note, noteDocId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
