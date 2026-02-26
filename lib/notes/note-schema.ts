import type { JsonSchemaObject } from "@/lib/gemini";

export interface StudentNote {
  topWeaknesses: { concept: string; errorType: string }[];
  rootIssue: string;
  improvementTips: string[];
  followUpAction: string;
}

export interface StoredNote {
  courseId: string;
  quizId: string;
  studentId: string;
  displayName: string;
  riskLevel: string;
  note: StudentNote;
  generatedAt: number;
  modelId: string;
  sourceAnalysisId: string;
  status: "success" | "error";
  error?: string;
  ownerId: string;
}

export const NoteGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: ["topWeaknesses", "rootIssue", "improvementTips", "followUpAction"],
  properties: {
    topWeaknesses: {
      type: "array",
      items: {
        type: "object",
        required: ["concept", "errorType"],
        properties: {
          concept: { type: "string", description: "Concept area where student is weak." },
          errorType: {
            type: "string",
            enum: ["conceptual", "procedural", "careless"],
            description: "Type of error pattern observed.",
          },
        },
      },
      description: "Top 2-4 weaknesses identified from analysis.",
    },
    rootIssue: {
      type: "string",
      description: "Concise explanation of the likely root issue behind the student's mistakes (2-3 sentences).",
    },
    improvementTips: {
      type: "array",
      items: { type: "string" },
      description: "3-5 practical improvement tips the teacher can share with the student.",
    },
    followUpAction: {
      type: "string",
      description: "Suggested follow-up action for the teacher (1-2 sentences).",
    },
  },
};

export function buildNotePrompt(studentData: {
  displayName: string;
  riskLevel: string;
  misconceptions: { concept: string; errorType: string; evidence: string }[];
  interventions: { type: string; focusArea: string; action: string }[];
  rationale: string;
  quizTitle: string;
}): string {
  return [
    "You are a teacher's assistant generating a personalized asset note for a student.",
    "Return strict JSON only, no markdown fences.",
    "",
    "Write the note so a teacher can hand it to the student or use it in a parent-teacher conference.",
    "Be specific, actionable, and encouraging. Reference the student's actual mistakes.",
    "",
    "Requirements:",
    "- topWeaknesses: 2-4 items listing concept + errorType from the analysis",
    "- rootIssue: 2-3 sentences explaining the likely root cause of the student's struggles",
    "- improvementTips: 3-5 practical, specific tips the student can follow to improve",
    "- followUpAction: 1-2 sentences telling the teacher what to do next for this student",
    "",
    "Student data:",
    JSON.stringify(studentData, null, 2),
  ].join("\n");
}
