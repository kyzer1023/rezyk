import { GoogleGenAI } from "@google/genai";
import { ONLINE_MODEL_ID, type JsonSchemaObject } from "./quiz-analysis-schema";

export function resolveApiKey(): string {
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

export async function generateStructuredContent(
  prompt: string,
  schema: JsonSchemaObject,
  options?: { temperature?: number; maxOutputTokens?: number },
): Promise<string> {
  const apiKey = resolveApiKey();
  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model: ONLINE_MODEL_ID,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: schema,
      temperature: options?.temperature ?? 0.1,
      topP: 0.9,
      maxOutputTokens: options?.maxOutputTokens ?? 4096,
    },
  });

  return typeof response.text === "string"
    ? response.text
    : String(response.text ?? "");
}
