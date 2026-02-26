import type { ModelStudentAnalysis } from "./quiz-analysis-schema";

interface NotePromptContext {
  studentDisplayName: string;
  riskLevel: string;
  misconceptions: Array<{
    concept: string;
    errorType: string;
    evidence: string;
    affectedQuestions: string[];
  }>;
  interventions: Array<{
    type: string;
    focusArea: string;
    action: string;
  }>;
  rationale: string;
  quizTitle: string;
}

export function buildStudentNotePrompt(context: NotePromptContext): string {
  return [
    "You are a teaching assistant generating a concise asset note for a teacher about a specific student's quiz performance.",
    "The note should help the teacher understand the student's weaknesses and take action.",
    "Return strict JSON only, no markdown fences.",
    "",
    "Requirements:",
    "- studentDisplayName: use the provided display name",
    "- topWeaknesses: list the student's top weaknesses from the analysis data",
    "  - Each weakness must include: concept, errorType (conceptual/procedural/careless), likelyRootIssue (concise explanation)",
    "- improvementTips: provide 3-5 practical, specific tips the student can follow to improve",
    "  - Tips should be actionable and concrete, not generic advice",
    "- suggestedFollowUp: one specific action the teacher should take next for this student",
    "",
    "Keep language clear, professional, and teacher-readable.",
    "Focus on the most impactful weaknesses and most practical tips.",
    "",
    "Student Context:",
    JSON.stringify(context, null, 2),
  ].join("\n");
}

export function buildNotePromptContext(
  student: ModelStudentAnalysis,
  displayName: string,
  quizTitle: string,
): NotePromptContext {
  return {
    studentDisplayName: displayName,
    riskLevel: student.riskLevel,
    misconceptions: student.misconceptions.map((m) => ({
      concept: m.concept,
      errorType: m.errorType,
      evidence: m.evidence,
      affectedQuestions: m.affectedQuestions,
    })),
    interventions: student.interventions.map((i) => ({
      type: i.type,
      focusArea: i.focusArea,
      action: i.action,
    })),
    rationale: student.rationale,
    quizTitle,
  };
}
