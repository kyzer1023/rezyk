import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { GoogleGenAI } from "@google/genai";
import { buildQuizAnalysisPrompt } from "../../../lib/analysis/quiz-analysis-prompt";
import {
  FORMS_QUESTION_TYPES,
  ModelOutputGenerationSchema,
  ONLINE_GENERATION_PROFILE,
  RETRY_TEMPERATURES,
  type DerivedAnalysis,
  type ModelOutput,
  type QuizAnalysisInput,
} from "../../../lib/analysis/quiz-analysis-schema";
import {
  validateQuizAnalysisResponse,
  type ValidatorDiagnostic,
} from "../../../lib/analysis/quiz-analysis-validate";

const MODEL_ID = "gemini-2.5-flash-lite" as const;
const FIXTURE_RELATIVE_PATH = "tools/quiz-analysis/mock-quiz-input.json" as const;

interface NumberedApiKeyCandidate {
  keyName: string;
  apiKey: string;
  ordinal: number;
}

function sanitizeApiKey(rawValue: string): string {
  const trimmed = rawValue.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function extractTrailingNumber(value: string): number {
  const match = value.match(/(\d+)$/);
  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Number(match[1]);
}

function collectNumberedApiKeys(regex: RegExp): NumberedApiKeyCandidate[] {
  const candidates: NumberedApiKeyCandidate[] = [];
  for (const keyName of Object.keys(process.env)) {
    if (!regex.test(keyName)) {
      continue;
    }
    const rawValue = process.env[keyName];
    if (!rawValue) {
      continue;
    }
    const apiKey = sanitizeApiKey(rawValue);
    if (apiKey.length === 0) {
      continue;
    }
    candidates.push({
      keyName,
      apiKey,
      ordinal: extractTrailingNumber(keyName),
    });
  }
  return candidates;
}

function resolveLastApiKey(): { keyName: string; apiKey: string } {
  const csvPoolVarName = process.env.GEMINI_API_KEY_POOL ? "GEMINI_API_KEY_POOL" : "GEMINI_API_KEYS";
  const csvPoolRaw = process.env[csvPoolVarName];
  if (csvPoolRaw) {
    const poolKeys = csvPoolRaw
      .split(",")
      .map((value) => sanitizeApiKey(value))
      .filter((value) => value.length > 0);
    if (poolKeys.length > 0) {
      const lastIndex = poolKeys.length - 1;
      return { keyName: `${csvPoolVarName}[${String(lastIndex + 1)}]`, apiKey: poolKeys[lastIndex] };
    }
  }

  const numberedCandidates = [
    ...collectNumberedApiKeys(/^GEMINI_API_KEY\d+$/),
    ...collectNumberedApiKeys(/^GEMINI_API_KEY_\d+$/),
  ].sort((left, right) => right.ordinal - left.ordinal);
  if (numberedCandidates.length > 0) {
    const winner = numberedCandidates[0];
    return { keyName: winner.keyName, apiKey: winner.apiKey };
  }

  const directCandidates: Array<[string, string | undefined]> = [
    ["GEMINI_API_KEY", process.env.GEMINI_API_KEY],
    ["GOOGLE_API_KEY", process.env.GOOGLE_API_KEY],
  ];

  for (const [keyName, rawValue] of directCandidates) {
    if (!rawValue) {
      continue;
    }
    const apiKey = sanitizeApiKey(rawValue);
    if (apiKey.length > 0) {
      return { keyName, apiKey };
    }
  }

  throw new Error(
    "Missing Gemini API key. Set GEMINI_API_KEY_POOL/GEMINI_API_KEYS or GEMINI_API_KEY (or numbered variants).",
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isFormsQuestionType(value: unknown): boolean {
  return (
    typeof value === "string" &&
    FORMS_QUESTION_TYPES.includes(value as (typeof FORMS_QUESTION_TYPES)[number])
  );
}

function isQuizAnalysisInput(value: unknown): value is QuizAnalysisInput {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.quizId !== "string" || typeof value.quizTitle !== "string") {
    return false;
  }

  if (!Array.isArray(value.questions) || value.questions.length === 0) {
    return false;
  }

  const hasValidQuestions = value.questions.every((question) => {
    if (!isRecord(question)) {
      return false;
    }
    return (
      typeof question.itemId === "string" &&
      typeof question.questionId === "string" &&
      typeof question.concept === "string" &&
      typeof question.questionText === "string" &&
      isFormsQuestionType(question.questionType) &&
      isStringArray(question.options) &&
      isStringArray(question.correctAnswers) &&
      typeof question.maxScore === "number"
    );
  });
  if (!hasValidQuestions) {
    return false;
  }

  if (!Array.isArray(value.students) || value.students.length === 0) {
    return false;
  }

  return value.students.every((student) => {
    if (!isRecord(student)) {
      return false;
    }
    return (
      typeof student.studentId === "string" &&
      typeof student.studentName === "string" &&
      typeof student.score === "number" &&
      typeof student.maxScore === "number" &&
      isStringArray(student.attemptedQuestionIds) &&
      isStringArray(student.incorrectQuestionIds)
    );
  });
}

async function readFixtureInput(): Promise<QuizAnalysisInput> {
  const fixturePath = path.resolve(process.cwd(), FIXTURE_RELATIVE_PATH);
  const raw = await readFile(fixturePath, "utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown parse error.";
    throw new Error(`Failed to parse fixture JSON (${FIXTURE_RELATIVE_PATH}): ${message}`);
  }

  if (!isQuizAnalysisInput(parsed)) {
    throw new Error(`Fixture payload shape is invalid for smoke test: ${FIXTURE_RELATIVE_PATH}`);
  }

  return parsed;
}

function formatDiagnostics(diagnostics: ValidatorDiagnostic[]): string {
  if (diagnostics.length === 0) {
    return "- No diagnostics.";
  }
  return diagnostics
    .map((diagnostic) => {
      const parts = [`${diagnostic.path}: ${diagnostic.message}`];
      if (diagnostic.expected) {
        parts.push(`expected=${diagnostic.expected}`);
      }
      if (diagnostic.received) {
        parts.push(`received=${diagnostic.received}`);
      }
      return `- ${parts.join(" | ")}`;
    })
    .join("\n");
}

function printInsightSummary(modelOutput: ModelOutput, derivedAnalysis: DerivedAnalysis): void {
  const priorityStudents = modelOutput.students
    .filter((student) => student.riskLevel === "critical" || student.riskLevel === "high")
    .map((student) => student.studentId);

  console.log("Derived insight summary:");
  console.log(
    JSON.stringify(
      {
        riskDistribution: derivedAnalysis.riskDistribution,
        scoreMetrics: derivedAnalysis.scoreMetrics,
        topConceptHeatmap: derivedAnalysis.conceptHeatmap.slice(0, 3),
        errorTypeBreakdown: derivedAnalysis.errorTypeBreakdown,
        priorityStudents,
      },
      null,
      2,
    ),
  );
}

async function main(): Promise<void> {
  const { keyName, apiKey } = resolveLastApiKey();
  const fixtureInput = await readFixtureInput();
  const prompt = buildQuizAnalysisPrompt(fixtureInput);
  const client = new GoogleGenAI({ apiKey });

  console.log("=== Gemini Detailed Structured Output Smoke Test ===");
  console.log(`Model: ${MODEL_ID}`);
  console.log(`API key env source: ${keyName}`);
  console.log(`Input fixture: ${FIXTURE_RELATIVE_PATH}`);
  console.log("Output schema: ModelOutputGenerationSchema");
  console.log("Calls per run: 1");

  const response = await client.models.generateContent({
    model: MODEL_ID,
    contents: prompt,
    config: {
      responseMimeType: ONLINE_GENERATION_PROFILE.responseMimeType,
      responseJsonSchema: ModelOutputGenerationSchema,
      temperature: RETRY_TEMPERATURES[0],
      topP: ONLINE_GENERATION_PROFILE.topP,
      maxOutputTokens: ONLINE_GENERATION_PROFILE.maxOutputTokens,
    },
  });

  const rawModelOutput = typeof response.text === "string" ? response.text : String(response.text ?? "");
  if (rawModelOutput.length === 0) {
    throw new Error("Gemini returned an empty response.");
  }

  const validation = validateQuizAnalysisResponse(rawModelOutput, fixtureInput);
  if (!validation.ok) {
    throw new Error(
      `Validation failed (${validation.errorClass}).\n${formatDiagnostics(validation.diagnostics)}\nRaw output:\n${rawModelOutput}`,
    );
  }

  console.log("Structured output check: PASS");
  console.log(`Students analyzed: ${validation.modelOutput.students.length}`);
  printInsightSummary(validation.modelOutput, validation.derivedAnalysis);
  console.log("Model output JSON:");
  console.log(JSON.stringify(validation.modelOutput, null, 2));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Structured output check: FAIL");
  console.error(message);
  process.exitCode = 1;
});
