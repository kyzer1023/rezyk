import type { StudentNoteInput } from "./student-notes-schema";

export function buildStudentNotePrompt(input: StudentNoteInput): string {
  return [
    "You are an educational analyst generating a tailored student asset note for a teacher.",
    "Return strict JSON only, with no markdown fences.",
    "",
    "The note must include:",
    "1. studentId and displayName (pass through from input)",
    "2. topWeaknesses: 2-4 items, each with concept, errorType, and rootIssue (concise root cause, max 150 chars)",
    "3. improvementTips: 3-5 practical, actionable tips the student can follow",
    "4. teacherFollowUp: one concise suggested follow-up action for the teacher (max 200 chars)",
    "",
    "Guidelines:",
    "- rootIssue should explain WHY the student struggles, not just restate the error",
    "- improvementTips should be specific and actionable (e.g., 'Practice converting fractions to decimals using a number line')",
    "- teacherFollowUp should be a single practical next step for the teacher",
    "- Keep language professional but accessible for teachers aged 30+",
    "- Be concise throughout",
    "",
    "Input:",
    JSON.stringify({
      studentId: input.studentId,
      displayName: input.displayName,
      riskLevel: input.riskLevel,
      score: input.score,
      maxScore: input.maxScore,
      quizTitle: input.quizTitle,
      courseName: input.courseName,
      misconceptions: input.misconceptions,
      interventions: input.interventions,
      rationale: input.rationale,
    }, null, 2),
  ].join("\n");
}
