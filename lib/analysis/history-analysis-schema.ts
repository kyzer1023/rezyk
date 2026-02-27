import type { JsonSchemaObject } from "./quiz-analysis-schema";

export const HISTORY_ANALYSIS_MODEL_ID = "gemini-3-flash-preview" as const;
export const HISTORY_ANALYSIS_GENERATION_PROFILE = {
  responseMimeType: "application/json" as const,
  topP: 0.9,
  maxOutputTokens: 4096,
  temperature: 0.15,
};

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
  analysis?: HistoryAnalysisOutput;
  analyzedQuizIds: string[];
  analyzedAt: number;
  modelId: string;
  ownerId: string;
  status: "success" | "error" | "insufficient_data";
  error?: string;
}

export const HistoryAnalysisGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: [
    "overallTrend",
    "confidence",
    "evidenceSummary",
    "interventionImpactHypothesis",
    "nextCycleActions",
  ],
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
        scoreTrajectorySummary: { type: "string" },
        riskTrajectorySummary: { type: "string" },
        recurringWeakConcepts: {
          type: "array",
          maxItems: 5,
          items: { type: "string" },
        },
      },
    },
    interventionImpactHypothesis: {
      type: "object",
      required: ["appearsToImprove", "remainsUnresolved"],
      properties: {
        appearsToImprove: { type: "array", items: { type: "string" } },
        remainsUnresolved: { type: "array", items: { type: "string" } },
      },
    },
    nextCycleActions: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" },
    },
    trendContradiction: { type: "string" },
  },
};
