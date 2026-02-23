import type {
  User,
  Course,
  Quiz,
  Student,
  AnalysisResult,
  QuizSnapshot,
  SyncStep,
} from "./types";

export const mockUser: User = {
  name: "Sarah Chen",
  email: "sarah.chen@school.edu",
  avatar: "SC",
  isFirstTime: false,
};

export const mockCourses: Course[] = [
  {
    id: "course-1",
    name: "Mathematics 101",
    section: "Section A - Morning",
    studentCount: 32,
    lastSynced: "2026-02-20T14:30:00Z",
  },
  {
    id: "course-2",
    name: "Mathematics 201",
    section: "Section B - Afternoon",
    studentCount: 28,
    lastSynced: "2026-02-19T09:15:00Z",
  },
  {
    id: "course-3",
    name: "Statistics Fundamentals",
    section: "Section C - Evening",
    studentCount: 24,
    lastSynced: null,
  },
];

export const mockQuizzes: Quiz[] = [
  {
    id: "quiz-1",
    courseId: "course-1",
    title: "Fractions & Decimals - Chapter 4 Quiz",
    formId: "form-abc123",
    dueDate: "2026-02-18",
    responseCount: 30,
    totalStudents: 32,
    syncStatus: "synced",
    analysisStatus: "completed",
  },
  {
    id: "quiz-2",
    courseId: "course-1",
    title: "Algebra Basics - Midterm Review",
    formId: "form-def456",
    dueDate: "2026-02-22",
    responseCount: 28,
    totalStudents: 32,
    syncStatus: "synced",
    analysisStatus: "completed",
  },
  {
    id: "quiz-3",
    courseId: "course-1",
    title: "Geometry Intro - Weekly Check",
    formId: "form-ghi789",
    dueDate: "2026-02-25",
    responseCount: 0,
    totalStudents: 32,
    syncStatus: "not_synced",
    analysisStatus: "not_started",
  },
  {
    id: "quiz-4",
    courseId: "course-2",
    title: "Quadratic Equations - Unit Test",
    formId: "form-jkl012",
    dueDate: "2026-02-17",
    responseCount: 26,
    totalStudents: 28,
    syncStatus: "synced",
    analysisStatus: "completed",
  },
  {
    id: "quiz-5",
    courseId: "course-2",
    title: "Polynomials - Practice Quiz",
    formId: "form-mno345",
    dueDate: "2026-02-21",
    responseCount: 24,
    totalStudents: 28,
    syncStatus: "synced",
    analysisStatus: "not_started",
  },
  {
    id: "quiz-6",
    courseId: "course-3",
    title: "Probability Basics - Quiz 1",
    formId: "form-pqr678",
    dueDate: "2026-02-20",
    responseCount: 22,
    totalStudents: 24,
    syncStatus: "synced",
    analysisStatus: "completed",
  },
];

