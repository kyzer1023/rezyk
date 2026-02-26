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
  analysisInput: QuizAnalysisInput // original input sent to Gemini
  emailMapping: Record<string, string> // studentId -> email
  createdAt: number
  modelId: string
  ownerId: string
}
```

### `studentNotes/{courseId_quizId_studentId}`
Stores AI-generated student asset notes.

```
{
  courseId: string
  quizId: string
  studentId: string
  generatedAt: number
  modelId: string
  sourceAnalysisId: string
  status: "success" | "error"
  note?: {
    studentDisplayName: string
    topWeaknesses: [{
      concept: string
      errorType: "conceptual" | "procedural" | "careless"
      likelyRootIssue: string
    }]
    improvementTips: string[]       // 3-5 practical tips
    suggestedFollowUp: string
  }
  error?: string
}
```

### `courseAnalyses/{courseId}`
Stores course-wide material analysis results.

```
{
  courseId: string
  analyzedQuizIds: string[]
  generatedAt: number
  modelId: string
  status: "success" | "error" | "insufficient_data"
  analysis?: CourseAnalysisOutput   // from course-analysis-schema.ts
  error?: string
  ownerId: string
}
```

### `historyAnalyses/{courseId}`
Stores longitudinal history analysis results.

```
{
  courseId: string
  analyzedQuizIds: string[]
  generatedAt: number
  modelId: string
  status: "success" | "error" | "insufficient_data"
  analysis?: {
    overallTrend: "improving" | "stable" | "declining" | "insufficient_data"
    confidence: "low" | "medium" | "high"
    evidenceSummary: {
      scoreTrajectory: string
      riskTrajectory: string
      recurringWeakConcepts: string[]
    }
    interventionImpactHypothesis: {
      appearsToImprove: string[]
      remainsUnresolved: string[]
    }
    nextCycleActions: string[]      // 3-5 actionable steps
    contradictionFlag?: string
  }
  error?: string
  ownerId: string
}
```
