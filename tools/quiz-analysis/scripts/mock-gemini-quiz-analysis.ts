import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { GoogleGenAI } from "@google/genai";
import { buildQuizAnalysisPrompt } from "../../../lib/analysis/quiz-analysis-prompt";
import {
  FORMS_QUESTION_TYPES,
  ModelOutputGenerationSchema,
  ONLINE_GENERATION_PROFILE,
  ONLINE_MODEL_ID,
  RETRY_TEMPERATURES,
  type DerivedAnalysis,
  type ModelOutput,
  type QuizAnalysisInput,
} from "../../../lib/analysis/quiz-analysis-schema";
import {
  validateQuizAnalysisResponse,
  type ValidationErrorClass,
  type ValidatorDiagnostic,
} from "../../../lib/analysis/quiz-analysis-validate";

const FIXTURE_RELATIVE_PATH = "tools/quiz-analysis/mock-quiz-input.json" as const;
const ARTIFACT_DIR_RELATIVE_PATH = "tools/quiz-analysis/outputs" as const;
const RESPONSE_SCHEMA_ID = "eduinsight.quiz-analysis.model-output.generation.v1" as const;

interface NumberedApiKeyCandidate {
  keyName: string;
  apiKey: string;
  ordinal: number;
}

interface ArtifactValidationSummary {
  errorClass: ValidationErrorClass | "transport_fail" | null;
  diagnostics: ValidatorDiagnostic[];
}

interface QuizAnalysisResponseArtifact {
  generatedAt: string;
  modelId: string;
  apiKeySource: string;
  fixturePath: string;
  requestConfig: {
    responseMimeType: string;
    responseSchemaId: string;
    temperature: number;
    topP: number;
    callsPerRun: number;
  };
  promptPreview: string;
  rawResponseText: string;
  parsedResponse: unknown | null;
  validation: ArtifactValidationSummary;
  modelOutput: ModelOutput | null;
  derivedAnalysis: DerivedAnalysis | null;
  transportError: string | null;
}

function parseArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

function parseModelId(): string {
  return parseArg("--model") ?? ONLINE_MODEL_ID;
}

function parseOutputPath(): string | undefined {
  return parseArg("--output");
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

function resolveFirstApiKey(): { keyName: string; apiKey: string } {
  const csvPoolVarName = process.env.GEMINI_API_KEY_POOL ? "GEMINI_API_KEY_POOL" : "GEMINI_API_KEYS";
  const csvPoolRaw = process.env[csvPoolVarName];
  if (csvPoolRaw) {
    const poolKeys = csvPoolRaw
      .split(",")
      .map((value) => sanitizeApiKey(value))
      .filter((value) => value.length > 0);
    if (poolKeys.length > 0) {
      return { keyName: `${csvPoolVarName}[1]`, apiKey: poolKeys[0] };
    }
  }

  const numberedCandidates = [
    ...collectNumberedApiKeys(/^GEMINI_API_KEY\d+$/),
    ...collectNumberedApiKeys(/^GEMINI_API_KEY_\d+$/),
  ].sort((left, right) => left.ordinal - right.ordinal || left.keyName.localeCompare(right.keyName));
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

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown runtime error.";
  }
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
    throw new Error(
      `Failed to parse fixture JSON (${FIXTURE_RELATIVE_PATH}): ${errorMessage(error)}`,
    );
  }

  if (!isQuizAnalysisInput(parsed)) {
    throw new Error(`Fixture payload shape is invalid for quiz analysis: ${FIXTURE_RELATIVE_PATH}`);
  }

  return parsed;
}

