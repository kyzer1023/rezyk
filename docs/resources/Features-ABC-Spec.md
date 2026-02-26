# Features A, B, C — Implementation Spec

Date: 2026-02-26

## Feature A: Student Asset Notes

### API Routes
- `POST /api/notes/generate` — Single student note generation
  - Input: `{ courseId, quizId, studentId }`
  - Output: Generated note saved to Firestore, returned as JSON
- `POST /api/notes/batch` — Batch generation by risk category
  - Input: `{ courseId, quizId, category: "critical"|"high"|"medium"|"low"|"critical+high"|"all" }`
  - Output: Array of results with per-student status
- `GET /api/notes/list` — List generated notes for a quiz
  - Query: `?courseId=...&quizId=...`

### Firestore Schema
```
notes/{courseId}_{quizId}_{studentId}
{
  courseId: string
  quizId: string
  studentId: string
  displayName: string
  riskLevel: string
  topWeaknesses: { concept: string, errorType: string }[]
  rootIssue: string
  improvementTips: string[]
  followUpAction: string
  generatedAt: number
  modelId: string
  sourceAnalysisId: string
  status: "success" | "error"
  error?: string
  ownerId: string
}
```

### Gemini Output Schema (for notes)
```json
{
  "topWeaknesses": [{ "concept": "...", "errorType": "..." }],
  "rootIssue": "...",
  "improvementTips": ["...", "...", "..."],
  "followUpAction": "..."
}
```

## Feature B: Course-Wide Material Analysis

### API Routes
- `POST /api/analyze/course-materials` — Run course-wide analysis
  - Input: `{ courseId }`
- `GET /api/dashboard/course-analysis` — Read results
  - Query: `?courseId=...`

### Firestore Schema
```
courseAnalyses/{courseId}
{
  courseId: string
  topWeakConcepts: { concept: string, frequency: number, quizIds: string[] }[]
  rootCauses: string[]
  contentCoverage: { taught: string[], assessed: string[], gaps: string[] }
  difficultyProgression: string
  misconceptionRecurrence: { concept: string, quizCount: number }[]
  assessmentBalance: { conceptual: number, procedural: number, application: number }
  interventionOpportunities: string[]
  trendDirection: "improving" | "stable" | "declining" | "insufficient_data"
  confidence: "low" | "medium" | "high"
  analyzedQuizIds: string[]
  generatedAt: number
  modelId: string
  ownerId: string
  status: "success" | "error" | "insufficient_data"
}
```

## Feature C: AI History Analysis

### API Routes
- `POST /api/analyze/history` — Run history analysis
  - Input: `{ courseId, maxQuizzes?: number }`
- `GET /api/dashboard/history-analysis` — Read results
  - Query: `?courseId=...`

### Firestore Schema
```
historyAnalyses/{courseId}
{
  courseId: string
  overallTrend: "improving" | "stable" | "declining" | "insufficient_data"
  confidence: "low" | "medium" | "high"
  evidenceSummary: {
    scoreTrajectory: string
    riskTrajectory: string
    recurringWeakConcepts: string[]
  }
  interventionImpactHypothesis: {
    improving: string[]
    unresolved: string[]
  }
  nextCycleActions: string[]
  analyzedQuizIds: string[]
  quizCount: number
  generatedAt: number
  modelId: string
  ownerId: string
  status: "success" | "error" | "insufficient_data"
}
```
