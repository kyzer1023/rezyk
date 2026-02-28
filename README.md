# EduInsight AI

Smart education analytics for Google Classroom quiz assignments.

## Project Snapshot

- Hackathon: KitaHack 2026
- SDG focus: SDG 4 (Quality Education)
- Core value: convert quiz response data into teacher-ready intervention insights
- Current delivery model: Next.js web app with Google OAuth, Firestore-backed sync, and Gemini-powered analysis

## Documentation

- Docs index: [`docs/README.md`](docs/README.md)
- Product docs:
  - [`docs/product/User-Case-Stories.md`](docs/product/User-Case-Stories.md)
  - [`docs/product/Navigation-Workflow-Pages.md`](docs/product/Navigation-Workflow-Pages.md)
- Planning docs:
  - [`docs/planning/Brainstorm.md`](docs/planning/Brainstorm.md)
  - [`docs/planning/TechStack-and-WorkSplit.md`](docs/planning/TechStack-and-WorkSplit.md)
- Technical resources:
  - [`docs/resources/Spec.md`](docs/resources/Spec.md)
  - [`docs/resources/Research.md`](docs/resources/Research.md)
  - [`docs/resources/Firestore-Schema.md`](docs/resources/Firestore-Schema.md)

## Technical architecture

### High-level data flow

`Google Classroom API + Google Forms API -> Sync and normalization -> Gemini structured analysis -> Firestore -> Teacher dashboard`

### Runtime components

- Frontend: Next.js App Router pages for landing, onboarding, dashboard, course/quiz workspace, history, settings, and error recovery
- Backend: Next.js Route Handlers for auth, sync orchestration, analysis execution, and dashboard reads
- Data store: Firebase Firestore collections for users, courses, quizzes, responses, analyses, and notes
- AI layer: Gemini structured-output calls with schema and semantic validation before persistence

### Key modules

- `lib/auth/*`: server-side OAuth, token storage, and encrypted session cookie handling
- `app/api/sync/*`: Classroom and Forms ingestion into Firestore
- `app/api/analyze/*`: quiz, history, and course-material analysis endpoints
- `lib/analysis/*`: prompt builders, output schemas, and validation logic
- `app/dashboard/*` + `components/*`: teacher workflow UI and insight panels

### API route map (implemented)

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/login` | GET | Start Google OAuth consent flow |
| `/api/auth/callback` | GET | Exchange auth code, create session, persist user token profile |
| `/api/auth/status` | GET | Return authenticated state and integration status |
| `/api/auth/logout` | POST | Destroy session cookie |
| `/api/bootstrap/run` | POST | Orchestrate first sync and optional seed analysis |
| `/api/bootstrap/status` | GET | Return bootstrap/sync status |
| `/api/sync/courses` | POST | Sync Classroom courses and roster counts |
| `/api/sync/quiz` | POST | Sync course quiz metadata, questions, and responses |
| `/api/analyze/run` | POST | Run Gemini quiz analysis and persist validated output |
| `/api/analyze/history` | POST | Run longitudinal history analysis |
| `/api/analyze/course-materials` | POST | Run course-level material analysis |
| `/api/dashboard/courses` | GET | Read synced courses |
| `/api/dashboard/quizzes` | GET | Read quizzes for selected course |
| `/api/dashboard/analysis` | GET | Read persisted analysis output |
| `/api/notes` + related routes | GET/POST | Read and generate student notes |

## Implementation details

### Stack

- Language: TypeScript
- Runtime and package manager: Bun (preferred), npm-compatible scripts available
- Frontend: Next.js 16, React 19, Tailwind CSS v4
- Backend: Next.js Route Handlers (`runtime = "nodejs"`)
- Database: Firebase Firestore (Admin SDK on server)
- Charts: Recharts
- AI SDK: `@google/genai`

### Auth and session model

- OAuth is server-side using Google consent + callback routes
- Required scopes cover Classroom courses/rosters/submissions and Forms body/responses
- User OAuth tokens are stored in `users/{googleId}` documents
- App session is an encrypted HTTP-only cookie (`edu_session`) using AES-256-GCM
- Token refresh is handled in server utilities before Google API calls

### Sync and persistence flow

1. Course sync pulls active Classroom courses and student counts.
2. Quiz sync fetches courseWork, resolves linked Google Form IDs, reads questions and responses.
3. Data is written to Firestore collections:
   - `courses`
   - `quizzes`
   - `quizzes/{courseId_quizId}/responses`
4. Bootstrap orchestration can run an initial sync plus seed analysis run.

Firestore collection contracts are documented in [`docs/resources/Firestore-Schema.md`](docs/resources/Firestore-Schema.md).

### Analysis pipeline

- `/api/analyze/run` builds a normalized quiz-analysis input from synced Firestore data
- Gemini is called in JSON mode with `responseJsonSchema`
- Output is validated in two layers:
  - schema-level structure checks
  - semantic checks against input fixture invariants
- Retry and fallback strategies are applied for transient model failures and malformed outputs
- Validated outputs are persisted into `analyses/{courseId_quizId}` with derived metrics

### Frontend workflow

- Canonical flow follows docs navigation:
  - `/` -> `/onboarding/integrations` -> `/dashboard` -> course -> quiz workspace
- Quiz workspace uses query-driven tabs:
  - `?view=analysis`
  - `?view=insights`
  - `?view=students` (and optional `studentId`)
- Dashboard routes share a persistent shell (sidebar + breadcrumb context)

### Local setup

1. Install dependencies:

```bash
bun install
```

2. Create `.env.local`:

```bash
# Firebase client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase admin
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_PROJECT_ID=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_SECRET=