function safeParseJson(rawText: string): unknown | null {
  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

function buildPromptPreview(prompt: string): string {
  const PREVIEW_LIMIT = 2400;
  if (prompt.length <= PREVIEW_LIMIT) {
    return prompt;
  }
  return `${prompt.slice(0, PREVIEW_LIMIT)}\n... (truncated)`;
}

async function writeArtifact(
  artifact: QuizAnalysisResponseArtifact,
  outputPathArg?: string,
): Promise<string> {
  if (outputPathArg) {
    const absolutePath = path.isAbsolute(outputPathArg)
      ? outputPathArg
      : path.resolve(process.cwd(), outputPathArg);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
    return absolutePath;
  }

  const artifactDir = path.resolve(process.cwd(), ARTIFACT_DIR_RELATIVE_PATH);
  await mkdir(artifactDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const artifactPath = path.join(artifactDir, `quiz-analysis-response-${stamp}.json`);
  await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  return artifactPath;
}

async function main(): Promise<void> {
  const modelId = parseModelId();
  const outputPathArg = parseOutputPath();
  const { keyName, apiKey } = resolveFirstApiKey();
  const fixtureInput = await readFixtureInput();
  const prompt = buildQuizAnalysisPrompt(fixtureInput);
  const client = new GoogleGenAI({ apiKey });

  let rawResponseText = "";
  let parsedResponse: unknown | null = null;
  let validationSummary: ArtifactValidationSummary = {
    errorClass: null,
    diagnostics: [],
  };
  let modelOutput: ModelOutput | null = null;
  let derivedAnalysis: DerivedAnalysis | null = null;
  let transportError: string | null = null;

  try {
    const response = await client.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: ONLINE_GENERATION_PROFILE.responseMimeType,
        responseJsonSchema: ModelOutputGenerationSchema,
        temperature: RETRY_TEMPERATURES[0],
        topP: ONLINE_GENERATION_PROFILE.topP,
      },
    });

    rawResponseText = typeof response.text === "string" ? response.text : String(response.text ?? "");
    parsedResponse = safeParseJson(rawResponseText);

    const validationResult = validateQuizAnalysisResponse(rawResponseText, fixtureInput);
    if (validationResult.ok) {
      modelOutput = validationResult.modelOutput;
      derivedAnalysis = validationResult.derivedAnalysis;
    } else {
      validationSummary = {
        errorClass: validationResult.errorClass,
        diagnostics: validationResult.diagnostics,
      };
    }
  } catch (error) {
    transportError = errorMessage(error);
    validationSummary = {
      errorClass: "transport_fail",
      diagnostics: [
        {
          path: "$",
          message: "Gemini API transport/runtime error.",
          received: transportError,
        },
      ],
    };
  }

  const artifact: QuizAnalysisResponseArtifact = {
    generatedAt: new Date().toISOString(),
    modelId,
    apiKeySource: keyName,
    fixturePath: FIXTURE_RELATIVE_PATH,
    requestConfig: {
      responseMimeType: ONLINE_GENERATION_PROFILE.responseMimeType,
      responseSchemaId: RESPONSE_SCHEMA_ID,
      temperature: RETRY_TEMPERATURES[0],
      topP: ONLINE_GENERATION_PROFILE.topP,
      callsPerRun: 1,
    },
    promptPreview: buildPromptPreview(prompt),
    rawResponseText,
    parsedResponse,
    validation: validationSummary,
    modelOutput,
    derivedAnalysis,
    transportError,
  };

  const artifactPath = await writeArtifact(artifact, outputPathArg);

  console.log("Gemini quiz analysis response artifact written.");
  console.log(`Artifact: ${artifactPath}`);
  console.log(`Model: ${modelId}`);
  console.log(`API key source: ${keyName}`);
  console.log(`Fixture: ${FIXTURE_RELATIVE_PATH}`);
  if (validationSummary.errorClass) {
    console.log(`Diagnostics class: ${validationSummary.errorClass}`);
    console.log(`Diagnostics count: ${validationSummary.diagnostics.length}`);
  } else {
    console.log("Diagnostics count: 0");
  }

  if (transportError) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Quiz analysis script runtime error:", errorMessage(error));
  process.exitCode = 1;
});
