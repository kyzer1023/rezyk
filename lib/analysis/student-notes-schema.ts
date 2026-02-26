import type { JsonSchemaObject, RiskLevel } from "./quiz-analysis-schema";

export interface StudentNoteInput {
  studentId: string;
  displayName: string;
  email: string;
  riskLevel: RiskLevel;
  score: number;
  maxScore: number;
  misconceptions: {
    concept: string;
    errorType: string;
    evidence: string;
    affectedQuestions: string[];
  }[];
  interventions: {
    type: string;
    focusArea: string;
    action: string;
  }[];
  rationale: string;
  quizTitle: string;
  courseName: string;
}

export interface StudentNoteOutput {
  studentId: string;
  displayName: string;
  topWeaknesses: {
    concept: string;
    errorType: string;
    rootIssue: string;
  }[];
  improvementTips: string[];
  teacherFollowUp: string;
}

export interface BatchNoteRequest {
  courseId: string;
  quizId: string;
  categoryFilter: RiskLevel | "critical_high" | "all";
}

export interface SavedStudentNote {
  noteId: string;
  courseId: string;
  quizId: string;
  studentId: string;
  displayName: string;
  note: StudentNoteOutput;
  generatedAt: number;
  modelId: string;
  sourceAnalysisId: string;
  status: "success" | "error";
  error?: string;
  ownerId: string;
}

export interface BatchNoteResult {
  generated: number;
  failed: number;
  total: number;
  notes: SavedStudentNote[];
  errors: { studentId: string; error: string }[];
}

export const StudentNoteGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: ["studentId", "displayName", "topWeaknesses", "improvementTips", "teacherFollowUp"],
  properties: {
    studentId: { type: "string" },
    displayName: { type: "string" },
    topWeaknesses: {
      type: "array",
      description: "Top 2-4 weaknesses with concept, error type, and concise root issue explanation.",
      items: {
        type: "object",
        required: ["concept", "errorType", "rootIssue"],
        properties: {
          concept: { type: "string" },
          errorType: { type: "string", enum: ["conceptual", "procedural", "careless"] },
          rootIssue: { type: "string", description: "Concise explanation of the likely root cause (max 150 chars)." },
        },
      },
    },
    improvementTips: {
      type: "array",
      description: "3-5 practical, actionable improvement tips for the student.",
      items: { type: "string" },
    },
    teacherFollowUp: {
      type: "string",
      description: "A concise suggested follow-up action for the teacher (max 200 chars).",
    },
  },
};
