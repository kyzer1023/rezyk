import type { JsonSchemaObject } from "./quiz-analysis-schema";

export const HISTORY_ANALYSIS_MODEL_ID = "gemini-3-flash-preview" as const;
export const HISTORY_ANALYSIS_GENERATION_PROFILE = {
  responseMimeType: "application/json" as const,
  topP: 0.9,
  maxOutputTokens: 4096,
  temperature: 0.15,
};

export interface HistoryAnalysisOutput {
  overallTrend: "improving" | "stable" | "declining" | "insufficient_data";
  confidence: "low" | "medium" | "high";
  evidenceSummary: {
    scoreTrajectory: string;
    riskTrajectory: string;
    recurringWeakConcepts: string[];
  };
  interventionImpactHypothesis: {
    appearsToImprove: string[];
    remainsUnresolved: string[];
  };
  nextCycleActions: string[];
  contradictionFlag?: string;
}

export interface StoredHistoryAnalysis {
  courseId: string;
  analyzedQuizIds: string[];
  generatedAt: number;
  modelId: string;
  status: "success" | "error" | "insufficient_data";
  analysis?: HistoryAnalysisOutput;
  error?: string;
  ownerId: string;
}

export const HistoryAnalysisGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: [
    "overallTrend", "confidence", "evidenceSummary",
    "interventionImpactHypothesis", "nextCycleActions",
  ],
  properties: {
    overallTrend: {
      type: "string",
      enum: ["improving", "stable", "declining", "insufficient_data"],
      description: "Overall trend direction across analyzed quizzes.",
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
      description: "Confidence level of the trend assessment.",
    },
    evidenceSummary: {
      type: "object",
      required: ["scoreTrajectory", "riskTrajectory", "recurringWeakConcepts"],
      properties: {
        scoreTrajectory: {
          type: "string",
          description: "Summary of score changes over time.",
        },
        riskTrajectory: {
          type: "string",
          description: "Summary of risk level changes over time.",
        },
        recurringWeakConcepts: {
          type: "array",
          description: "Concepts that remain weak across multiple quizzes (max 5).",
          items: { type: "string" },
        },
      },
    },
    interventionImpactHypothesis: {
      type: "object",
      required: ["appearsToImprove", "remainsUnresolved"],
      properties: {
        appearsToImprove: {
          type: "array",
          description: "Areas showing signs of improvement.",
          items: { type: "string" },
        },
        remainsUnresolved: {
          type: "array",
          description: "Areas that remain problematic despite potential interventions.",
          items: { type: "string" },
        },
      },
    },
    nextCycleActions: {
      type: "array",
      description: "3-5 actionable steps for the next teaching cycle.",
      items: { type: "string" },
    },
    contradictionFlag: {
      type: "string",
      description: "Set if score trend and risk trend conflict. Explain the contradiction.",
    },
  },
};
