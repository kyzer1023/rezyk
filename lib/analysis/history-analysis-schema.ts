import type { JsonSchemaObject } from "@/lib/gemini";

export interface HistoryAnalysisResult {
  overallTrend: "improving" | "stable" | "declining" | "insufficient_data";
  confidence: "low" | "medium" | "high";
  evidenceSummary: {
    scoreTrajectory: string;
    riskTrajectory: string;
    recurringWeakConcepts: string[];
  };
  interventionImpactHypothesis: {
    improving: string[];
    unresolved: string[];
  };
  nextCycleActions: string[];
  contradictionFlag?: string;
}

export const HistoryAnalysisGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: ["overallTrend", "confidence", "evidenceSummary", "interventionImpactHypothesis", "nextCycleActions"],
  properties: {
    overallTrend: {
      type: "string",
      enum: ["improving", "stable", "declining", "insufficient_data"],
      description: "Overall direction of class performance across quizzes.",
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
      description: "Confidence level in the trend assessment.",
    },
    evidenceSummary: {
      type: "object",
      required: ["scoreTrajectory", "riskTrajectory", "recurringWeakConcepts"],
      properties: {
        scoreTrajectory: { type: "string", description: "1-2 sentence summary of score progression." },
        riskTrajectory: { type: "string", description: "1-2 sentence summary of risk level changes." },
        recurringWeakConcepts: {
          type: "array",
          items: { type: "string" },
          description: "Up to 5 concepts that remain weak across multiple quizzes.",
        },
      },
    },
    interventionImpactHypothesis: {
      type: "object",
      required: ["improving", "unresolved"],
      properties: {
        improving: { type: "array", items: { type: "string" }, description: "Areas that appear to be improving." },
        unresolved: { type: "array", items: { type: "string" }, description: "Areas that remain unresolved." },
      },
    },
    nextCycleActions: {
      type: "array",
      items: { type: "string" },
      description: "3-5 actionable teacher steps for the next teaching cycle.",
    },
    contradictionFlag: {
      type: "string",
      description: "If score trend and risk trend conflict, explain the contradiction here. Otherwise empty string.",
    },
  },
};

export function buildHistoryAnalysisPrompt(data: {
  courseName: string;
  quizSequence: {
    quizId: string;
    title: string;
    date: string;
    scoreMetrics: { averageScore: number; medianScore: number; averageCompletionRate: number };
    riskDistribution: { riskLevel: string; count: number; percentage: number }[];
    conceptHeatmap: { concept: string; affectedStudentCount: number; dominantErrorType: string }[];
    errorTypeBreakdown: { errorType: string; count: number; percentage: number }[];
    studentCount: number;
  }[];
}): string {
  return [
    "You are an educational data analyst evaluating class performance trends over time.",
    "Return strict JSON only, no markdown fences.",
    "",
    "Analyze the quiz sequence chronologically and determine:",
    "1. Overall trend direction (improving, stable, declining, or insufficient_data)",
    "2. Your confidence level in this assessment",
    "3. Evidence summary: score trajectory, risk trajectory, recurring weak concepts (max 5)",
    "4. Intervention impact hypothesis: what appears to be improving vs what remains unresolved",
    "5. Next cycle actions: 3-5 specific, practical steps for the teacher",
    "",
    "RULES:",
    "- Minimum 2 quizzes required; if fewer, return overallTrend='insufficient_data'",
    "- If score trend and risk trend conflict, set contradictionFlag to explain the discrepancy",
    "- Do NOT claim causality strongly; phrase as evidence-based hypothesis",
    "- Keep outputs short, teacher-readable, and operational",
    "- Reference actual concept names from the data",
    "",
    "Course data:",
    JSON.stringify(data, null, 2),
  ].join("\n");
}
