# Firestore Schema

Date: 2026-02-25

## Collections

### `users/{googleId}`
Stores user profile and OAuth tokens.

```
{
  googleId: string
  email: string
  name: string
  picture: string
  tokens: {
    accessToken: string
    refreshToken: string
    expiresAt: number
    scope: string
  }
  integrationStatus: "connected" | "needs_reconnect" | "not_connected"
  createdAt: number
  updatedAt: number
}
```

### `courses/{courseId}`
Stores synced Google Classroom courses.

```
{
  courseId: string
  ownerId: string         // Google user ID of the teacher
  name: string
  section: string | null
  courseState: string      // "ACTIVE", "ARCHIVED", etc.
  studentCount: number
  lastSynced: number      // timestamp ms
}
```

### `quizzes/{courseId_quizId}`
Stores quiz assignments with their linked Google Form.

```
{
  courseId: string
  courseWorkId: string     // Classroom courseWork ID
  formId: string          // Google Forms ID
  title: string
  maxPoints: number
  courseWorkState: string  // "PUBLISHED", etc.
  questions: [            // from Forms API
    {
      questionId: string
      title: string
      questionType: "RADIO" | "CHECKBOX" | "TEXT" | ...
      options: string[]
      correctAnswers: string[]
      maxScore: number
    }
  ]
  responseCount: number
  totalStudents: number
  syncStatus: "not_synced" | "synced" | "error"
  analysisStatus: "not_started" | "running" | "completed" | "error"
  lastSynced: number | null
  ownerId: string
}
```

### `quizzes/{courseId_quizId}/responses/{respondentEmail}`
Stores individual student quiz responses.

```
{
  respondentEmail: string
  totalScore: number
  maxScore: number
  answers: {
    [questionId: string]: {
      textAnswers: string[]
      score: number
    }
  }
  submittedAt: string
}
```

### `analyses/{courseId_quizId}`
Stores Gemini analysis results.

```
{
  quizId: string
  courseId: string
  modelOutput: ModelOutput         // from quiz-analysis-schema.ts
  derivedAnalysis: DerivedAnalysis // computed metrics
  analysisInput: QuizAnalysisInput // original input sent to model
  emailMapping: Record<string, string> // studentId -> respondent email
  createdAt: number
  modelId: string
  ownerId: string
}
```

### `studentNotes/{courseId_quizId_studentId}`
Stores AI-generated student asset notes.

```
{
  noteId: string
  courseId: string
  quizId: string
  studentId: string
  displayName: string
  note: {
    studentId: string
    displayName: string
    topWeaknesses: [{
      concept: string
      errorType: "conceptual" | "procedural" | "careless"
      rootIssue: string
    }]
    improvementTips: string[] // 3-5 actionable tips
    teacherFollowUp: string
  } | null
  generatedAt: number
  modelId: string
  sourceAnalysisId: string
  status: "success" | "error"
  error?: string
  ownerId: string
}
```

### `courseMaterialAnalyses/{courseId}`
Stores course-wide material analysis output.

```
{
  courseId: string
  analysis?: CourseMaterialAnalysisOutput // from course-material-schema.ts
  analyzedQuizIds: string[]
  analyzedAt: number
  modelId: string
  ownerId: string
  status: "success" | "error" | "insufficient_data"
  error?: string
}
```

### `historyAnalyses/{courseId}`
Stores longitudinal trend analysis output.

```
{
  courseId: string
  analysis?: {
    overallTrend: "improving" | "stable" | "declining" | "insufficient_data"
    confidence: "low" | "medium" | "high"
    evidenceSummary: {
      scoreTrajectorySummary: string
      riskTrajectorySummary: string
      recurringWeakConcepts: string[]
    }
    interventionImpactHypothesis: {
      appearsToImprove: string[]
      remainsUnresolved: string[]
    }
    nextCycleActions: string[] // 3-5 practical actions
    trendContradiction?: string
  }
  analyzedQuizIds: string[]
  analyzedAt: number
  modelId: string
  ownerId: string
  status: "success" | "error" | "insufficient_data"
  error?: string
}
```
