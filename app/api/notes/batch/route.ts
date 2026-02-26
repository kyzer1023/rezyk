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
  type BatchNoteResult,
} from "@/lib/analysis/student-notes-schema";
import { ONLINE_MODEL_ID, type RiskLevel } from "@/lib/analysis/quiz-analysis-schema";

export const runtime = "nodejs";
export const maxDuration = 120;

const VALID_FILTERS = ["critical", "high", "medium", "low", "critical_high", "all"] as const;
type CategoryFilter = (typeof VALID_FILTERS)[number];

function matchesFilter(riskLevel: RiskLevel, filter: CategoryFilter): boolean {
  if (filter === "all") return true;
  if (filter === "critical_high") return riskLevel === "critical" || riskLevel === "high";
  return riskLevel === filter;
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const { courseId, quizId, categoryFilter = "critical_high" } = await req.json();

    if (!courseId || !quizId) {
      return NextResponse.json(
        { error: "courseId and quizId are required" },
        { status: 400 },
      );
    }

    if (!VALID_FILTERS.includes(categoryFilter)) {
      return NextResponse.json(
        { error: `Invalid categoryFilter. Must be one of: ${VALID_FILTERS.join(", ")}` },
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
    const allStudents = analysisData.modelOutput?.students ?? [];
    const emailMapping: Record<string, string> = analysisData.emailMapping ?? {};
    const analysisInput = analysisData.analysisInput;

    const courseSnap = await adminDb.collection("courses").doc(courseId).get();
    const courseName = courseSnap.exists ? (courseSnap.data()?.name ?? "Course") : "Course";

    const quizSnap = await adminDb.collection("quizzes").doc(analysisDocId).get();
    const quizTitle = quizSnap.exists ? (quizSnap.data()?.title ?? "Quiz") : "Quiz";

    const filteredStudents = allStudents.filter(
      (s: { riskLevel: RiskLevel }) => matchesFilter(s.riskLevel, categoryFilter as CategoryFilter),
    );

    const result: BatchNoteResult = {
      generated: 0,
      failed: 0,
      total: filteredStudents.length,
      notes: [],
      errors: [],
    };

    for (const studentAnalysis of filteredStudents) {
      const studentId = studentAnalysis.studentId;
      try {
        const email = emailMapping[studentId] ?? studentId;
        const displayName = email.split("@")[0].replace(/[._]/g, " ");
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

        const noteOutput = JSON.parse(rawText) as StudentNoteOutput;
        noteOutput.studentId = studentId;
        noteOutput.displayName = displayName;

        const noteId = `${analysisDocId}_${studentId}`;
        const savedNote: SavedStudentNote = {
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
        result.notes.push(savedNote);
        result.generated++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        result.errors.push({ studentId, error: errMsg });
        result.failed++;

        const noteId = `${analysisDocId}_${studentId}`;
        await adminDb.collection("studentNotes").doc(noteId).set({
          noteId,
          courseId,
          quizId,
          studentId,
          displayName: emailMapping[studentId]?.split("@")[0]?.replace(/[._]/g, " ") ?? studentId,
          note: null,
          generatedAt: Date.now(),
          modelId: ONLINE_MODEL_ID,
          sourceAnalysisId: analysisDocId,
          status: "error",
          error: errMsg,
          ownerId: session.sub,
        });
      }
    }

    return NextResponse.json({ success: true, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Batch note generation error:", msg);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
