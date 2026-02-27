import type { JsonSchemaObject, RiskLevel } from "./quiz-analysis-schema";

export const STUDENT_NOTES_MODEL_ID = "gemini-3-flash-preview" as const;
export const STUDENT_NOTES_GENERATION_PROFILE = {
  responseMimeType: "application/json" as const,
  topP: 0.9,
  maxOutputTokens: 4096,
  temperature: 0.2,
};

export interface StudentNoteInput {
  studentId: string;
  displayName: string;
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
    errorType: "conceptual" | "procedural" | "careless";
    rootIssue: string;
  }[];
  improvementTips: string[];
  teacherFollowUp: string;
}

export interface SavedStudentNote {
  noteId: string;
  courseId: string;
  quizId: string;
  studentId: string;
  displayName: string;
  note: StudentNoteOutput | null;
  generatedAt: number;
  modelId: string;
  sourceAnalysisId: string;
  status: "success" | "error";
  error?: string;
  ownerId: string;
}

export interface BatchNoteResultItem {
  studentId: string;
  status: "success" | "error";
  error?: string;
}

export type BatchCategoryFilter = RiskLevel | "critical_high" | "critical+high" | "all";

export const BATCH_CATEGORY_FILTERS: BatchCategoryFilter[] = [
  "critical",
  "high",
  "medium",
  "low",
  "critical_high",
  "critical+high",
  "all",
];

export const StudentNoteGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: ["studentId", "displayName", "topWeaknesses", "improvementTips", "teacherFollowUp"],
  properties: {
    studentId: { type: "string" },
    displayName: { type: "string" },
    topWeaknesses: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        required: ["concept", "errorType", "rootIssue"],
        properties: {
          concept: { type: "string" },
          errorType: { type: "string", enum: ["conceptual", "procedural", "careless"] },
          rootIssue: { type: "string" },
        },
      },
    },
    improvementTips: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" },
    },
    teacherFollowUp: { type: "string" },
  },
};
