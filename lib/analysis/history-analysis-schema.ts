import type { JsonSchemaObject } from "./quiz-analysis-schema";

export interface HistoryAnalysisInput {
  courseId: string;
  courseName: string;
  quizSequence: {
    quizId: string;
    quizTitle: string;
    date: string;
    responseCount: number;
    averageScore: number;
    medianScore: number;
    completionRate: number;
    riskDistribution: { riskLevel: string; count: number; percentage: number }[];
    topWeakConcepts: string[];
    errorTypeBreakdown: { errorType: string; percentage: number }[];
  }[];
}

export interface HistoryAnalysisOutput {
  overallTrend: "improving" | "stable" | "declining" | "insufficient_data";
  confidence: "low" | "medium" | "high";
  evidenceSummary: {
    scoreTrajectorySummary: string;
    riskTrajectorySummary: string;
    recurringWeakConcepts: string[];
  };
  interventionImpactHypothesis: {
    appearsToImprove: string[];
    remainsUnresolved: string[];
  };
  nextCycleActions: string[];
  trendContradiction?: string;
}

export interface SavedHistoryAnalysis {
  courseId: string;
  analysis: HistoryAnalysisOutput;
  analyzedQuizIds: string[];
  analyzedAt: number;
  modelId: string;
  ownerId: string;
  status: "success" | "error";
  error?: string;
}

export const HistoryAnalysisGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: ["overallTrend", "confidence", "evidenceSummary", "interventionImpactHypothesis", "nextCycleActions"],
  properties: {
    overallTrend: {
      type: "string",
      enum: ["improving", "stable", "declining", "insufficient_data"],
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    evidenceSummary: {
      type: "object",
      required: ["scoreTrajectorySummary", "riskTrajectorySummary", "recurringWeakConcepts"],
      properties: {
        scoreTrajectorySummary: { type: "string", description: "Concise summary of score changes over time." },
        riskTrajectorySummary: { type: "string", description: "Concise summary of risk distribution changes." },
        recurringWeakConcepts: {
          type: "array",
          items: { type: "string" },
          description: "Up to 5 concepts that recur as weak across multiple quizzes.",
        },
      },
    },
    interventionImpactHypothesis: {
      type: "object",
      required: ["appearsToImprove", "remainsUnresolved"],
      properties: {
        appearsToImprove: { type: "array", items: { type: "string" }, description: "Concepts that show evidence of improvement." },
        remainsUnresolved: { type: "array", items: { type: "string" }, description: "Concepts that persist as weak." },
      },
    },
    nextCycleActions: {
      type: "array",
      items: { type: "string" },
      description: "3-5 actionable steps for the teacher's next cycle.",
    },
    trendContradiction: {
      type: "string",
      description: "If score trend and risk trend conflict, explain the contradiction. Omit or empty if no contradiction.",
    },
  },
};
