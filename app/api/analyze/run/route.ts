import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { GoogleGenAI } from "@google/genai";
import { buildQuizAnalysisPrompt } from "@/lib/analysis/quiz-analysis-prompt";
import {
  ModelOutputGenerationSchema,
  ONLINE_GENERATION_PROFILE,
  ONLINE_MODEL_ID,
  RETRY_TEMPERATURES,
  type QuizAnalysisInput,
  type QuizQuestionInput,
  type QuizStudentInput,
} from "@/lib/analysis/quiz-analysis-schema";
import { isRetryableValidationError, validateQuizAnalysisResponse } from "@/lib/analysis/quiz-analysis-validate";

export const runtime = "nodejs";
export const maxDuration = 60;

interface StoredQuestion {
  questionId: string;
  title: string;
  questionType: string;
  options: string[];
  correctAnswers: string[];
  maxScore: number;
}

interface StoredResponse {
  respondentEmail: string;
  totalScore: number;
  maxScore: number;
  answers: Record<string, { textAnswers: string[]; score: number }>;
}

function buildStudentId(index: number): string {
  return `student-${index + 1}`;
}

function buildAnalysisInput(
  quizId: string,
  quizTitle: string,
  storedQuestions: StoredQuestion[],
  responses: StoredResponse[],
): QuizAnalysisInput {
  const questions: QuizQuestionInput[] = storedQuestions.map((q, idx) => ({
    itemId: `item-${idx + 1}`,
    questionId: `Q${idx + 1}`,
    concept: q.title.slice(0, 80),
    questionText: q.title,
    questionType: q.questionType as QuizQuestionInput["questionType"],
    options: q.options,
    correctAnswers: q.correctAnswers,
    maxScore: q.maxScore || 1,
  }));

  const questionIdMap = new Map(
    storedQuestions.map((q, idx) => [q.questionId, `Q${idx + 1}`]),
  );

  const students: QuizStudentInput[] = responses.map((resp, idx) => {
    const studentId = buildStudentId(idx);
    const studentName = resp.respondentEmail.split("@")[0].replace(/[._]/g, " ");

    const attemptedQuestionIds: string[] = [];
    const incorrectQuestionIds: string[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const [rawQId, answer] of Object.entries(resp.answers)) {
      const mappedQId = questionIdMap.get(rawQId);
      if (!mappedQId) continue;

      attemptedQuestionIds.push(mappedQId);
      const qDef = storedQuestions.find((q) => q.questionId === rawQId);
      const qMax = qDef?.maxScore || 1;
      maxScore += qMax;
      totalScore += answer.score;

      if (answer.score < qMax) {
        incorrectQuestionIds.push(mappedQId);
      }
    }

    return {
      studentId,
      studentName,
      score: totalScore,
      maxScore: maxScore || resp.maxScore,
      attemptedQuestionIds,
      incorrectQuestionIds,
    };
  });

  return { quizId, quizTitle: quizTitle, questions, students };
}

function resolveApiKey(): { apiKey: string; source: string } {
  const keys = [
    { source: "GEMINI_API_KEY", value: process.env.GEMINI_API_KEY },
    { source: "GEMINI_API_KEY2", value: process.env.GEMINI_API_KEY2 },
    { source: "GEMINI_API_KEY3", value: process.env.GEMINI_API_KEY3 },
    { source: "GEMINI_API_KEY4", value: process.env.GEMINI_API_KEY4 },
    { source: "GEMINI_API_KEY5", value: process.env.GEMINI_API_KEY5 },
  ].filter((entry): entry is { source: string; value: string } => !!entry.value && entry.value.length > 0);

  if (keys.length === 0) {
    throw new Error("No GEMINI_API_KEY configured");
  }

  const selected = keys[Math.floor(Math.random() * keys.length)];
  return { apiKey: selected.value, source: selected.source };
}

