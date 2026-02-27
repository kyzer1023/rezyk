import type { StudentNoteInput } from "./student-notes-schema";

export function buildStudentNotePrompt(input: StudentNoteInput): string {
  return [
    "You are an educational analyst generating a tailored student asset note for a teacher.",
    "Return strict JSON only, with no markdown fences.",
    "",
    "The note must include:",
    "1. studentId and displayName (pass through exactly from input)",
    "2. topWeaknesses: 2-4 items with concept, errorType, and rootIssue",
    "3. improvementTips: 3-5 practical, actionable tips",
    "4. teacherFollowUp: one concise, specific next action for the teacher",
    "",
    "Guidelines:",
    "- rootIssue explains why the student is struggling",
    "- keep all language concise and teacher-readable",
    "- avoid generic advice; use concrete suggestions",
    "- all output is an AI-generated draft",
    "",
    "Input:",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
