# EduInsight AI - Tech Stack and 2-Person Work Split

## 1) Build Principles
- Keep preliminary scope focused on one complete teacher workflow.
- Use Google AI + Google developer technologies as core requirements.
- Use `bun/npm/pnpm` as runtime/package manager for local development tasks.

## 2) Recommended Tech Stack
### Core Product Stack (Must Have)
- **Language:** TypeScript (frontend + backend)
- **Runtime / Package Manager:** Bun/npm/pnpm
- **Frontend:** Next.js + React + Tailwind CSS
- **Backend API:** Next.js Route Handlers (or Hono if preferred)
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication + Google sign-in
- **Google API Access:** `googleapis` SDK for Classroom + Forms
- **AI:** Gemini API (structured JSON output)
- **Charts / Visualization:** Recharts (risk distribution, concept heatmap)
- **Hosting:** Firebase Hosting / App Hosting (choose one and keep simple)

### Supporting Tools (Strongly Recommended)
- **Version control:** Git + GitHub
- **API testing:** Postman or Thunder Client
- **Schema validation:** Zod (validate Gemini JSON before saving)
- **Logging / debugging:** Console + Firebase logs
- **Video demo:** OBS (or Loom)

### Bun/npm/pnpm Command Set
Use Bun/npm/pnpm commands consistently:

```bash
bun/npm/pnpm install
bun/npm/pnpm run dev
bun/npm/pnpm run build
bun/npm/pnpm run lint
```

If you need to add dependencies:

```bash
bun/npm/pnpm add <package-name>
bun/npm/pnpm add -d <dev-package-name>
```

## 3) Suggested Project Modules
- `auth` - sign-in and session handling
- `integrations/classroom` - course, roster, assignment fetch
- `integrations/forms` - response and answer key fetch
- `analysis` - Gemini prompt + JSON parsing + scoring logic
- `dashboard` - teacher UI, charts, filters
- `persistence` - Firestore collections and queries
- `submission-assets` - README, docs, video script, pitch deck notes

## 4) 2-Person Task Split
### Member A (Backend and Integrations Lead - primary backend owner)
- Set up Firebase project, Firestore rules, and service account configuration.
- Implement Google OAuth flow, token storage strategy, refresh handling, and scope validation.
- Build Classroom integration endpoints:
  - fetch courses
  - fetch course roster
  - fetch quiz assignment metadata
- Build Forms integration endpoints:
  - fetch answer key and question metadata
  - fetch student responses with timestamps and scores
- Implement correlation engine to map Classroom student roster to Forms submissions using email and fallback matching logic.
- Design and create Firestore collections:
  - `courses`
  - `quizzes`
  - `submissions`
  - `analysis_results`
  - `sync_logs`
- Build backend APIs for pipeline orchestration:
  - `/api/sync/quiz`
  - `/api/analyze/run`
  - `/api/dashboard/summary`
- Add backend reliability features:
  - retry policy for Google API calls
  - error boundary and structured error response
  - request logging and debug traces

### Member B (Frontend and AI Lead - frontend owner with additional backend scope)
- Build dashboard UI pages and components:
  - quiz selector
  - student risk table
  - class concept heatmap
  - intervention recommendation cards
- Define Gemini prompt template and strict output schema for misconception analysis.
- Implement AI backend logic (extra backend load):
  - parse and validate Gemini JSON response
  - map AI output into Firestore-ready format
  - implement fallback behavior when AI response is invalid
- Build analysis-related backend endpoints and connect to frontend:
  - analysis trigger action from dashboard
  - per-student detail retrieval endpoint
- Implement frontend state handling:
  - loading, empty, and failure states
  - filter/search by student and risk level
- Lead user testing workflow:
  - recruit at least 3 teachers or teaching assistants
  - record at least 3 insights
  - document at least 3 implemented changes from feedback
- Own submission narrative quality:
  - demo storyline
  - screenshots and captions
  - submission form wording refinement

### Shared Responsibilities
- 30-minute daily stand-up and 30-minute nightly integration check.
- Maintain one shared issue board with clear owner and due date per task.
- Run end-to-end flow test daily on one real quiz dataset.
- Keep README setup steps updated after each major integration.
- Finalize and record 5-minute demo video together.

