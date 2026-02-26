import type { CourseMaterialInput } from "./course-material-schema";

export function buildCourseMaterialPrompt(input: CourseMaterialInput): string {
  return [
    "You are an educational content analyst. Analyze course-wide material and assessment data to provide actionable insights for a teacher.",
    "Return strict JSON only, with no markdown fences.",
    "",
    "Evaluate the following criteria:",
    "1. Content coverage: which concepts are taught vs assessed, and where are gaps?",
    "2. Alignment: how well do materials align with quiz outcomes?",
    "3. Difficulty progression: is sequencing from foundational to advanced appropriate?",
    "4. Misconception recurrence: which concepts are repeatedly weak across quizzes?",
    "5. Assessment balance: conceptual vs procedural vs application emphasis (as percentages, must sum to 100).",
    "6. Gaps: under-covered and over-weighted concepts.",
    "7. Intervention opportunities: what content should be reinforced next cycle?",
    "",
    "Also return:",
    "- topWeakConcepts: up to 5 most impactful weak concepts across all quizzes",
    "- likelyRootCauses: 2-4 likely root causes at course level",
    "- prioritizedActions: 3-5 short, practical teaching actions",
    "",
    "If there is insufficient data (e.g., fewer than 2 quizzes analyzed), set dataQuality to 'insufficient_data' and include reasons.",
    "",
    "Keep all text fields short, teacher-readable, and operational.",
    "Label all outputs as AI-generated analysis.",
    "",
    "Input:",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
