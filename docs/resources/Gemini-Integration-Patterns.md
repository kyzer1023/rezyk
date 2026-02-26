# Gemini Integration Patterns

Date: 2026-02-26

## Client Library

Package: `@google/genai` (GoogleGenAI)
Reference: https://ai.google.dev/gemini-api/docs/structured-output

## Model

Production model: `gemini-3-flash-preview`
Configured in: `lib/analysis/quiz-analysis-schema.ts`

## API Key Rotation

Multiple keys supported via `GEMINI_API_KEY` through `GEMINI_API_KEY5`.
Random key selected per request to distribute quota.

```ts
function resolveApiKey(): string {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY2,
    // ...up to GEMINI_API_KEY5
  ].filter((k): k is string => !!k && k.length > 0);
  return keys[Math.floor(Math.random() * keys.length)];
}
```

## Structured Output Pattern

The project uses a two-schema approach:

1. **Generation schema** (`ModelOutputGenerationSchema`): Flatter, less strict schema sent to Gemini to avoid API-side depth/complexity rejections.
2. **Validation schema** (`ModelOutputSchema`): Full strict schema enforced locally via custom validation.

### Request Configuration

```ts
const response = await client.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: promptString,
  config: {
    responseMimeType: "application/json",
    responseJsonSchema: generationSchema,
    temperature: 0.1,
    topP: 0.9,
    maxOutputTokens: 4096,
  },
});
```

### Response Handling

```ts
const rawText = typeof response.text === "string"
  ? response.text
  : String(response.text ?? "");
const parsed = JSON.parse(rawText);
```

## Validation Strategy

Multi-stage validation pipeline:
1. **Parse** — JSON.parse the raw text
2. **Schema** — Validate shape (required fields, types, enums)
3. **Semantic** — Validate business rules (student IDs match input, question IDs valid, no duplicates)
4. **Runtime** — Compute derived metrics and validate their shape

## Prompt Best Practices (observed in codebase)

- System instruction as first line (role statement)
- Explicit output format instructions ("Return strict JSON only, no markdown fences")
- Enumerated allowed values for all enum fields
- Hard constraints listed explicitly
- Input data appended as JSON at the end
- Temperature 0.1 for consistency, 0.0 on retry

## Firestore Document ID Convention

Composite keys: `${courseId}_${quizId}` for quizzes and analyses.
Student IDs: `student-${email.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`

## Adding New Gemini Features

When adding a new AI-powered feature:
1. Define TypeScript interfaces for input/output in a schema file
2. Create a flat generation schema for the Gemini request
3. Build a prompt function that includes clear instructions and input data
4. Validate the response with a multi-stage pipeline
5. Store results in Firestore with metadata (modelId, createdAt, ownerId)
6. Use the same `resolveApiKey()` pattern for key rotation
