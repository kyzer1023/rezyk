# EduInsight AI - Navigation Workflow and Required Pages

## 1) Navigation Goal
Provide a complete, low-friction teacher workflow from sign-in to intervention action, with clear status and recovery paths.

Route model decision: use course-scoped (and quiz-scoped) routing as canonical, so analytics and students are always tied to one selected class context.

## 2) Proposed Sitemap (App Router)
- `/` - Landing and sign-in entry
- `/auth/callback` - OAuth callback and token handoff
- `/onboarding/integrations` - First-time permission and connection checks
- `/dashboard` - Main overview (entry after login)
- `/dashboard/courses` - Course list and selection
- `/dashboard/courses/[courseId]` - Course overview and quick actions
- `/dashboard/courses/[courseId]/quizzes` - Quiz list and selection
- `/dashboard/courses/[courseId]/quizzes/[quizId]` - Canonical quiz workspace route
  - `?view=sync` - Data sync progress and results
  - `?view=analysis` - Analysis run status and controls
  - `?view=insights` - Class heatmap and risk distribution
  - `?view=students` - Student list with risk filters
  - `?view=students&studentId=...` - Student detail and interventions
- `/dashboard/courses/[courseId]/history` - Trend and historical quiz comparisons in the selected course
- `/settings` - Account, integration scopes, and reconnect actions
- `/error` - Unified recoverable error page

## 3) Page-by-Page Requirements

### `/` (Landing)
Purpose:
- Explain value quickly.
- Start Google sign-in.

Primary actions:
- `Sign in with Google`

Next route:
- Success -> `/auth/callback`

### `/auth/callback`
Purpose:
- Exchange auth code/token and establish session.

Primary actions:
- Automatic redirect after validation.

Next route:
- First-time user -> `/onboarding/integrations`
- Returning user -> `/dashboard`
- Failure -> `/error`

### `/onboarding/integrations`
Purpose:
- Confirm Classroom + Forms access and required scopes.

Primary actions:
- `Grant/Refresh Permissions`
- `Continue to Dashboard`

Next route:
- Complete -> `/dashboard`
- Failure -> `/error`

### `/dashboard`
Purpose:
- Central hub showing latest per-course activity and quick links.

Primary actions:
- `Open Courses`
- `Resume Last Course`
- `View System Status`

Next route:
- Course list -> `/dashboard/courses`
- Last active course -> `/dashboard/courses/[courseId]`

### `/dashboard/courses`
Purpose:
- Select one course.

Primary actions:
- `Choose Course`
- `Open Course Workspace`

Next route:
- Open -> `/dashboard/courses/[courseId]`

### `/dashboard/courses/[courseId]`
Purpose:
- Course workspace with quick context: recent quizzes, latest sync status, and entry points.

Primary actions:
- `Open Quiz List`
- `View Course History`
- `Back to Dashboard`

Next route:
- Quizzes -> `/dashboard/courses/[courseId]/quizzes`
- History -> `/dashboard/courses/[courseId]/history`

### `/dashboard/courses/[courseId]/quizzes`
Purpose:
- Select one quiz assignment inside the active course.

Primary actions:
- `Choose Quiz`
- `Start Quiz Workflow`

Next route:
- Start -> `/dashboard/courses/[courseId]/quizzes/[quizId]?view=sync`

### `/dashboard/courses/[courseId]/quizzes/[quizId]` (Quiz Workspace)
Purpose:
- Use one canonical page for sync, analysis, insights, and students without deeper URL nesting.

Primary actions:
- `Switch View` (`sync`, `analysis`, `insights`, `students`)
- `Run Sync / Analysis`
- `Open Student Detail`
- `Back to Student List`

View states:
- `?view=sync` -> Show ingest progress for roster, metadata, and responses.
- `?view=analysis` -> Trigger and monitor Gemini analysis pipeline.
- `?view=insights` -> Present class-level concept heatmap and risk summary.
- `?view=students` -> List students by risk and weak concept tags.
- `?view=students&studentId=...` -> Show individual gaps, error types, and interventions.

Next route:
- Sync success -> `?view=analysis`
- Analysis success -> `?view=insights`
- Insights to students -> `?view=students`
- Student list to detail -> `?view=students&studentId=...`
- Student detail back -> `?view=insights` or `?view=students`

### `/dashboard/courses/[courseId]/history`
Purpose:
- Compare quiz cycles and intervention impact within the selected course.

Primary actions:
- `Select Past Quiz`
- `Compare Trends`

Next route:
- Student drill-down -> `/dashboard/courses/[courseId]/quizzes/[quizId]?view=students&studentId=...`

### `/settings`
Purpose:
- Manage account, reconnect integrations, and session controls.

Primary actions:
- `Reconnect Google`
- `Sign Out`

Next route:
- Sign out -> `/`

### `/error`
Purpose:
- Single place for recoverable auth/sync/analysis errors.

Primary actions:
- `Retry`
- `Back to Dashboard`

## 4) End-to-End Primary Workflow
1. `/` -> user signs in.
2. `/auth/callback` -> session established.
3. `/onboarding/integrations` -> access validated.
4. `/dashboard/courses` -> course selected.
5. `/dashboard/courses/[courseId]/quizzes` -> quiz selected.
6. `/dashboard/courses/[courseId]/quizzes/[quizId]?view=sync` -> data synchronized.
7. `/dashboard/courses/[courseId]/quizzes/[quizId]?view=analysis` -> Gemini analysis completed.
8. `/dashboard/courses/[courseId]/quizzes/[quizId]?view=insights` -> class risks and concepts reviewed.
9. `/dashboard/courses/[courseId]/quizzes/[quizId]?view=students&studentId=...` -> targeted interventions planned.
10. `/dashboard/courses/[courseId]/history` -> follow-up trend review.

## 5) Navigation Rules for UX Consistency
- Keep a persistent dashboard sidebar for all `/dashboard/*` pages.
- Preserve selected `courseId` and `quizId` context across workspace view changes.
- Use breadcrumbs: `Dashboard > Courses > [Course] > Quizzes > [Quiz] > [View]`.
- Show global status badges: `Not Synced`, `Synced`, `Analyzed`, `Error`.
- Every critical step must expose both `Retry` and `Back` actions.
