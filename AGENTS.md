# Workflow Orchestration

1. Plan Node Default
- Enter plan mode for any non-trivial task (three or more steps, or involving architectural decisions).
- If something goes wrong, stop and re-plan immediately rather than continuing blindly.
- Use plan mode for verification steps, not just implementation.
- Write detailed specifications upfront to reduce ambiguity.

2. Subagent Strategy
- Use subagents liberally to keep the main context window clean.
- Subagents are STRICTLY only for offloading research, exploration, and parallel analysis.
- For complex problems, allocate more compute via subagents.
- Assign one task per subagent to ensure focused execution.

3. Self-Improvement Loop
- After any correction from the user, update tasks/lessons.md with the relevant pattern.
- Create rules for yourself that prevent repeating the same mistake.
- Iterate on these lessons rigorously until the mistake rate declines.
- Review lessons at the start of each session when relevant to the project.

4. Verification Before Done
- Never mark a task complete without proving it works.
- Diff behavior between main and your changes when relevant.
- Ask: "Would a staff engineer approve this?"
- Run tests, check logs, and demonstrate correctness.

5. Demand Elegance (Balanced)
- For non-trivial changes, pause and ask whether there is a more elegant solution.
- If a fix feels hacky, implement the solution you would choose knowing everything you now know.
- Do not over-engineer simple or obvious fixes.
- Critically evaluate your own work before presenting it.

6. Autonomous Bug Fixing
- When given a bug report, fix it without asking for unnecessary guidance.
- Review logs, errors, and failing tests, then resolve them.
- Avoid requiring context switching from the user.
- Fix failing CI tests proactively.

# Task Management

1. Plan First: Write the plan to tasks/todo.md with checkable items.
2. Verify Plan: Review before starting implementation.
3. Track Progress: Mark items complete as you go.
4. Explain Changes: Provide a high-level summary at each step.
5. Document Results: Add a review section to tasks/todo.md.
6. Capture Lessons: Update tasks/lessons.md after corrections.

# Core Principles

- Simplicity First: Make every change as simple as possible. Minimize code impact.
- No Laziness: Identify root causes. Avoid temporary fixes. Apply senior developer standards.
- Minimal Impact: Touch only what is necessary. Avoid introducing new bugs.

## Learned User Preferences

- Do not spin up subagents unless explicitly requested; complete work step-by-step.
- Do not edit the plan file when implementing; treat it as read-only reference.
- Do not recreate existing todos; mark them `in_progress` as you work and complete all before stopping.
- Use the frontend-design skill when building UI components or pages.
- Prefer `bun` as the runtime and package manager; `npm`/`pnpm` are acceptable alternatives.
- Strictly avoid `any` typings in TypeScript unless truly necessary.
- Design for teachers aged 30+: use straightforward, intuitive HCI components and muted palettes rather than high-contrast themes.
- Focus on mock static UI flow before backend integration; no tests for now.
- Each UI rendition must differ in layout and composition, not just color palette swaps.
- Use one shared mock dataset across all renditions; each renders the same data differently.
- Before implementing external API integrations, review official docs first and document key findings in a new markdown file.
- Clearly separate fixture validation outcomes from online reliability outcomes in harness/test summaries.
- When Gemini free-tier quotas block a pinned model, probe alternative Gemini models and report account-specific availability before proposing fallback execution.
- For pooled Gemini keys, rotate keys on the preferred model first and only move to fallback models after preferred-model key pool exhaustion.

## Learned Workspace Facts