export const mockStudents: Student[] = [
  {
    id: "student-1",
    name: "Amir Hassan",
    email: "amir.h@school.edu",
    riskLevel: "critical",
    score: 12,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Fraction Division", severity: "severe", errorType: "conceptual", affectedQuestions: ["Q3", "Q7", "Q10"] },
      { concept: "Decimal Conversion", severity: "moderate", errorType: "procedural", affectedQuestions: ["Q5", "Q8"] },
    ],
    interventions: [
      { type: "video", focusArea: "Fraction Division", description: "Watch visual fraction division tutorial (10 min)", planned: false },
      { type: "worksheet", focusArea: "Decimal Conversion", description: "Complete decimal-fraction conversion practice set", planned: false },
    ],
  },
  {
    id: "student-2",
    name: "Li Wei",
    email: "li.wei@school.edu",
    riskLevel: "high",
    score: 18,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Fraction Division", severity: "moderate", errorType: "procedural", affectedQuestions: ["Q3", "Q10"] },
      { concept: "Word Problems", severity: "moderate", errorType: "conceptual", affectedQuestions: ["Q9", "Q10"] },
    ],
    interventions: [
      { type: "mini-quiz", focusArea: "Fraction Division", description: "Targeted 5-question practice on fraction operations", planned: true },
      { type: "worksheet", focusArea: "Word Problems", description: "Guided word problem breakdown exercises", planned: false },
    ],
  },
  {
    id: "student-3",
    name: "Priya Sharma",
    email: "priya.s@school.edu",
    riskLevel: "high",
    score: 20,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Decimal Place Value", severity: "severe", errorType: "conceptual", affectedQuestions: ["Q2", "Q5", "Q8"] },
    ],
    interventions: [
      { type: "video", focusArea: "Decimal Place Value", description: "Interactive place value number line activity", planned: false },
    ],
  },
  {
    id: "student-4",
    name: "James Okafor",
    email: "james.o@school.edu",
    riskLevel: "medium",
    score: 26,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Fraction Simplification", severity: "minor", errorType: "careless", affectedQuestions: ["Q4"] },
      { concept: "Decimal Ordering", severity: "moderate", errorType: "procedural", affectedQuestions: ["Q6", "Q8"] },
    ],
    interventions: [
      { type: "worksheet", focusArea: "Decimal Ordering", description: "Number line ordering practice with decimals", planned: false },
    ],
  },
  {
    id: "student-5",
    name: "Maria Santos",
    email: "maria.s@school.edu",
    riskLevel: "medium",
    score: 28,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Word Problems", severity: "moderate", errorType: "conceptual", affectedQuestions: ["Q9"] },
    ],
    interventions: [
      { type: "mini-quiz", focusArea: "Word Problems", description: "Step-by-step word problem scaffolding quiz", planned: true },
    ],
  },
  {
    id: "student-6",
    name: "Tom Nguyen",
    email: "tom.n@school.edu",
    riskLevel: "medium",
    score: 27,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Fraction Division", severity: "minor", errorType: "careless", affectedQuestions: ["Q7"] },
      { concept: "Decimal Conversion", severity: "minor", errorType: "procedural", affectedQuestions: ["Q5"] },
    ],
    interventions: [
      { type: "worksheet", focusArea: "Fraction Division", description: "Quick fraction review with self-check answers", planned: false },
    ],
  },
  {
    id: "student-7",
    name: "Fatimah Ali",
    email: "fatimah.a@school.edu",
    riskLevel: "low",
    score: 34,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Word Problems", severity: "minor", errorType: "careless", affectedQuestions: ["Q10"] },
    ],
    interventions: [
      { type: "mini-quiz", focusArea: "Word Problems", description: "Challenge-level word problems for enrichment", planned: false },
    ],
  },
  {
    id: "student-8",
    name: "Chen Yu",
    email: "chen.y@school.edu",
    riskLevel: "low",
    score: 36,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Fraction Simplification", severity: "minor", errorType: "careless", affectedQuestions: ["Q4"] },
    ],
    interventions: [],
  },
  {
    id: "student-9",
    name: "Sarah Kim",
    email: "sarah.k@school.edu",
    riskLevel: "low",
    score: 38,
    totalScore: 40,
    knowledgeGaps: [],
    interventions: [],
  },
  {
    id: "student-10",
    name: "David Brown",
    email: "david.b@school.edu",
    riskLevel: "low",
    score: 35,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Decimal Ordering", severity: "minor", errorType: "careless", affectedQuestions: ["Q6"] },
    ],
    interventions: [],
  },
  {
    id: "student-11",
    name: "Rina Tanaka",
    email: "rina.t@school.edu",
    riskLevel: "critical",
    score: 10,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Fraction Division", severity: "severe", errorType: "conceptual", affectedQuestions: ["Q3", "Q7", "Q10"] },
      { concept: "Decimal Place Value", severity: "severe", errorType: "conceptual", affectedQuestions: ["Q2", "Q5"] },
      { concept: "Fraction Simplification", severity: "moderate", errorType: "procedural", affectedQuestions: ["Q1", "Q4"] },
    ],
    interventions: [
      { type: "video", focusArea: "Fraction Division", description: "Foundational fraction concepts video series", planned: false },
      { type: "worksheet", focusArea: "Decimal Place Value", description: "Place value mat hands-on activity", planned: false },
    ],
  },
  {
    id: "student-12",
    name: "Ahmed Khalil",
    email: "ahmed.k@school.edu",
    riskLevel: "high",
    score: 19,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Decimal Conversion", severity: "moderate", errorType: "procedural", affectedQuestions: ["Q5", "Q8"] },
      { concept: "Fraction Division", severity: "moderate", errorType: "conceptual", affectedQuestions: ["Q7"] },
    ],
    interventions: [
      { type: "worksheet", focusArea: "Decimal Conversion", description: "Step-by-step conversion practice with visual aids", planned: true },
    ],
  },
  {
    id: "student-13",
    name: "Emma Wilson",
    email: "emma.w@school.edu",
    riskLevel: "medium",
    score: 25,
    totalScore: 40,
    knowledgeGaps: [
      { concept: "Word Problems", severity: "moderate", errorType: "conceptual", affectedQuestions: ["Q9", "Q10"] },
    ],
    interventions: [
      { type: "mini-quiz", focusArea: "Word Problems", description: "Contextual word problem mini-assessment", planned: false },
    ],
  },
  {
    id: "student-14",
    name: "Raj Patel",
    email: "raj.p@school.edu",
    riskLevel: "low",
    score: 33,
    totalScore: 40,
    knowledgeGaps: [],
    interventions: [],
  },
  {
    id: "student-15",
    name: "Sofia Garcia",
    email: "sofia.g@school.edu",
    riskLevel: "low",
    score: 37,
    totalScore: 40,
    knowledgeGaps: [],
    interventions: [],
  },
];

