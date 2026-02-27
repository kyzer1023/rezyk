import type { CourseMaterialInput } from "./course-material-schema";

export function buildCourseMaterialPrompt(input: CourseMaterialInput): string {
  return [
    "You are an educational content analyst.",
    "Analyze course-wide quiz evidence and return strict JSON only (no markdown fences).",
    "",
    "Evaluate:",
    "1. content coverage (taught vs assessed concepts, with gaps)",
    "2. alignment between materials and outcomes",
    "3. difficulty progression across quizzes",
    "4. recurring misconceptions across quizzes",
    "5. assessment balance (conceptual/procedural/application, sum approximately 100)",
    "6. intervention opportunities for the next cycle",
    "",
    "Also provide:",
    "- topWeakConcepts (max 5)",
    "- likelyRootCauses (2-4)",
    "- prioritizedActions (3-5 practical actions)",
    "",
    "If there is insufficient data, set dataQuality='insufficient_data' and include reasons.",
    "Keep language concise, teacher-readable, and actionable.",
    "",
    "Input:",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
