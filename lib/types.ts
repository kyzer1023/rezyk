export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ErrorType = "conceptual" | "procedural" | "careless";
export type InterventionType = "worksheet" | "video" | "mini-quiz";
export type SyncStatus = "not_synced" | "syncing" | "synced" | "error";
export type AnalysisStatus = "not_started" | "running" | "completed" | "error";

export interface User {
  name: string;
  email: string;
  avatar: string;
  isFirstTime: boolean;
}

export interface Course {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  lastSynced: string | null;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  formId: string;
  dueDate: string;
  responseCount: number;
  totalStudents: number;
  syncStatus: SyncStatus;
  analysisStatus: AnalysisStatus;
}

export interface KnowledgeGap {
  concept: string;
  severity: "minor" | "moderate" | "severe";
  errorType: ErrorType;
  affectedQuestions: string[];
}

export interface Intervention {
  type: InterventionType;
  focusArea: string;
  description: string;
  planned: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  riskLevel: RiskLevel;
  score: number;
  totalScore: number;
  knowledgeGaps: KnowledgeGap[];
  interventions: Intervention[];
}

export interface ConceptHeatmapEntry {
  concept: string;
  questionIds: string[];
  correctRate: number;
  studentsMastered: number;
  studentsStruggling: number;
  dominantErrorType: ErrorType;
}

export interface RiskDistributionEntry {
  level: RiskLevel;
  count: number;
  percentage: number;
}

export interface ErrorTypeBreakdown {
  type: ErrorType;
  count: number;
  percentage: number;
}

export interface QuizSnapshot {
  quizId: string;
  quizTitle: string;
  date: string;
  averageScore: number;
  riskDistribution: RiskDistributionEntry[];
  topWeakConcepts: string[];
}

export interface SyncStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
  detail: string;
}

export interface AnalysisResult {
  quizId: string;
  conceptHeatmap: ConceptHeatmapEntry[];
  riskDistribution: RiskDistributionEntry[];
  errorTypeBreakdown: ErrorTypeBreakdown[];
  averageScore: number;
  medianScore: number;
  completionRate: number;
}
