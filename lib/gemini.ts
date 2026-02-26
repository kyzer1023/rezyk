import { GoogleGenAI } from "@google/genai";
import { ONLINE_MODEL_ID, ONLINE_GENERATION_PROFILE, RETRY_TEMPERATURES } from "@/lib/analysis/quiz-analysis-schema";

function resolveApiKey(): string {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
    process.env.GEMINI_API_KEY4,
    process.env.GEMINI_API_KEY5,
  ].filter((k): k is string => !!k && k.length > 0);

  if (keys.length === 0) {
    throw new Error("No GEMINI_API_KEY configured");
  }

  return keys[Math.floor(Math.random() * keys.length)];
}

export type JsonSchemaObject = Record<string, unknown>;

export interface GeminiCallOptions {
  prompt: string;
  responseSchema?: JsonSchemaObject;
  modelId?: string;
}

export async function callGemini(options: GeminiCallOptions): Promise<string> {
  const apiKey = resolveApiKey();
  const client = new GoogleGenAI({ apiKey });
  const modelId = options.modelId ?? ONLINE_MODEL_ID;

  const response = await client.models.generateContent({
    model: modelId,
    contents: options.prompt,
    config: {
      responseMimeType: ONLINE_GENERATION_PROFILE.responseMimeType,
      responseJsonSchema: options.responseSchema,
      temperature: RETRY_TEMPERATURES[0],
      topP: ONLINE_GENERATION_PROFILE.topP,
    },
  });

  return typeof response.text === "string" ? response.text : String(response.text ?? "");
}

export { ONLINE_MODEL_ID };
