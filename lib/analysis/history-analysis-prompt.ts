interface QuizDataPoint {
  quizId: string;
  quizTitle: string;
  analyzedAt: number;
  averageScore: number;
  medianScore: number;
  completionRate: number;
  studentCount: number;
  riskDistribution: Array<{ riskLevel: string; count: number; percentage: number }>;
  topWeakConcepts: Array<{ concept: string; affectedStudentCount: number }>;
  errorTypeBreakdown: Array<{ errorType: string; count: number; percentage: number }>;
}

export interface HistoryAnalysisPromptInput {
  courseName: string;
  courseId: string;
  quizDataPoints: QuizDataPoint[];
}

export function buildHistoryAnalysisPrompt(input: HistoryAnalysisPromptInput): string {
  return [
    "You are a longitudinal education analyst. Analyze quiz performance data over time to identify trends and provide actionable insights.",
    "Return strict JSON only, no markdown fences.",
    "",
    "Rules:",
    "- Minimum 2 quizzes are required for meaningful analysis.",
    "- Analyze score trajectory, risk level changes, and recurring misconceptions across time.",
    "- If score trend and risk trend conflict, set contradictionFlag explaining the discrepancy.",
    "- Do not claim strong causality; phrase as evidence-based hypotheses.",
    "- Keep outputs short, teacher-readable, and operational.",
    "",
    "Requirements:",
    "- overallTrend: improving/stable/declining/insufficient_data based on score and risk trajectories",
    "- confidence: low/medium/high based on data quantity and consistency",
    "- evidenceSummary:",
    "  - scoreTrajectory: summary of how scores changed over the quiz sequence",
    "  - riskTrajectory: summary of how risk distributions shifted",
    "  - recurringWeakConcepts: max 5 concepts that appear weak in multiple quizzes",
    "- interventionImpactHypothesis:",
    "  - appearsToImprove: areas showing improvement signals",
    "  - remainsUnresolved: areas that persist as problems",
    "- nextCycleActions: 3-5 specific, practical teacher steps for the next cycle",
    "- contradictionFlag: only set if score and risk trends conflict",
    "",
    "Course History Data (ordered chronologically):",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