export const mockAnalysisResult: AnalysisResult = {
  quizId: "quiz-1",
  conceptHeatmap: [
    { concept: "Fraction Division", questionIds: ["Q3", "Q7", "Q10"], correctRate: 0.45, studentsMastered: 14, studentsStruggling: 16, dominantErrorType: "conceptual" },
    { concept: "Decimal Place Value", questionIds: ["Q2", "Q5"], correctRate: 0.58, studentsMastered: 18, studentsStruggling: 12, dominantErrorType: "conceptual" },
    { concept: "Decimal Conversion", questionIds: ["Q5", "Q8"], correctRate: 0.63, studentsMastered: 19, studentsStruggling: 11, dominantErrorType: "procedural" },
    { concept: "Fraction Simplification", questionIds: ["Q1", "Q4"], correctRate: 0.75, studentsMastered: 23, studentsStruggling: 7, dominantErrorType: "careless" },
    { concept: "Decimal Ordering", questionIds: ["Q6"], correctRate: 0.80, studentsMastered: 24, studentsStruggling: 6, dominantErrorType: "procedural" },
    { concept: "Word Problems", questionIds: ["Q9", "Q10"], correctRate: 0.52, studentsMastered: 16, studentsStruggling: 14, dominantErrorType: "conceptual" },
  ],
  riskDistribution: [
    { level: "critical", count: 2, percentage: 7 },
    { level: "high", count: 4, percentage: 13 },
    { level: "medium", count: 5, percentage: 17 },
    { level: "low", count: 19, percentage: 63 },
  ],
  errorTypeBreakdown: [
    { type: "conceptual", count: 14, percentage: 47 },
    { type: "procedural", count: 10, percentage: 33 },
    { type: "careless", count: 6, percentage: 20 },
  ],
  averageScore: 27.2,
  medianScore: 28,
  completionRate: 93.75,
};

export const mockHistorySnapshots: QuizSnapshot[] = [
  {
    quizId: "quiz-prev-1",
    quizTitle: "Number Systems - Chapter 1",
    date: "2026-01-15",
    averageScore: 24.5,
    riskDistribution: [
      { level: "critical", count: 3, percentage: 10 },
      { level: "high", count: 6, percentage: 20 },
      { level: "medium", count: 8, percentage: 27 },
      { level: "low", count: 13, percentage: 43 },
    ],
    topWeakConcepts: ["Place Value", "Number Line", "Rounding"],
  },
  {
    quizId: "quiz-prev-2",
    quizTitle: "Operations Review - Chapter 2",
    date: "2026-01-29",
    averageScore: 25.8,
    riskDistribution: [
      { level: "critical", count: 2, percentage: 7 },
      { level: "high", count: 5, percentage: 17 },
      { level: "medium", count: 7, percentage: 23 },
      { level: "low", count: 16, percentage: 53 },
    ],
    topWeakConcepts: ["Long Division", "Order of Operations"],
  },
  {
    quizId: "quiz-prev-3",
    quizTitle: "Fractions Intro - Chapter 3",
    date: "2026-02-10",
    averageScore: 26.1,
    riskDistribution: [
      { level: "critical", count: 2, percentage: 7 },
      { level: "high", count: 4, percentage: 13 },
      { level: "medium", count: 6, percentage: 20 },
      { level: "low", count: 18, percentage: 60 },
    ],
    topWeakConcepts: ["Equivalent Fractions", "Mixed Numbers"],
  },
  {
    quizId: "quiz-1",
    quizTitle: "Fractions & Decimals - Chapter 4",
    date: "2026-02-18",
    averageScore: 27.2,
    riskDistribution: [
      { level: "critical", count: 2, percentage: 7 },
      { level: "high", count: 4, percentage: 13 },
      { level: "medium", count: 5, percentage: 17 },
      { level: "low", count: 19, percentage: 63 },
    ],
    topWeakConcepts: ["Fraction Division", "Word Problems", "Decimal Place Value"],
  },
];

export const mockSyncSteps: SyncStep[] = [
  { id: "step-1", label: "Fetching course roster", status: "completed", detail: "32 students loaded" },
  { id: "step-2", label: "Loading quiz metadata", status: "completed", detail: "10 questions found" },
  { id: "step-3", label: "Downloading form responses", status: "completed", detail: "30 of 32 responses received" },
  { id: "step-4", label: "Matching students to submissions", status: "completed", detail: "30 matched, 2 absent" },
  { id: "step-5", label: "Validating data integrity", status: "completed", detail: "All checks passed" },
];

export function getQuizzesForCourse(courseId: string): Quiz[] {
  return mockQuizzes.filter((q) => q.courseId === courseId);
}

export function getCourseById(courseId: string): Course | undefined {
  return mockCourses.find((c) => c.id === courseId);
}

export function getQuizById(quizId: string): Quiz | undefined {
  return mockQuizzes.find((q) => q.id === quizId);
}

export function getStudentById(studentId: string): Student | undefined {
  return mockStudents.find((s) => s.id === studentId);
}

export function getStudentsByRisk(risk?: string): Student[] {
  if (!risk || risk === "all") return mockStudents;
  return mockStudents.filter((s) => s.riskLevel === risk);
}

export function getNextAtRiskStudent(currentId: string): Student | undefined {
  const atRisk = mockStudents.filter((s) => s.riskLevel === "critical" || s.riskLevel === "high");
  const idx = atRisk.findIndex((s) => s.id === currentId);
  if (idx === -1 || idx === atRisk.length - 1) return atRisk[0];
  return atRisk[idx + 1];
}
