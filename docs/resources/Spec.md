# Gemini Quiz Analysis Spec

Date: 2026-02-25

## Scope (Current Phase)

This phase focuses on script-driven structured-output checks only:

- scripts live in `tools/quiz-analysis/scripts/`
- fixture input lives at `tools/quiz-analysis/mock-quiz-input.json`
- generated artifacts are written to `tools/quiz-analysis/outputs/`
- analysis contracts stay in `lib/analysis/`

Out of scope:

- API routes
- Firestore writes
- frontend/dashboard integration

## Script Inventory

### 1) `mock-gemini-quiz-analysis.ts`

Purpose:

- make one Gemini structured-output call
- validate the response with local schema + semantic validation
- write one JSON artifact per run

CLI options:

- `--model <model-id>`: overrides default `ONLINE_MODEL_ID`
- `--output <path>`: optional explicit output file path

Default artifact location:

- `tools/quiz-analysis/outputs/quiz-analysis-response-<timestamp>.json`

### 2) `smoke-gemini-structured-output.ts`

Purpose:

- run one strict structured-output smoke check
- print PASS/FAIL + derived summary to terminal
- no artifact file is written by default

Pinned model in smoke script:

- `gemini-2.5-flash-lite`

## Output Contract and Validation

- request schema sent to Gemini:
  - `ModelOutputGenerationSchema` from `lib/analysis/quiz-analysis-schema.ts`
- request mode:
  - `responseMimeType: "application/json"`
  - `responseJsonSchema: ModelOutputGenerationSchema`
- post-response gate:
  - `validateQuizAnalysisResponse` in `lib/analysis/quiz-analysis-validate.ts`
  - includes schema + semantic checks before considering a run valid

## Mock Fixture Baseline (Human Review Guide)

Given `tools/quiz-analysis/mock-quiz-input.json`, expected tendencies:

1. Fraction Division should appear as a recurring gap (`Q3`, `Q7`), especially for `student-1`, `student-2`, `student-6`.
2. Decimal Conversion should appear as a recurring gap (`Q5`, `Q8`), especially for `student-1`, `student-3`, `student-4`, `student-5`, `student-6`.
3. Word Problems should appear as transfer/application weakness (`Q9`, `Q10`), especially for `student-1`, `student-2`, `student-3`, `student-5`.
4. Higher-priority intervention candidates should generally start from lower scorers (`student-1`, `student-2`, then `student-3`).
5. Evidence text should reference concrete question context, not only abstract concept labels.

Sanity cues:

- every fixture student appears exactly once
- `affectedQuestions` only contains known fixture question IDs
- interventions are short and teacher-actionable
- rationale connects score + error pattern to risk level

## Run Commands

- `bun run analysis:quiz-harness`
- `bun run analysis:quiz-harness -- --model gemini-2.5-flash-lite`
- `bun run analysis:quiz-harness -- --output tools/quiz-analysis/outputs/manual-run.json`
- `bun run analysis:structured-smoke`
