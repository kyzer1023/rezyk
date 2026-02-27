import type { JsonSchemaObject } from "./quiz-analysis-schema";

export const COURSE_MATERIAL_MODEL_ID = "gemini-3-flash-preview" as const;
export const COURSE_MATERIAL_GENERATION_PROFILE = {
  responseMimeType: "application/json" as const,
  topP: 0.9,
  maxOutputTokens: 8192,
  temperature: 0.15,
};

export interface CourseMaterialInput {
  courseId: string;
  courseName: string;
  quizSummaries: {
    quizId: string;
    quizTitle: string;
    concepts: string[];
    averageScore: number;
    studentCount: number;
    weakConcepts: string[];
    errorTypeBreakdown: { errorType: string; percentage: number }[];
  }[];
}

export interface CourseMaterialAnalysisOutput {
  contentCoverage: {
    taughtConcepts: string[];
    assessedConcepts: string[];
    gapConcepts: string[];
  };
  alignment: {
    score: "strong" | "moderate" | "weak";
    summary: string;
  };
  difficultyProgression: {
    assessment: "well_sequenced" | "needs_improvement" | "insufficient_data";
    summary: string;
  };
  misconceptionRecurrence: {
    concept: string;
    quizCount: number;
    severity: "persistent" | "occasional" | "resolved";
  }[];
  assessmentBalance: {
    conceptual: number;
    procedural: number;
    application: number;
    summary: string;
  };
  gaps: {
    underCovered: string[];
    overWeighted: string[];
  };
  interventionOpportunities: string[];
  topWeakConcepts: string[];
  likelyRootCauses: string[];
  prioritizedActions: string[];
  dataQuality: "sufficient" | "insufficient_data";
  insufficientDataReasons?: string[];
}

export interface SavedCourseMaterialAnalysis {
  courseId: string;
  analysis?: CourseMaterialAnalysisOutput;
  analyzedQuizIds: string[];
  analyzedAt: number;
  modelId: string;
  ownerId: string;
  status: "success" | "error" | "insufficient_data";
  error?: string;
}

export const CourseMaterialGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: [
    "contentCoverage",
    "alignment",
    "difficultyProgression",
    "misconceptionRecurrence",
    "assessmentBalance",
    "gaps",
    "interventionOpportunities",
    "topWeakConcepts",
    "likelyRootCauses",
    "prioritizedActions",
    "dataQuality",
  ],
  properties: {
    contentCoverage: {
      type: "object",
      required: ["taughtConcepts", "assessedConcepts", "gapConcepts"],
      properties: {
        taughtConcepts: { type: "array", items: { type: "string" } },
        assessedConcepts: { type: "array", items: { type: "string" } },
        gapConcepts: { type: "array", items: { type: "string" } },
      },
    },
    alignment: {
      type: "object",
      required: ["score", "summary"],
      properties: {
        score: { type: "string", enum: ["strong", "moderate", "weak"] },
        summary: { type: "string" },
      },
    },
    difficultyProgression: {
      type: "object",
      required: ["assessment", "summary"],
      properties: {
        assessment: {
          type: "string",
          enum: ["well_sequenced", "needs_improvement", "insufficient_data"],
        },
        summary: { type: "string" },
      },
    },
    misconceptionRecurrence: {
      type: "array",
      items: {
        type: "object",
        required: ["concept", "quizCount", "severity"],
        properties: {
          concept: { type: "string" },
          quizCount: { type: "number" },
          severity: { type: "string", enum: ["persistent", "occasional", "resolved"] },
        },
      },
    },
    assessmentBalance: {
      type: "object",
      required: ["conceptual", "procedural", "application", "summary"],
      properties: {
        conceptual: { type: "number" },
        procedural: { type: "number" },
        application: { type: "number" },
        summary: { type: "string" },
      },
    },
    gaps: {
      type: "object",
      required: ["underCovered", "overWeighted"],
      properties: {
        underCovered: { type: "array", items: { type: "string" } },
        overWeighted: { type: "array", items: { type: "string" } },
      },
    },
    interventionOpportunities: { type: "array", items: { type: "string" } },
    topWeakConcepts: { type: "array", items: { type: "string" } },
    likelyRootCauses: { type: "array", items: { type: "string" } },
    prioritizedActions: { type: "array", items: { type: "string" } },
    dataQuality: { type: "string", enum: ["sufficient", "insufficient_data"] },
    insufficientDataReasons: { type: "array", items: { type: "string" } },
  },
};
