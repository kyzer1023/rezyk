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
  type BatchFilter,
  filterStudentsByCategory,
} from "@/lib/analysis/student-notes-schema";
import { buildStudentNotePrompt, buildNotePromptContext } from "@/lib/analysis/student-notes-prompt";
import type { ModelStudentAnalysis } from "@/lib/analysis/quiz-analysis-schema";

export const runtime = "nodejs";
export const maxDuration = 120;

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
    const { courseId, quizId, filter = "critical+high" } = body as {
      courseId?: string;
      quizId?: string;
      filter?: BatchFilter;
    };

    if (!courseId || !quizId) {
      return NextResponse.json(
        { error: "courseId and quizId are required" },
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

    const allStudents: ModelStudentAnalysis[] = analysisData.modelOutput?.students ?? [];
    const filtered = filterStudentsByCategory(allStudents, filter);

    if (filtered.length === 0) {
      return NextResponse.json({
        success: true,
        generated: 0,
        failed: 0,
        results: [],
        message: `No students match the "${filter}" filter.`,
      });
    }

    const emailMap: Record<string, string> = analysisData.emailMapping ?? {};
    const quizTitle = analysisData.analysisInput?.quizTitle ?? "Quiz";

    const results: Array<{
      studentId: string;
      status: "success" | "error";
      note?: StudentNoteOutput;
      error?: string;
    }> = [];

    for (const studentRef of filtered) {
      const student = allStudents.find((s) => s.studentId === studentRef.studentId);
      if (!student) {
        results.push({ studentId: studentRef.studentId, status: "error", error: "Student data not found" });
        continue;
      }

      try {
        const email = emailMap[student.studentId] ?? student.studentId;
        const displayName = email.split("@")[0].replace(/[._]/g, " ");
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
          studentId: student.studentId,
          generatedAt: Date.now(),
          modelId: NOTES_MODEL_ID,
          sourceAnalysisId: analysisDocId,
          status: "success",
          note,
        };

        const noteDocId = `${analysisDocId}_${student.studentId}`;
        await adminDb.collection("studentNotes").doc(noteDocId).set(noteDoc);

        results.push({ studentId: student.studentId, status: "success", note });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ studentId: student.studentId, status: "error", error: msg });

        const failDoc: StoredStudentNote = {
          courseId,
          quizId,
          studentId: student.studentId,
          generatedAt: Date.now(),
          modelId: NOTES_MODEL_ID,
          sourceAnalysisId: analysisDocId,
          status: "error",
          error: msg,
        };
        const noteDocId = `${analysisDocId}_${student.studentId}`;
        await adminDb.collection("studentNotes").doc(noteDocId).set(failDoc).catch(() => {});
      }
    }

    const generated = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "error").length;

    return NextResponse.json({ success: true, generated, failed, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
