import type { HistoryAnalysisInput } from "./history-analysis-schema";

export function buildHistoryAnalysisPrompt(input: HistoryAnalysisInput): string {
  return [
    "You are an educational trend analyst.",
    "Analyze quiz performance history and return strict JSON only (no markdown fences).",
    "",
    "Rules:",
    "- if fewer than 2 quizzes are available, output overallTrend='insufficient_data' with low confidence",
    "- if score trend and risk trend conflict, explain it in trendContradiction",
    "- avoid strong causality claims; use evidence-based wording",
    "- keep outputs concise, teacher-readable, and operational",
    "",
    "Required outputs:",
    "- overallTrend",
    "- confidence",
    "- evidenceSummary.scoreTrajectorySummary",
    "- evidenceSummary.riskTrajectorySummary",
    "- evidenceSummary.recurringWeakConcepts (max 5)",
    "- interventionImpactHypothesis.appearsToImprove",
    "- interventionImpactHypothesis.remainsUnresolved",
    "- nextCycleActions (3-5 actions)",
    "",
    "Input:",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
