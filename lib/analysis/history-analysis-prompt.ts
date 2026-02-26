import type { HistoryAnalysisInput } from "./history-analysis-schema";

export function buildHistoryAnalysisPrompt(input: HistoryAnalysisInput): string {
  return [
    "You are an educational trend analyst. Analyze quiz performance history for a course to determine whether outcomes are improving, stable, or declining.",
    "Return strict JSON only, with no markdown fences.",
    "",
    "Rules:",
    "- Minimum 2 analyzed quizzes required. If fewer, return overallTrend: 'insufficient_data', confidence: 'low', and explain in evidenceSummary.",
    "- If score trend and risk trend conflict, flag the contradiction in trendContradiction field.",
    "- Do not claim causality strongly; phrase as evidence-based hypothesis.",
    "- Keep all text short, teacher-readable, and operational.",
    "- recurringWeakConcepts: max 5 concepts.",
    "- nextCycleActions: 3-5 actionable steps.",
    "",
    "Required output fields:",
    "- overallTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data'",
    "- confidence: 'low' | 'medium' | 'high'",
    "- evidenceSummary: { scoreTrajectorySummary, riskTrajectorySummary, recurringWeakConcepts }",
    "- interventionImpactHypothesis: { appearsToImprove, remainsUnresolved }",
    "- nextCycleActions: string[]",
    "- trendContradiction: string (optional, only if trends conflict)",
    "",
    "Input:",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
