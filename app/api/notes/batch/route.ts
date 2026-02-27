import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { generateStructuredContent, TRANSIENT_RETRY_PROFILE } from "@/lib/analysis/gemini-client";
import { buildStudentNotePrompt } from "@/lib/analysis/student-notes-prompt";
import {
  BATCH_CATEGORY_FILTERS,
  STUDENT_NOTES_GENERATION_PROFILE,
  STUDENT_NOTES_MODEL_ID,
  StudentNoteGenerationSchema,
  type BatchCategoryFilter,
  type BatchNoteResultItem,
  type SavedStudentNote,
  type StudentNoteInput,
  type StudentNoteOutput,
} from "@/lib/analysis/student-notes-schema";
import type { ModelStudentAnalysis } from "@/lib/analysis/quiz-analysis-schema";

export const runtime = "nodejs";
export const maxDuration = 180;

interface AnalysisInputStudent {
  studentId: string;
  score: number;
  maxScore: number;
}

function isSupportedFilter(filter: string): filter is BatchCategoryFilter {
  return (BATCH_CATEGORY_FILTERS as string[]).includes(filter);
}

function matchesFilter(riskLevel: string, filter: BatchCategoryFilter): boolean {
  if (filter === "all") return true;
  if (filter === "critical_high" || filter === "critical+high") {
    return riskLevel === "critical" || riskLevel === "high";
  }
  return riskLevel === filter;
}

function toFriendlyGenerationError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const normalized = raw.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "Generation failed.";
  }

  try {
    const parsed = JSON.parse(normalized) as { error?: { message?: string; status?: string } };
    if (parsed?.error) {
      const message =
        typeof parsed.error.message === "string" && parsed.error.message.trim().length > 0
          ? parsed.error.message.trim()
          : "";
      const status =
        typeof parsed.error.status === "string" && parsed.error.status.trim().length > 0
          ? parsed.error.status.trim()
          : "";
      const combined = `${message}${status ? ` (${status})` : ""}`.trim();
      if (combined.length > 0) {
        return combined;
      }
    }
  } catch {
    // Keep normalization silent; fallback to pattern checks below.
  }

  if (/UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|rate limit|quota|429|503/i.test(normalized)) {
    return "Model is currently busy. Please retry shortly.";
  }
  if (/network|timeout|timed out|ECONNRESET|ETIMEDOUT/i.test(normalized)) {
    return "Temporary network issue while generating the asset.";
  }
  if (/Unexpected token|JSON/i.test(normalized)) {
    return "Model returned an invalid response format.";
  }

  return normalized.length > 200 ? `${normalized.slice(0, 197)}...` : normalized;
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const { courseId, quizId, categoryFilter = "critical+high" } = (await req.json()) as {
      courseId?: string;
      quizId?: string;
      categoryFilter?: string;
    };

    if (!courseId || !quizId) {
      return NextResponse.json(
        { error: "courseId and quizId are required" },
        { status: 400 },
      );
    }

    if (!isSupportedFilter(categoryFilter)) {
      return NextResponse.json(
        { error: `Invalid categoryFilter. Must be one of: ${BATCH_CATEGORY_FILTERS.join(", ")}` },
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

    const analysisData = analysisSnap.data();
    if (!analysisData || analysisData.ownerId !== session.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courseSnap = await adminDb.collection("courses").doc(courseId).get();
    const courseName = courseSnap.exists ? (courseSnap.data()?.name ?? "Course") : "Course";

    const quizSnap = await adminDb.collection("quizzes").doc(analysisDocId).get();
    const quizTitle = quizSnap.exists ? (quizSnap.data()?.title ?? "Quiz") : "Quiz";

    const students = (analysisData.modelOutput?.students ?? []) as ModelStudentAnalysis[];
    const analysisInputStudents = (analysisData.analysisInput?.students ?? []) as AnalysisInputStudent[];
    const emailMapping = (analysisData.emailMapping ?? {}) as Record<string, string>;

    const filteredStudents = students.filter((entry) =>
      matchesFilter(entry.riskLevel, categoryFilter),
    );

    if (filteredStudents.length === 0) {
      return NextResponse.json({
        success: true,
        generated: 0,
        failed: 0,
        total: 0,
        results: [] as BatchNoteResultItem[],
      });
    }

    const results: BatchNoteResultItem[] = [];
    let generated = 0;
    let failed = 0;

    for (const studentAnalysis of filteredStudents) {
      const studentId = studentAnalysis.studentId;
      const email = emailMapping[studentId] ?? studentId;
      const displayName = email.split("@")[0].replace(/[._]/g, " ");
      const sourceStudent = analysisInputStudents.find((entry) => entry.studentId === studentId);
      const noteId = `${analysisDocId}_${studentId}`;

      try {
        const noteInput: StudentNoteInput = {
          studentId,
          displayName,
          riskLevel: studentAnalysis.riskLevel,
          score: sourceStudent?.score ?? 0,
          maxScore: sourceStudent?.maxScore ?? 0,
          misconceptions: studentAnalysis.misconceptions,
          interventions: studentAnalysis.interventions,
          rationale: studentAnalysis.rationale,
          quizTitle,
          courseName,
        };

        const prompt = buildStudentNotePrompt(noteInput);
        const rawText = await generateStructuredContent(prompt, StudentNoteGenerationSchema, {
          modelId: STUDENT_NOTES_MODEL_ID,
          temperature: STUDENT_NOTES_GENERATION_PROFILE.temperature,
          maxOutputTokens: STUDENT_NOTES_GENERATION_PROFILE.maxOutputTokens,
          retry: {
            attempts: TRANSIENT_RETRY_PROFILE.attempts,
            minDelayMs: TRANSIENT_RETRY_PROFILE.minDelayMs,
            maxDelayMs: TRANSIENT_RETRY_PROFILE.maxDelayMs,
          },
        });

        const noteOutput = JSON.parse(rawText) as StudentNoteOutput;
        noteOutput.studentId = studentId;
        noteOutput.displayName = displayName;

        const savedNote: SavedStudentNote = {
          noteId,
          courseId,
          quizId,
          studentId,
          displayName,
          note: noteOutput,
          generatedAt: Date.now(),
          modelId: STUDENT_NOTES_MODEL_ID,
          sourceAnalysisId: analysisDocId,
          status: "success",
          ownerId: session.sub,
        };

        await adminDb.collection("studentNotes").doc(noteId).set(savedNote);
        results.push({ studentId, status: "success" });
        generated += 1;
      } catch (error) {
        const message = toFriendlyGenerationError(error);

        const failedNote: SavedStudentNote = {
          noteId,
          courseId,
          quizId,
          studentId,
          displayName,
          note: null,
          generatedAt: Date.now(),
          modelId: STUDENT_NOTES_MODEL_ID,
          sourceAnalysisId: analysisDocId,
          status: "error",
          error: message,
          ownerId: session.sub,
        };
        await adminDb.collection("studentNotes").doc(noteId).set(failedNote);

        results.push({ studentId, status: "error", error: message });
        failed += 1;
      }
    }

    return NextResponse.json({
      success: true,
      generated,
      failed,
      total: filteredStudents.length,
      results,
    });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    const status = rawMessage === "MISSING_AUTH" ? 401 : 500;
    const message = status === 401 ? rawMessage : toFriendlyGenerationError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
