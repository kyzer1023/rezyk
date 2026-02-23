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
- `/dashboard/courses/[courseId]/quizzes/[quizId]/sync` - Data sync progress and results
- `/dashboard/courses/[courseId]/quizzes/[quizId]/analysis` - Analysis run status and controls
- `/dashboard/courses/[courseId]/quizzes/[quizId]/insights` - Class heatmap and risk distribution
- `/dashboard/courses/[courseId]/quizzes/[quizId]/students` - Student list with risk filters
- `/dashboard/courses/[courseId]/quizzes/[quizId]/students/[studentId]` - Student detail and interventions
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
- Start -> `/dashboard/courses/[courseId]/quizzes/[quizId]/sync`

### `/dashboard/courses/[courseId]/quizzes/[quizId]/sync`
Purpose:
- Show ingest progress for roster, metadata, responses.

Primary actions:
- `Start Sync`
- `Retry Failed Sync`
- `Proceed to Analysis`

Next route:
- Success -> `/dashboard/courses/[courseId]/quizzes/[quizId]/analysis`
- Failure -> `/error` (or stay with retry)

### `/dashboard/courses/[courseId]/quizzes/[quizId]/analysis`
Purpose:
- Trigger and monitor Gemini analysis pipeline.

Primary actions:
- `Run Analysis`
- `Re-run Analysis`
- `Open Class Insights`

Next route:
- Success -> `/dashboard/courses/[courseId]/quizzes/[quizId]/insights`
- Failure -> `/error` (or stay with retry)

### `/dashboard/courses/[courseId]/quizzes/[quizId]/insights`
Purpose:
- Present class-level concept heatmap and risk summary.

Primary actions:
- `Filter by Risk`
- `Open Student List`
- `Open History`

Next route:
- Students -> `/dashboard/courses/[courseId]/quizzes/[quizId]/students`
- History -> `/dashboard/courses/[courseId]/history`

### `/dashboard/courses/[courseId]/quizzes/[quizId]/students`
Purpose:
- List students by risk and weak concept tags for the selected quiz only.

Primary actions:
- `Search Student`
- `Filter Risk Level`
- `Open Student Detail`

Next route:
- Detail -> `/dashboard/courses/[courseId]/quizzes/[quizId]/students/[studentId]`

### `/dashboard/courses/[courseId]/quizzes/[quizId]/students/[studentId]`
Purpose:
- Show individual gaps, error types, and intervention suggestions.

Primary actions:
- `Mark Intervention Planned`
- `Next At-Risk Student`
- `Back to Class Insights`

Next route:
- Back -> `/dashboard/courses/[courseId]/quizzes/[quizId]/insights`
- Next student -> `/dashboard/courses/[courseId]/quizzes/[quizId]/students/[studentId]`

### `/dashboard/courses/[courseId]/history`
Purpose:
- Compare quiz cycles and intervention impact within the selected course.

Primary actions:
- `Select Past Quiz`
- `Compare Trends`

Next route:
- Student drill-down -> `/dashboard/courses/[courseId]/quizzes/[quizId]/students/[studentId]`

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
6. `/dashboard/courses/[courseId]/quizzes/[quizId]/sync` -> data synchronized.
7. `/dashboard/courses/[courseId]/quizzes/[quizId]/analysis` -> Gemini analysis completed.
8. `/dashboard/courses/[courseId]/quizzes/[quizId]/insights` -> class risks and concepts reviewed.
9. `/dashboard/courses/[courseId]/quizzes/[quizId]/students/[studentId]` -> targeted interventions planned.
10. `/dashboard/courses/[courseId]/history` -> follow-up trend review.

## 5) Navigation Rules for UX Consistency
- Keep a persistent dashboard sidebar for all `/dashboard/*` pages.
- Preserve selected `courseId` and `quizId` context across sync, analysis, insights, and student pages.
- Use breadcrumbs: `Dashboard > Courses > [Course] > [Quiz] > [Page]`.
- Show global status badges: `Not Synced`, `Synced`, `Analyzed`, `Error`.
- Every critical step must expose both `Retry` and `Back` actions.