## 5) Detailed 5-Day Workload Plan (22nd to 26th, with 27th as buffer)
### Day 1 (22nd) - Foundation and Access Setup
- **Member A tasks:**
  - Initialize project structure and environment variables.
  - Configure Firebase project, Firestore database, and auth settings.
  - Set up Google Cloud OAuth consent and API credentials.
  - Verify Classroom and Forms API access with test requests.
- **Member B tasks:**
  - Build base dashboard layout and navigation structure.
  - Create reusable UI components (cards, tables, chart containers).
  - Draft Gemini prompt v1 and JSON schema v1.
  - Implement sample JSON parser and schema validation utility.
- **End-of-day deliverable:** Working login, project runs locally, API access confirmed, dashboard shell visible.

### Day 2 (23rd) - Data Ingestion Pipeline
- **Member A tasks:**
  - Implement Classroom endpoints (courses, roster, assignment list).
  - Implement Forms endpoints (questions, answer key, responses).
  - Build first version of roster-to-submission correlation logic.
  - Persist raw sync results into Firestore.
- **Member B tasks:**
  - Build frontend quiz selection flow and sync trigger UI.
  - Connect frontend to sync endpoints and display sync status.
  - Implement basic data preview panel (question list + submission count).
  - Add user-friendly error messages for sync failures.
- **End-of-day deliverable:** User can select one quiz and sync real data into Firestore.

### Day 3 (24th) - AI Analysis and Dashboard Core
- **Member A tasks:**
  - Build `/api/analyze/run` pipeline orchestration endpoint.
  - Add data cleaning and normalization before AI input.
  - Store analysis outputs and status logs in Firestore.
  - Add retry and timeout handling for external API calls.
- **Member B tasks:**
  - Integrate Gemini call flow with strict schema validation.
  - Implement fallback handling for malformed AI output.
  - Build risk distribution and concept heatmap components.
  - Build student detail panel with gaps and interventions.
- **End-of-day deliverable:** End-to-end flow from sync to AI analysis to dashboard rendering works.

### Day 4 (25th) - Stabilization, Testing, and Iteration
- **Member A tasks:**
  - Harden correlation logic for edge cases (missing emails, duplicate names).
  - Improve endpoint response consistency and logging clarity.
  - Optimize Firestore reads/writes for dashboard queries.
  - Add guardrails for empty datasets and partial sync failures.
- **Member B tasks:**
  - Improve UI clarity (labels, legends, loading states, empty states).
  - Run user testing sessions with 3 external users.
  - Extract 3 concrete feedback points.
  - Implement 2 to 3 high-impact improvements from feedback.
- **End-of-day deliverable:** Stable MVP with documented user feedback and visible iterations.

### Day 5 (26th) - Submission Assembly and Demo Readiness
- **Member A tasks:**
  - Finalize architecture diagram and technical challenge write-up.
  - Final QA pass on APIs and integration reliability.
  - Complete setup instructions and troubleshooting in README.
  - Prepare fallback demo dataset and backup run path.
- **Member B tasks:**
  - Final polish on dashboard visuals and interaction flow.
  - Finalize success metrics section using collected evidence.
  - Prepare demo script mapped to judging criteria.
  - Record and edit 5-minute demo video (public or unlisted link).
- **End-of-day deliverable:** Full submission package ready before deadline day.

### 27th Buffer Plan (No New Features)
- Fix critical bugs only.
- Re-record demo only if needed.
- Double-check all submission links and form answers.
- Freeze scope and submit confidently.

## 6) Definition of Done (Preliminary Round)
- Working prototype can be demonstrated live.
- Includes at least one Google AI technology (Gemini).
- Includes at least one additional Google technology (Classroom/Forms/Firebase).
- Real user feedback evidence contains at least 3 insights.
- At least 3 implemented changes are linked to user feedback.
- Public repository link + readable setup instructions are ready.

## 7) Risk Control for a 2-Person Team
- Avoid overbuilding premium features before MVP stability.
- Freeze scope 48 hours before submission deadline.
- Maintain one backup demo dataset in case live API fails.
- Prioritize reliable functionality over visual polish in final 24 hours.
