# Quiz Analysis Workspace

This directory keeps all quiz-analysis script assets in one place.

## Structure

- `scripts/`
  - `mock-gemini-quiz-analysis.ts` - runs one structured-output call and writes a JSON artifact.
  - `smoke-gemini-structured-output.ts` - runs one validation smoke check and prints summary to terminal.
- `outputs/`
  - generated JSON artifacts (`quiz-analysis-response-<timestamp>.json`).
- root fixture files
  - `mock-quiz-input.json` - main fixture used by both scripts.

## Run

- `bun run analysis:quiz-harness`
- `bun run analysis:structured-smoke`