function buildParseFailureContext(
  rawText: string,
  parseMessage: string | undefined,
): { position: number; snippet: string } | null {
  if (!parseMessage) {
    return null;
  }

  const match = parseMessage.match(/position\s+(\d+)/i);
  if (!match) {
    return null;
  }

  const position = Number.parseInt(match[1], 10);
  if (!Number.isFinite(position)) {
    return null;
  }

  const start = Math.max(0, position - 80);
  const end = Math.min(rawText.length, position + 80);
  const snippet = rawText
    .slice(start, end)
    .replace(/\s+/g, " ")
    .trim();

  return { position, snippet };
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toStringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function summarizeRawOutput(rawText: string): {
  startsWithBrace: boolean;
  endsWithBrace: boolean;
  endsWithBracket: boolean;
  openBraceCount: number;
  closeBraceCount: number;
} {
  const openBraceCount = (rawText.match(/\{/g) ?? []).length;
  const closeBraceCount = (rawText.match(/\}/g) ?? []).length;

  return {
    startsWithBrace: rawText.trimStart().startsWith("{"),
    endsWithBrace: rawText.trimEnd().endsWith("}"),
    endsWithBracket: rawText.trimEnd().endsWith("]"),
    openBraceCount,
    closeBraceCount,
  };
}

function extractResponseMeta(response: unknown): {
  candidateCount: number | null;
  finishReason: string | null;
  promptTokenCount: number | null;
  candidatesTokenCount: number | null;
  thoughtsTokenCount: number | null;
  totalTokenCount: number | null;
} {
  const responseRecord = toRecord(response);
  if (!responseRecord) {
    return {
      candidateCount: null,
      finishReason: null,
      promptTokenCount: null,
      candidatesTokenCount: null,
      thoughtsTokenCount: null,
      totalTokenCount: null,
    };
  }

  const candidatesRaw = responseRecord.candidates;
  const candidateCount = Array.isArray(candidatesRaw) ? candidatesRaw.length : null;

  let finishReason: string | null = null;
  if (Array.isArray(candidatesRaw) && candidatesRaw.length > 0) {
    const firstCandidate = toRecord(candidatesRaw[0]);
    finishReason = firstCandidate ? toStringValue(firstCandidate.finishReason) : null;
  }

  const usageMetadata = toRecord(responseRecord.usageMetadata);
  return {
    candidateCount,
    finishReason,
    promptTokenCount: usageMetadata ? toNumber(usageMetadata.promptTokenCount) : null,
    candidatesTokenCount: usageMetadata ? toNumber(usageMetadata.candidatesTokenCount) : null,
    thoughtsTokenCount: usageMetadata ? toNumber(usageMetadata.thoughtsTokenCount) : null,
    totalTokenCount: usageMetadata ? toNumber(usageMetadata.totalTokenCount) : null,
  };
}

function repairEmptyAffectedQuestions(
  rawText: string,
  fixture: QuizAnalysisInput,
): { repairedRawText: string; repairedMisconceptionCount: number } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return null;
  }

  const root = toRecord(parsed);
  if (!root || !Array.isArray(root.students)) {
    return null;
  }

  const fixtureStudentsById = new Map(
    fixture.students.map((student) => [
      student.studentId,
      student.incorrectQuestionIds.length > 0
        ? student.incorrectQuestionIds
        : student.attemptedQuestionIds,
    ]),
  );

  let repairedMisconceptionCount = 0;
  for (const studentEntry of root.students) {
    const studentRecord = toRecord(studentEntry);
    if (!studentRecord || !Array.isArray(studentRecord.misconceptions)) {
      continue;
    }

    const studentId = toStringValue(studentRecord.studentId);
    if (!studentId) {
      continue;
    }

    const fallbackQuestions = fixtureStudentsById.get(studentId) ?? [];
    if (fallbackQuestions.length === 0) {
      continue;
    }

    for (const misconceptionEntry of studentRecord.misconceptions) {
      const misconceptionRecord = toRecord(misconceptionEntry);
      if (!misconceptionRecord) {
        continue;
      }

      const affectedQuestions = misconceptionRecord.affectedQuestions;
      if (Array.isArray(affectedQuestions) && affectedQuestions.length === 0) {
        misconceptionRecord.affectedQuestions = [fallbackQuestions[0]];
        repairedMisconceptionCount += 1;
      }
    }
  }

  if (repairedMisconceptionCount === 0) {
    return null;
  }

  return {
    repairedRawText: JSON.stringify(root),
    repairedMisconceptionCount,
  };
}