# Gemini
GEMINI_API_KEY=
GEMINI_API_KEY2=
GEMINI_API_KEY3=
GEMINI_API_KEY4=
GEMINI_API_KEY5=
```

3. Run development server:

```bash
bun run dev
```

4. Optional validation scripts:

```bash
bun run lint
bun run build
bun run analysis:quiz-harness
bun run analysis:structured-smoke
```

## Challenges faced

- OAuth and scope complexity:
  - Managing correct Classroom/Forms scopes, refresh behavior, and reconnect handling required careful server-side token lifecycle logic.
- Classroom-to-Forms data correlation:
  - Mapping course roster identities to form respondents is not always perfect, especially when response identity signals are incomplete.
- Structured AI output reliability:
  - Complex/deep schemas can fail with `INVALID_ARGUMENT`; flatter API-facing schemas plus strict local validation were needed.
- Model quota and availability constraints:
  - Free-tier limits can block specific Gemini model IDs, so fallback chains and key rotation logic were introduced.
- Incomplete upstream data conditions:
  - Some quizzes can sync without full grading metadata, requiring defensive parsing and partial-data fallbacks.
- Limited automated QA:
  - Project validation currently relies on manual testing and script-based smoke checks; no full CI suite is in place yet.

## Future roadmap

1. Complete Google Classroom depth first:
   - fully support Classroom workflows beyond baseline quiz sync (assignment lifecycle coverage, richer roster and submission states, grading context continuity)
   - improve Classroom-native UX so teachers can operate end-to-end without manual data workarounds
2. Expand within the Google ecosystem:
   - deepen Google Forms ingestion fidelity (question types, grading modes, edge-case response mapping)
   - integrate additional Google Workspace surfaces where useful (for example Drive/Docs-backed intervention artifacts and reporting exports)
3. Become LMS-agnostic over time:
   - introduce a connector architecture so analysis is not tied only to Google Classroom
   - add adapters for other ecosystems (for example Moodle, Canvas, Microsoft Teams for Education) while preserving one shared analysis contract
4. Evolve into a broader instructional intelligence layer:
   - track longitudinal learning signals across classes, terms, and assessment formats
   - shift from reactive reporting to proactive early-warning and intervention planning
5. Expand stakeholder value:
   - provide role-based views for department heads and school leadership while keeping teacher workflows simple
   - generate clearer communication artifacts for parent/student follow-up when needed
6. Strengthen reliability and production readiness:
   - add automated tests for sync, analysis validation, and route-level regression coverage
   - harden quota controls, observability, and deployment guardrails for sustained real-world usage
