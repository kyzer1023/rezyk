import type { JsonSchemaObject } from "./quiz-analysis-schema";

export const NOTES_MODEL_ID = "gemini-3-flash-preview" as const;
export const NOTES_GENERATION_PROFILE = {
  responseMimeType: "application/json" as const,
  topP: 0.9,
  maxOutputTokens: 4096,
  temperature: 0.2,
};

export interface StudentNoteOutput {
  studentDisplayName: string;
  topWeaknesses: Array<{
    concept: string;
    errorType: string;
    likelyRootIssue: string;
  }>;
  improvementTips: string[];
  suggestedFollowUp: string;
}

export interface BatchNoteResult {
  studentId: string;
  status: "success" | "error";
  note?: StudentNoteOutput;
  error?: string;
}

export interface StoredStudentNote {
  courseId: string;
  quizId: string;
  studentId: string;
  generatedAt: number;
  modelId: string;
  sourceAnalysisId: string;
  status: "success" | "error";
  note?: StudentNoteOutput;
  error?: string;
}

export const StudentNoteGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: ["studentDisplayName", "topWeaknesses", "improvementTips", "suggestedFollowUp"],
  properties: {
    studentDisplayName: {
      type: "string",
      description: "Student display name.",
    },
    topWeaknesses: {
      type: "array",
      description: "Top weaknesses with concept, error type, and root issue.",
      items: {
        type: "object",
        required: ["concept", "errorType", "likelyRootIssue"],
        properties: {
          concept: { type: "string", description: "Concept the student struggles with." },
          errorType: { type: "string", description: "Type of error: conceptual, procedural, or careless." },
          likelyRootIssue: { type: "string", description: "Concise explanation of the likely root issue." },
        },
      },
    },
    improvementTips: {
      type: "array",
      description: "3-5 practical improvement tips.",
      items: { type: "string" },
    },
    suggestedFollowUp: {
      type: "string",
      description: "Suggested follow-up action for the teacher.",
    },
  },
};

export const StudentNoteOutputSchema: JsonSchemaObject = {
  $id: "eduinsight.student-note.v1",
  type: "object",
  additionalProperties: false,
  required: ["studentDisplayName", "topWeaknesses", "improvementTips", "suggestedFollowUp"],
  properties: {
    studentDisplayName: { type: "string", minLength: 1, maxLength: 100 },
    topWeaknesses: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["concept", "errorType", "likelyRootIssue"],
        properties: {
          concept: { type: "string", minLength: 1, maxLength: 120 },
          errorType: { type: "string", enum: ["conceptual", "procedural", "careless"] },
          likelyRootIssue: { type: "string", minLength: 1, maxLength: 300 },
        },
      },
    },
    improvementTips: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string", minLength: 1, maxLength: 300 },
    },
    suggestedFollowUp: { type: "string", minLength: 1, maxLength: 400 },
  },
};

export type RiskCategory = "critical" | "high" | "medium" | "low";
export type BatchFilter = RiskCategory | "critical+high" | "all";
export const BATCH_FILTERS: BatchFilter[] = ["critical", "high", "medium", "low", "critical+high", "all"];

export function filterStudentsByCategory(
  students: Array<{ studentId: string; riskLevel: string }>,
  filter: BatchFilter,
): Array<{ studentId: string; riskLevel: string }> {
  if (filter === "all") return students;
  if (filter === "critical+high") {
    return students.filter((s) => s.riskLevel === "critical" || s.riskLevel === "high");
  }
  return students.filter((s) => s.riskLevel === filter);
}
