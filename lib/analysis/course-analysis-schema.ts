import type { JsonSchemaObject } from "./quiz-analysis-schema";

export const COURSE_ANALYSIS_MODEL_ID = "gemini-3-flash-preview" as const;
export const COURSE_ANALYSIS_GENERATION_PROFILE = {
  responseMimeType: "application/json" as const,
  topP: 0.9,
  maxOutputTokens: 8192,
  temperature: 0.15,
};

export interface CourseAnalysisOutput {
  topWeakConcepts: Array<{
    concept: string;
    quizzesAffected: number;
    studentsAffected: number;
    dominantErrorType: string;
  }>;
  rootCauses: string[];
  trendDirection: "improving" | "stable" | "declining" | "insufficient_data";
  trendConfidence: "low" | "medium" | "high";
  contentCoverage: {
    taughtConcepts: string[];
    assessedConcepts: string[];
    gaps: string[];
  };
  alignmentScore: "strong" | "moderate" | "weak" | "insufficient_data";
  difficultyProgression: "well_sequenced" | "adequate" | "poorly_sequenced" | "insufficient_data";
  misconceptionRecurrence: Array<{
    concept: string;
    occurrences: number;
  }>;
  assessmentBalance: {
    conceptual: number;
    procedural: number;
    application: number;
  };
  engagementProxies: {
    averageCompletionRate: number;
    submissionPattern: string;
  };
  underCoveredConcepts: string[];
  overWeightedConcepts: string[];
  interventionOpportunities: string[];
  prioritizedActions: string[];
  insufficientDataReasons?: string[];
}

export interface StoredCourseAnalysis {
  courseId: string;
  analyzedQuizIds: string[];
  generatedAt: number;
  modelId: string;
  status: "success" | "error" | "insufficient_data";
  analysis?: CourseAnalysisOutput;
  error?: string;
  ownerId: string;
}

export const CourseAnalysisGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: [
    "topWeakConcepts", "rootCauses", "trendDirection", "trendConfidence",
    "contentCoverage", "alignmentScore", "difficultyProgression",
    "misconceptionRecurrence", "assessmentBalance", "engagementProxies",
    "underCoveredConcepts", "overWeightedConcepts",
    "interventionOpportunities", "prioritizedActions",
  ],
  properties: {
    topWeakConcepts: {
      type: "array",
      description: "Top weak concepts across the course.",
      items: {
        type: "object",
        required: ["concept", "quizzesAffected", "studentsAffected", "dominantErrorType"],
        properties: {
          concept: { type: "string" },
          quizzesAffected: { type: "number" },
          studentsAffected: { type: "number" },
          dominantErrorType: { type: "string" },
        },
      },
    },
    rootCauses: {
      type: "array",
      description: "Likely root causes at course level.",
      items: { type: "string" },
    },
    trendDirection: {
      type: "string",
      enum: ["improving", "stable", "declining", "insufficient_data"],
    },
    trendConfidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    contentCoverage: {
      type: "object",
      required: ["taughtConcepts", "assessedConcepts", "gaps"],
      properties: {
        taughtConcepts: { type: "array", items: { type: "string" } },
        assessedConcepts: { type: "array", items: { type: "string" } },
        gaps: { type: "array", items: { type: "string" } },
      },
    },
    alignmentScore: {
      type: "string",
      enum: ["strong", "moderate", "weak", "insufficient_data"],
    },
    difficultyProgression: {
      type: "string",
      enum: ["well_sequenced", "adequate", "poorly_sequenced", "insufficient_data"],
    },
    misconceptionRecurrence: {
      type: "array",
      items: {
        type: "object",
        required: ["concept", "occurrences"],
        properties: {
          concept: { type: "string" },
          occurrences: { type: "number" },
        },
      },
    },
    assessmentBalance: {
      type: "object",
      required: ["conceptual", "procedural", "application"],
      properties: {
        conceptual: { type: "number" },
        procedural: { type: "number" },
        application: { type: "number" },
      },
    },
    engagementProxies: {
      type: "object",
      required: ["averageCompletionRate", "submissionPattern"],
      properties: {
        averageCompletionRate: { type: "number" },
        submissionPattern: { type: "string" },
      },
    },
    underCoveredConcepts: { type: "array", items: { type: "string" } },
    overWeightedConcepts: { type: "array", items: { type: "string" } },
    interventionOpportunities: { type: "array", items: { type: "string" } },
    prioritizedActions: {
      type: "array",
      description: "Prioritized teaching actions, short and practical.",
      items: { type: "string" },
    },
    insufficientDataReasons: {
      type: "array",
      description: "Reasons if data is insufficient for some evaluations.",
      items: { type: "string" },
    },
  },
};