export async function POST(req: Request) {
  try {
    const { session } = await requireAuth();
    const body = await req.json();
    const { courseId, quizId } = body;

    if (!courseId || !quizId) {
      return NextResponse.json({ error: "courseId and quizId are required" }, { status: 400 });
    }

    const docId = `${courseId}_${quizId}`;

    await adminDb.collection("quizzes").doc(docId).update({
      analysisStatus: "running",
    });

    const quizSnap = await adminDb.collection("quizzes").doc(docId).get();
    if (!quizSnap.exists) {
      return NextResponse.json({ error: "Quiz not found. Sync first." }, { status: 404 });
    }

    const quizData = quizSnap.data()!;
    const storedQuestions = (quizData.questions ?? []) as StoredQuestion[];
    const quizTitle = (quizData.title as string) ?? "Quiz";

    if (storedQuestions.length === 0) {
      return NextResponse.json({ error: "No questions found. Re-sync the quiz." }, { status: 400 });
    }

    const responsesSnap = await adminDb
      .collection("quizzes")
      .doc(docId)
      .collection("responses")
      .get();

    const responses: StoredResponse[] = responsesSnap.docs.map((doc) => doc.data() as StoredResponse);

    if (responses.length === 0) {
      return NextResponse.json({ error: "No student responses found. Re-sync the quiz." }, { status: 400 });
    }

    const analysisInput = buildAnalysisInput(docId, quizTitle, storedQuestions, responses);
    const prompt = buildQuizAnalysisPrompt(analysisInput);
    const { apiKey, source: apiKeySource } = resolveApiKey();
    const client = new GoogleGenAI({ apiKey });

    let rawText = "";
    let responseMeta: ReturnType<typeof extractResponseMeta> = {
      candidateCount: null,
      finishReason: null,
      promptTokenCount: null,
      candidatesTokenCount: null,
      thoughtsTokenCount: null,
      totalTokenCount: null,
    };
    let outputSummary = summarizeRawOutput("");
    let generationMeta = {
      candidateCount: responseMeta.candidateCount,
      finishReason: responseMeta.finishReason,
      promptTokenCount: responseMeta.promptTokenCount,
      candidatesTokenCount: responseMeta.candidatesTokenCount,
      thoughtsTokenCount: responseMeta.thoughtsTokenCount,
      totalTokenCount: responseMeta.totalTokenCount,
      startsWithBrace: outputSummary.startsWithBrace,
      endsWithBrace: outputSummary.endsWithBrace,
      endsWithBracket: outputSummary.endsWithBracket,
      openBraceCount: outputSummary.openBraceCount,
      closeBraceCount: outputSummary.closeBraceCount,
    };
    let validationResult: ReturnType<typeof validateQuizAnalysisResponse> | null = null;
    let attemptCount = 0;
    let repairedMisconceptionCount = 0;
    let generationTemperature: number = RETRY_TEMPERATURES[0];
    let maxOutputTokens: number = ONLINE_GENERATION_PROFILE.maxOutputTokens;

    for (let attempt = 0; attempt < RETRY_TEMPERATURES.length; attempt += 1) {
      const temperature = RETRY_TEMPERATURES[attempt];
      generationTemperature = temperature;
      attemptCount = attempt + 1;

      const geminiResponse = await client.models.generateContent({
        model: ONLINE_MODEL_ID,
        contents: prompt,
        config: {
          responseMimeType: ONLINE_GENERATION_PROFILE.responseMimeType,
          responseJsonSchema: ModelOutputGenerationSchema,
          temperature,
          topP: ONLINE_GENERATION_PROFILE.topP,
          maxOutputTokens,
        },
      });

      rawText = typeof geminiResponse.text === "string" ? geminiResponse.text : String(geminiResponse.text ?? "");
      responseMeta = extractResponseMeta(geminiResponse);
      outputSummary = summarizeRawOutput(rawText);
      generationMeta = {
        candidateCount: responseMeta.candidateCount,
        finishReason: responseMeta.finishReason,
        promptTokenCount: responseMeta.promptTokenCount,
        candidatesTokenCount: responseMeta.candidatesTokenCount,
        thoughtsTokenCount: responseMeta.thoughtsTokenCount,
        totalTokenCount: responseMeta.totalTokenCount,
        startsWithBrace: outputSummary.startsWithBrace,
        endsWithBrace: outputSummary.endsWithBrace,
        endsWithBracket: outputSummary.endsWithBracket,
        openBraceCount: outputSummary.openBraceCount,
        closeBraceCount: outputSummary.closeBraceCount,
      };

      validationResult = validateQuizAnalysisResponse(rawText, analysisInput);

      if (!validationResult.ok && validationResult.errorClass === "schema_fail") {
        const repairResult = repairEmptyAffectedQuestions(rawText, analysisInput);
        if (repairResult) {
          const repairedValidationResult = validateQuizAnalysisResponse(repairResult.repairedRawText, analysisInput);
          repairedMisconceptionCount += repairResult.repairedMisconceptionCount;

          if (repairedValidationResult.ok) {
            rawText = repairResult.repairedRawText;
            outputSummary = summarizeRawOutput(rawText);
            validationResult = repairedValidationResult;
          }
        }
      }

      const canRetry = validationResult.ok
        ? false
        : isRetryableValidationError(validationResult.errorClass) &&
          attempt < RETRY_TEMPERATURES.length - 1;

      if (!canRetry) {
        break;
      }

      if (!validationResult.ok && validationResult.errorClass === "parse_fail" && responseMeta.finishReason === "MAX_TOKENS") {
        maxOutputTokens = Math.max(maxOutputTokens * 2, 8192);
      }
    }

    if (!validationResult) {
      throw new Error("Analysis validation pipeline did not produce a result");
    }

    if (!validationResult.ok) {
      const diagnostics = validationResult.diagnostics.slice(0, 10).map((diagnostic) => ({
        path: diagnostic.path,
        message: diagnostic.message,
        ...(diagnostic.expected ? { expected: diagnostic.expected } : {}),
        ...(diagnostic.received ? { received: diagnostic.received } : {}),
      }));

      const parseFailureContext =
        validationResult.errorClass === "parse_fail"
          ? buildParseFailureContext(rawText, diagnostics[0]?.received)
          : null;

      const failureAuditBase = {
        at: Date.now(),
        errorClass: validationResult.errorClass,
        diagnostics,
        modelId: ONLINE_MODEL_ID,
        attemptCount,
        repairedMisconceptionCount,
        generationMeta,
        modelConfig: {
          temperature: generationTemperature,
          topP: ONLINE_GENERATION_PROFILE.topP,
          maxOutputTokens,
        },
        apiKeySource,
        promptLength: prompt.length,
        responseLength: rawText.length,
      };

      const analysisLastFailure = parseFailureContext
        ? {
            ...failureAuditBase,
            parseFailureContext,
          }
        : failureAuditBase;

      await adminDb.collection("quizzes").doc(docId).update({
        analysisStatus: "error",
        analysisLastFailure,
      });

      console.warn("Analysis validation failed", {
        docId,
        errorClass: validationResult.errorClass,
        diagnostics: diagnostics.slice(0, 3),
        modelId: ONLINE_MODEL_ID,
        attemptCount,
        repairedMisconceptionCount,
        apiKeySource,
        promptLength: prompt.length,
        responseLength: rawText.length,
        generationMeta,
        parseFailureContext,
      });

      return NextResponse.json({
        error: "Analysis validation failed",
        errorClass: validationResult.errorClass,
        diagnostics,
      }, { status: 422 });
    }

    const emailToStudentId = new Map(
      responses.map((resp, idx) => [buildStudentId(idx), resp.respondentEmail]),
    );

    await adminDb.collection("analyses").doc(docId).set({
      quizId: docId,
      courseId,
      courseWorkId: quizId,
      modelOutput: JSON.parse(JSON.stringify(validationResult.modelOutput)),
      derivedAnalysis: JSON.parse(JSON.stringify(validationResult.derivedAnalysis)),
      analysisInput: JSON.parse(JSON.stringify(analysisInput)),
      emailMapping: Object.fromEntries(emailToStudentId),
      createdAt: Date.now(),
      modelId: ONLINE_MODEL_ID,
      ownerId: session.sub,
    });

    await adminDb.collection("quizzes").doc(docId).update({
      analysisStatus: "completed",
    });

    return NextResponse.json({
      success: true,
      summary: {
        studentsAnalyzed: validationResult.modelOutput.students.length,
        riskDistribution: validationResult.derivedAnalysis.riskDistribution,
        scoreMetrics: validationResult.derivedAnalysis.scoreMetrics,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Analysis error:", msg);
    const status = msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