- Project: EduInsight AI – teacher dashboard for KitaHack 2026 hackathon (2-person team, deadline Feb 28).
- Tech stack: Next.js (App Router), React, Tailwind v4, TypeScript, Firebase (Auth + Firestore), Google APIs (Classroom, Forms), Gemini.
- Uses `bun` runtime for dev/build/install; uses recharts for charts and heatmaps.
- 5 design renditions at `/1`–`/5`, each with full navigation workflow; root `/` is a rendition chooser hub.
- Navigation flow: Landing → Auth → Onboarding → Dashboard → Courses → Quizzes → Sync → Analysis → Insights → Students → Student Detail → History → Settings → Error.
- Shared mock data in `lib/mock-data.ts`; shared types in `lib/types.ts`; shared chart components in `lib/charts/`.
- Dashboard routes share a layout with persistent sidebar and breadcrumbs.
- Planning docs: `README.md`, `Brainstorm.md`, `TechStack-and-WorkSplit.md`, `Navigation-Workflow-Pages.md`.
- Backend integration is another team member's workload; frontend is mock-only for now.
- Next.js 16 requires `await params` (params is a Promise in dynamic routes).
- Gemini structured output requests can fail with `INVALID_ARGUMENT` when response schemas are too complex/deep; use flatter API-facing schemas and enforce strict validation locally.
- Gemini free-tier request limits are model-specific; harness model override is useful for validation when a pinned model quota is exhausted.
- Gemma models are available via API in this workspace, but strict JSON mode may be unavailable on some Gemma IDs; keep schema-locked app-layer inference on Gemini Flash-family models.

## Cursor Cloud specific instructions

### Services

| Service | Command | Notes |
|---|---|---|
| Dev server | `bun run dev` | Next.js on port 3000. Dashboard pages now fetch from Firestore via API routes. |
| Lint | `bun run lint` | ESLint 9 with `eslint-config-next` (core-web-vitals + typescript). |
| Build | `bun run build` | `next build` using Turbopack. Completes in ~10s. |
| Quiz harness | `bun run analysis:quiz-harness` | Standalone Gemini analysis script. Requires `GEMINI_API_KEY`. |
| Structured smoke | `bun run analysis:structured-smoke` | Standalone structured output smoke test. |

### Auth Architecture

- **Server-side OAuth** via `lib/auth/google-oauth.ts`. No Firebase Auth client popup.
- **Session**: AES-256-GCM encrypted HTTP-only cookie (`edu_session`).
- **Token store**: Firestore `users/{googleId}` with auto-refresh via `lib/auth/token-store.ts`.
- **OAuth type**: Google "installed app" credentials. Redirect URI is `http://localhost:3000/api/auth/callback`.
- **Required env vars**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`.
- Testing auth requires the OAuth consent flow (browser redirect). Use token injection for automated testing.

### API Route Map

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/login` | GET | Redirects to Google OAuth consent |
| `/api/auth/callback` | GET | Exchanges code for tokens, creates session |
| `/api/auth/logout` | POST | Destroys session |
| `/api/auth/status` | GET | Returns auth + integration status |
| `/api/sync/courses` | POST | Syncs Classroom courses to Firestore |
| `/api/sync/quiz` | POST | Syncs quiz structure + responses to Firestore |
| `/api/analyze/run` | POST | Runs Gemini analysis (single API call) |
| `/api/dashboard/courses` | GET | Reads synced courses |
| `/api/dashboard/quizzes` | GET | Reads synced quizzes |
| `/api/dashboard/analysis` | GET | Reads stored analysis results |

### Caveats

- **`.env.local` is required** with `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`.
- **Bun is installed to `~/.bun/bin/bun`.** The update script ensures it's on `$PATH`.
- **Gemini API usage is scarce.** The `/api/analyze/run` endpoint makes exactly 1 Gemini call per quiz. Use `gemini-3-flash-preview` model.
- **Google OAuth refresh tokens expire after 7 days** if the Google Cloud project's OAuth consent screen is in "Testing" mode. Publish the app to remove this limit.
- **No automated test suite exists.** Validation is manual.
- **No Docker, no CI configuration.**
- **Next.js dev lock file**: If the dev server doesn't shut down cleanly, remove `.next/dev/lock` before restarting or the new process will fail with "Unable to acquire lock".
- **`.env.local` also requires Firebase vars** (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `NEXT_PUBLIC_FIREBASE_*`) for Firestore and the full env var list in `README.md § Local Setup`.
