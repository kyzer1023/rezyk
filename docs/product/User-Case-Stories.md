# EduInsight AI - User Case Stories

## 1) Objective Alignment
Project objective: help teachers move from high-level quiz scores to fast, question-level intervention decisions using Google Classroom, Google Forms, and Gemini analysis.

Routing and context rule: analysis, insights, and student details are scoped to a selected course and quiz (not aggregated by default across all courses).

Coverage rule for this project phase: analysis coverage is defined as 100% of students with submitted quiz responses in the selected course + quiz context. Non-submitters are surfaced operationally but are out of scope for misconception inference.

## 2) Primary Personas
- Teacher (primary): runs quiz sync, reviews risks, and acts on interventions.
- Student (beneficiary): receives targeted remediation earlier.

## 3) Core Use Case Stories (MVP)

### UC-01: Sign In and Connect Classroom
As a teacher, I want to sign in with Google and connect my Classroom account so that I can access my courses and quizzes securely.

Acceptance criteria:
- User can authenticate with Google.
- Required scopes for Classroom and Forms are requested.
- Failed auth shows a clear retry path.

### UC-02: Select Course and Quiz
As a teacher, I want to choose a course and quiz assignment so that analysis runs on the correct class context.

Acceptance criteria:
- Course list is populated from Classroom API.
- Quiz assignments are clearly labeled.
- User can confirm one course + one quiz before sync.

### UC-03: Sync Quiz Data
As a teacher, I want to sync roster and Forms responses so that analysis uses complete and current data.

Acceptance criteria:
- System fetches roster, quiz metadata, and responses.
- Sync status is visible (loading, success, error).
- Synced records are persisted for dashboard use.

### UC-04: Analyze Misconceptions
As a teacher, I want AI to classify mistake patterns (conceptual/procedural/careless) so that I can focus on root causes.

Acceptance criteria:
- Analysis runs after sync.
- AI output is validated against a strict JSON schema.
- Invalid output is handled with a fallback message and safe state.

### UC-05: View Class Insights
As a teacher, I want a class-level heatmap and risk distribution so that I can identify weak concepts in under 2 minutes.

Acceptance criteria:
- Dashboard shows concept-level weak areas.
- Student risk levels are visible (low, medium, high, critical).
- Data is filterable by quiz and risk.
- Insights are rendered for the active course + quiz context.

### UC-06: View Student Detail and Intervention
As a teacher, I want per-student knowledge gaps and recommended actions so that I can provide targeted support quickly.

Acceptance criteria:
- Student profile shows affected questions and error type.
- Intervention suggestions are tied to focus area.
- Teacher can move to the next at-risk student efficiently.
- Student list and detail are scoped to the active course + quiz.

### UC-07: Track Outcome Over Time
As a teacher, I want to compare current and previous quiz trends so that I can evaluate whether interventions worked.

Acceptance criteria:
- Historical analysis snapshots are accessible.
- AI-generated trend direction (improving/stable/declining) is visible and supported by evidence.
- Trend analysis can use both raw quiz response data and prior inferred analysis outputs.
- Empty history state is handled cleanly.

### UC-08: Generate Personalized Teaching Assets
As a teacher, I want to generate student-specific intervention assets after analysis so that I can act quickly with targeted support.

Acceptance criteria:
- Teacher can generate assets for one selected student or batch-generate for at-risk students.
- Asset package includes:
  - Intervention note (root cause summary, focus concept, next class action, follow-up action)
  - Mini-quiz draft (3-5 items, answer key, concept tag per item)
- Assets are tied to active course + quiz + student context.
- Outputs are clearly labeled AI-generated draft and are editable before classroom use.
- Generation failures return safe fallback messaging with retry.

## 5) Story Prioritization
- Must have (Preliminary MVP): UC-01 to UC-06
- Should have: UC-07
- Could have (stretch but shippable): UC-08

## 6) Success Conditions
- Weak concepts identified in under 2 minutes after sync.
- Teacher review time reduced by at least 30%.
- Analysis coverage reaches 100% of submitted responses in selected quiz.
