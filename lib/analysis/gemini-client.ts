import { GoogleGenAI } from "@google/genai";
import { ONLINE_MODEL_ID, ONLINE_GENERATION_PROFILE, type JsonSchemaObject } from "./quiz-analysis-schema";

function resolveApiKey(): string {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
    process.env.GEMINI_API_KEY4,
    process.env.GEMINI_API_KEY5,
  ].filter((key): key is string => typeof key === "string" && key.length > 0);

  if (keys.length === 0) {
    throw new Error("No GEMINI_API_KEY configured");
  }

  return keys[Math.floor(Math.random() * keys.length)];
}

interface StructuredGenerationOptions {
  modelId?: string;
  temperature?: number;
  maxOutputTokens?: number;
  retry?: {
    attempts?: number;
    minDelayMs?: number;
    maxDelayMs?: number;
  };
}

export const TRANSIENT_RETRY_PROFILE = {
  attempts: 3,
  minDelayMs: 700,
  maxDelayMs: 5000,
} as const;

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return String(error ?? "Unknown generation error");
}

function isRetryableGenerationError(error: unknown): boolean {
  const message = toErrorMessage(error);
  return /UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|rate limit|quota|429|500|503|504|network|timed out|timeout|ECONNRESET|ETIMEDOUT/i.test(
    message,
  );
}

export async function generateStructuredContent(
  prompt: string,
  schema: JsonSchemaObject,
  options: StructuredGenerationOptions = {},
): Promise<string> {
  const totalAttempts = Math.max(1, options.retry?.attempts ?? 1);
  const minDelayMs = options.retry?.minDelayMs ?? TRANSIENT_RETRY_PROFILE.minDelayMs;
  const maxDelayMs = options.retry?.maxDelayMs ?? TRANSIENT_RETRY_PROFILE.maxDelayMs;
  let lastError: unknown;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    try {
      const client = new GoogleGenAI({ apiKey: resolveApiKey() });
      const response = await client.models.generateContent({
        model: options.modelId ?? ONLINE_MODEL_ID,
        contents: prompt,
        config: {
          responseMimeType: ONLINE_GENERATION_PROFILE.responseMimeType,
          responseJsonSchema: schema,
          temperature: options.temperature ?? 0.1,
          topP: ONLINE_GENERATION_PROFILE.topP,
          maxOutputTokens: options.maxOutputTokens ?? ONLINE_GENERATION_PROFILE.maxOutputTokens,
        },
      });

      return typeof response.text === "string" ? response.text : String(response.text ?? "");
    } catch (error) {
      lastError = error;
      const shouldRetry = attempt < totalAttempts && isRetryableGenerationError(error);
      if (!shouldRetry) {
        throw error;
      }

      const exponentialDelay = minDelayMs * (2 ** (attempt - 1));
      const boundedDelay = Math.min(maxDelayMs, exponentialDelay);
      const jitterMs = Math.floor(Math.random() * 250);
      await wait(boundedDelay + jitterMs);
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error(toErrorMessage(lastError));
}
