# Quiz Analysis Research Notes

Date: 2026-02-25

This file consolidates pre-implementation findings previously split across multiple planning files.

## 1) Gemini Structured Output Findings

Official sources reviewed:

- https://ai.google.dev/gemini-api/docs/structured-output
- https://googleapis.github.io/js-genai/release_docs/index.html
- https://googleapis.github.io/js-genai/release_docs/interfaces/types.GenerateContentConfig.html

Key takeaways:

1. In `@google/genai`, structured-output request fields are camelCase:
   - `responseMimeType`
   - `responseJsonSchema`
2. `responseJsonSchema` requires JSON mode (`responseMimeType: "application/json"`).
3. Schema-valid output can still be semantically wrong, so app-layer semantic validation is mandatory.
4. Large/deep schemas can fail before generation with `INVALID_ARGUMENT`; practical mitigation is flatter API-facing schemas and strict local post-validation.
5. Useful deterministic controls for reliability checks include:
   - `temperature`
   - `topP`
   - `maxOutputTokens`
   - optional `seed`

Implementation implication:

- keep request schema compact
- enforce full strictness in local validation (`lib/analysis/quiz-analysis-validate.ts`)

## 2) Free-Tier Model Availability (Workspace Observation)

Observed behavior with this project/key set:

- currently working:
  - `gemini-2.5-flash`
  - `gemini-2.5-flash-lite`
- quota-exhausted at time of test:
  - `gemini-3-flash-preview` (`429 RESOURCE_EXHAUSTED`)
- Gemma plain text worked, but strict JSON mode was unavailable on tested Gemma API path

Relevant Google docs:

- billing: https://ai.google.dev/gemini-api/docs/billing
- rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- troubleshooting: https://ai.google.dev/gemini-api/docs/troubleshooting

Practical strategy:

1. Use `gemini-2.5-flash-lite` for routine smoke/reliability testing.
2. Keep `gemini-3-flash-preview` as the target path when quota allows.
3. Treat rate limits as project-level, not key-level.

## 3) Google Forms + Classroom Compatibility Audit

Goal:

- assess whether `tools/quiz-analysis/mock-quiz-input.json` maps safely to real Google Classroom + Forms payloads.

Verdict:

- the mock schema is useful as an analysis-domain contract, but not a direct drop-in API payload.
- a normalization/adapter layer is required for production integration.

Primary risks:

1. Local ID patterns can reject real Google IDs unless normalization/relaxed patterns are applied.
2. `concept` is not a native Forms/Classroom field and must be enriched separately.
3. FormResponse-to-roster joins are fragile if email collection is disabled.
4. `incorrectQuestionIds` depends on grading completeness and may be missing or partial.

Recommended integration contract:

- keep raw-ingestion schema close to Google payloads
- add deterministic adapter into quiz-analysis input format
- make concept enrichment explicit
- gate incorrect-answer derivation when grading data is incomplete

## 4) Source Links (Compatibility Audit)

- Forms resource docs: https://developers.google.com/workspace/forms/api/reference/rest/v1/forms
- Forms responses docs: https://developers.google.com/workspace/forms/api/reference/rest/v1/forms.responses
- Forms responses list: https://developers.google.com/workspace/forms/api/reference/rest/v1/forms.responses/list
- Classroom coursework: https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork
- Classroom coursework form type: https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork#Form
- Classroom students: https://developers.google.com/workspace/classroom/reference/rest/v1/courses.students
- Classroom user profile: https://developers.google.com/workspace/classroom/reference/rest/v1/UserProfile
- Classroom student submissions: https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork.studentSubmissions
- Classroom grading guide: https://developers.google.com/workspace/classroom/guides/classroom-api/manage-grades
