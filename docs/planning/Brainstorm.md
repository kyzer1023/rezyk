# EduInsight AI - Smart Education Analytics for Google Classroom Quizzes

## 1) Project Snapshot
**Hackathon:** KitaHack 2026  
**SDG Alignment:** SDG 4 (Quality Education)  
**One-line Pitch:** Convert Google Classroom quiz scores into actionable, question-level teaching insights with Gemini and Google APIs.

## 2) Problem Statement
Teachers using Google Classroom Quiz Assignments face an analytics gap:

- Classroom mainly surfaces aggregate quiz scores (for example, 85/100).
- Teachers cannot quickly see which concepts students are failing at question level.
- Manual review of individual Google Forms responses is slow and not scalable.

**Result:** Teachers lose time, and intervention is delayed or too generic.

## 3) Target Users and Beneficiaries
- **Primary users:** School teachers using Google Classroom Quiz Assignments.
- **Secondary users:** Department heads or coordinators monitoring class-level learning gaps.
- **Beneficiaries:** Students who receive faster, targeted remediation.

## 4) Proposed Solution
EduInsight AI combines Classroom metadata and Forms responses, then uses Gemini to generate structured insights for teachers.

### Core Workflow
1. Teacher signs in and selects a Google Classroom course + quiz assignment.
2. System pulls:
   - Classroom roster and assignment metadata.
   - Forms response details at per-question level.
3. Correlation layer maps student identities and response records.
4. Gemini analyzes mistakes into meaningful categories:
   - Conceptual error
   - Procedural error
   - Careless error
5. Dashboard shows class heatmap, student risk level, and intervention suggestions.

### Why Focus Only on Quiz Assignments
- Regular Classroom assignments do not provide structured question data.
- Single-question assignments are insufficient for pattern analysis.
- Quiz Assignments (Google Forms) provide enough signals for misconception detection.

### Constraint Handling
Even when Classroom score import is delayed, analytics can still run from Forms raw responses to reduce teacher waiting time.

## 5) High-Level Architecture
### Main Components
- **Teacher Dashboard (Web):** Visualization and intervention view.
- **Integration Layer:** Fetches and normalizes Classroom + Forms data.
- **Analysis Layer (Gemini):** Produces structured educational insights.
- **Data Layer (Firestore):** Stores quizzes, analysis results, and trend history.

### Data Flow
`Classroom API (roster + assignment)`  
`Forms API (responses + correctness)`  
`-> Correlation Engine -> Gemini (JSON output) -> Firestore -> Dashboard`

## 6) AI Design (Structured Output)
Gemini returns strict JSON to keep dashboard rendering stable and deterministic.

```json
{
  "studentAnalysis": {
    "riskLevel": "low | medium | high | critical",
    "knowledgeGaps": [
      {
        "concept": "fractions division",
        "severity": "minor | moderate | severe",
        "errorType": "conceptual | procedural | careless",
        "affectedQuestions": ["Q3", "Q7"]
      }
    ],
    "recommendedIntervention": {
      "type": "worksheet | video | mini-quiz",
      "focusArea": "fractions division"
    }
  }
}
```

## 7) Feature Scope
### Preliminary Round MVP (Must Have)
- Course and quiz selection from Google Classroom.
- Per-question misconception analysis from Forms responses.
- Student risk stratification.
- Class concept heatmap.
- Basic intervention recommendations.

### Post-Prelim / Final Round Enhancements (Nice to Have)
- Auto-generated mini-quiz for weak concepts.
- Trend tracking across multiple quizzes.
- One-click export for teacher reports.

## 8) SDG and Real-World Impact
**SDG 4 (Quality Education):**
- Improves teaching quality through data-driven intervention.
- Supports equitable learning by identifying struggling learners early.
- Reduces teacher workload and feedback delay.

## 9) Success Metrics (for Submission)
- Time to detect class weak concepts: target under 2 minutes after sync.
- Teacher review time reduction: target at least 30%.
- Analysis coverage: target 100% students in selected quiz.
- Recommendation usefulness: target average teacher rating >= 4/5.

## 10) Testing and Iteration Plan
To match judging requirements, collect feedback from real users (outside the team):

1. Pilot with at least 3 teachers or teaching assistants.
2. Capture 3 concrete feedback insights.
3. Implement at least 3 product changes based on that feedback.
4. Document before/after screenshots and rationale.

## 11) Technical Risks and Mitigation
- **Risk:** OAuth scope and permission complexity.  
  **Mitigation:** Lock required scopes early and test with one teacher account first.
- **Risk:** Classroom-to-Forms identity mismatch.  
  **Mitigation:** Use deterministic mapping with email + submission metadata fallback.
- **Risk:** Inconsistent AI output formatting.  
  **Mitigation:** Enforce strict JSON schema and server-side validation.

## 12) Feasibility Assessment
This idea is feasible for the preliminary round if scope is controlled to:
- One web dashboard
- One end-to-end quiz analysis flow
- One clear demo scenario with real sample data

The team should prioritize working prototype reliability over extra features.