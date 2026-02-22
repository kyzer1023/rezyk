# EduInsight AI

Smart education analytics for Google Classroom Quiz Assignments.

## Project Snapshot

- Hackathon: KitaHack 2026
- SDG Focus: SDG 4 (Quality Education)
- Pitch: Convert quiz scores and Forms responses into question-level teaching insights using Gemini.

## Problem

Google Classroom quiz scores are often too high-level for fast intervention. Teachers need:

- Concept-level learning gaps
- Student risk prioritization
- Actionable intervention suggestions

## Requirements Alignment (KitaHack Preliminary Round)

This project is designed to satisfy the stated submission requirements:

- AI requirement: Google AI technology (Gemini) as a core component
- Google technology requirement: additional Google technologies beyond AI (Firebase + Google Classroom API + Google Forms API)
- Prototype requirement: semi-working/working coded prototype (not no-code)
- Submission requirement: public repository with clear setup instructions
- User validation requirement: at least 3 real-user feedback insights and at least 3 implemented changes

Reference deadline from info pack: Preliminary round submission deadline is **February 28, 2026**.

## MVP Scope (Preliminary Round)

- Google sign-in and teacher session
- Course and quiz selection from Google Classroom
- Quiz response ingestion from Google Forms
- Roster-to-response correlation
- Gemini misconception analysis (structured JSON)
- Dashboard with:
  - Student risk levels
  - Concept heatmap
  - Intervention recommendations

## Current Repository Status

Current codebase status:

- Next.js app scaffold is initialized
- Core product features listed above are planned and in progress

This README reflects the project requirements and target architecture so implementation can be tracked against judging criteria.

## Tech Stack

- Language: TypeScript
- Frontend: Next.js (App Router), React, Tailwind CSS
- Backend: Next.js Route Handlers
- Database: Firebase Firestore
- Auth: Firebase Authentication (Google sign-in)
- AI: Gemini API
- Google Integrations: `googleapis` (Classroom + Forms)
- Validation: Zod (for Gemini JSON schema validation)
- Charts: Recharts

## Architecture (High Level)

`Classroom API + Forms API -> Correlation Engine -> Gemini Analysis -> Firestore -> Teacher Dashboard`

Main logical modules:

- `auth`
- `integrations/classroom`
- `integrations/forms`
- `analysis`
- `dashboard`
- `persistence`

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local` with project-specific values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

GEMINI_API_KEY=
```

### 3) Run development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Planned API Routes

- `POST /api/sync/quiz` - fetch and persist Classroom + Forms quiz data
- `POST /api/analyze/run` - run Gemini analysis pipeline
- `GET /api/dashboard/summary` - return class-level dashboard data

## Submission Checklist

- Public repository link
- Clear setup instructions in README
- Project description (AI + SDG alignment)
- Demo video (<= 5 minutes, public/unlisted)
- Technical architecture and implementation overview
- At least 3 real-user feedback insights
- At least 3 implemented changes from user feedback
- Success metrics and scalability notes

## User Feedback and Iteration Log

Fill this before submission:

| Insight # | User feedback (real users outside team) | Implemented change |
|---|---|---|
| 1 | TBD | TBD |
| 2 | TBD | TBD |
| 3 | TBD | TBD |

## Success Metrics (Targets)

- Time to identify class weak concepts: < 2 minutes after sync
- Teacher review time reduction: >= 30%
- Analysis coverage: 100% of students in selected quiz
- Recommendation usefulness: average teacher rating >= 4/5

## Notes

- Keep scope focused on one complete end-to-end teacher workflow for the preliminary round.
- Prioritize reliability over extra features.
