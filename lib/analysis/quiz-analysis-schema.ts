export type JsonSchemaObject = Record<string, unknown>;

export const ONLINE_MODEL_ID = "gemini-3-flash-preview" as const;
export const ONLINE_DEFAULT_RUNS = 5 as const;
export const ONLINE_MIN_RUNS = 2 as const;
export const RETRY_TEMPERATURES = [0.1, 0.0] as const;
export const ONLINE_GENERATION_PROFILE = {
  responseMimeType: "application/json",
  topP: 0.9,
  maxOutputTokens: 4096,
  thinkingConfig: {
    thinkingLevel: "minimal",
  },
} as const;

export const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export const ERROR_TYPES = ["conceptual", "procedural", "careless"] as const;
export const INTERVENTION_TYPES = ["worksheet", "video", "mini-quiz"] as const;
export const FORMS_QUESTION_TYPES = [
  "RADIO",
  "CHECKBOX",
  "DROP_DOWN",
  "TEXT",
  "PARAGRAPH_TEXT",
] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];
export type ErrorType = (typeof ERROR_TYPES)[number];
export type InterventionType = (typeof INTERVENTION_TYPES)[number];
export type FormsQuestionType = (typeof FORMS_QUESTION_TYPES)[number];

export const STUDENT_ID_PATTERN = "^student-[a-z0-9-]+$";
export const QUESTION_ID_PATTERN = "^Q[0-9]+$";

export const MODEL_ARRAY_LIMITS = {
  students: { min: 1, max: 60 },
  misconceptionsPerStudent: { min: 1, max: 6 },
  affectedQuestionsPerMisconception: { min: 1, max: 10 },
  interventionsPerStudent: { min: 1, max: 4 },
} as const;

export interface QuizQuestionInput {
  itemId: string;
  questionId: string;
  concept: string;
  questionText: string;
  questionType: FormsQuestionType;
  options: string[];
  correctAnswers: string[];
  maxScore: number;
}

export interface QuizStudentInput {
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  attemptedQuestionIds: string[];
  incorrectQuestionIds: string[];
}

export interface QuizAnalysisInput {
  quizId: string;
  quizTitle: string;
  questions: QuizQuestionInput[];
  students: QuizStudentInput[];
}

export interface ModelMisconception {
  concept: string;
  errorType: ErrorType;
  affectedQuestions: string[];
  evidence: string;
}

export interface ModelIntervention {
  type: InterventionType;
  focusArea: string;
  action: string;
}

export interface ModelStudentAnalysis {
  studentId: string;
  riskLevel: RiskLevel;
  misconceptions: ModelMisconception[];
  interventions: ModelIntervention[];
  rationale: string;
}

export interface ModelOutput {
  students: ModelStudentAnalysis[];
}

export interface RiskDistributionEntry {
  riskLevel: RiskLevel;
  count: number;
  percentage: number;
}

export interface ScoreMetrics {
  averageScore: number;
  medianScore: number;
  averageCompletionRate: number;
}

export interface ConceptHeatmapEntry {
  concept: string;
  affectedStudentCount: number;
  questionIds: string[];
  dominantErrorType: ErrorType;
}

export interface ErrorTypeBreakdownEntry {
  errorType: ErrorType;
  count: number;
  percentage: number;
}

export interface DerivedAnalysis {
  riskDistribution: RiskDistributionEntry[];
  scoreMetrics: ScoreMetrics;
  conceptHeatmap: ConceptHeatmapEntry[];
  errorTypeBreakdown: ErrorTypeBreakdownEntry[];
}

const misconceptionSchema: JsonSchemaObject = {
  type: "object",
  additionalProperties: false,
  required: ["concept", "errorType", "affectedQuestions", "evidence"],
  properties: {
    concept: {
      type: "string",
      minLength: 1,
      maxLength: 120,
      description: "Short concept label for this misconception.",
    },
    errorType: {
      type: "string",
      enum: [...ERROR_TYPES],
      description: "Error classification for the misconception.",
    },
    affectedQuestions: {
      type: "array",
      minItems: MODEL_ARRAY_LIMITS.affectedQuestionsPerMisconception.min,
      maxItems: MODEL_ARRAY_LIMITS.affectedQuestionsPerMisconception.max,
      items: {
        type: "string",
        pattern: QUESTION_ID_PATTERN,
      },
      description: "Question IDs affected by the misconception.",
    },
    evidence: {
      type: "string",
      minLength: 1,
      maxLength: 260,
      description: "Short evidence statement based on student mistakes.",
    },
  },
};

const interventionSchema: JsonSchemaObject = {
  type: "object",
  additionalProperties: false,
  required: ["type", "focusArea", "action"],
  properties: {
    type: {
      type: "string",
      enum: [...INTERVENTION_TYPES],
      description: "Intervention format recommended for this student.",
    },
    focusArea: {
      type: "string",
      minLength: 1,
      maxLength: 120,
      description: "Concept area targeted by the intervention.",
    },
    action: {
      type: "string",
      minLength: 1,
      maxLength: 260,
      description: "Actionable recommendation the teacher can execute.",
    },
  },
};

const modelStudentSchema: JsonSchemaObject = {
  type: "object",
  additionalProperties: false,
  required: ["studentId", "riskLevel", "misconceptions", "interventions", "rationale"],
  properties: {
    studentId: {
      type: "string",
      pattern: STUDENT_ID_PATTERN,
      description: "Student ID from the input payload.",
    },
    riskLevel: {
      type: "string",
      enum: [...RISK_LEVELS],
      description: "Risk classification for intervention priority.",
    },
    misconceptions: {
      type: "array",
      minItems: MODEL_ARRAY_LIMITS.misconceptionsPerStudent.min,
      maxItems: MODEL_ARRAY_LIMITS.misconceptionsPerStudent.max,
      items: misconceptionSchema,
    },
    interventions: {
      type: "array",
      minItems: MODEL_ARRAY_LIMITS.interventionsPerStudent.min,
      maxItems: MODEL_ARRAY_LIMITS.interventionsPerStudent.max,
      items: interventionSchema,
    },
    rationale: {
      type: "string",
      minLength: 1,
      maxLength: 300,
      description: "Brief explanation tying mistakes to the risk level.",
    },
  },
};

export const ModelOutputSchema: JsonSchemaObject = {
  $id: "eduinsight.quiz-analysis.model-output.v1",
  type: "object",
  additionalProperties: false,
  required: ["students"],
  properties: {
    students: {
      type: "array",
      minItems: MODEL_ARRAY_LIMITS.students.min,
      maxItems: MODEL_ARRAY_LIMITS.students.max,
      items: modelStudentSchema,
      description: "Per-student model reasoning only.",
    },
  },
};

// Gemini request schema is intentionally flatter than ModelOutputSchema.
// We enforce the full strict contract in local validation to avoid
// API-side schema complexity/depth rejections.
export const ModelOutputGenerationSchema: JsonSchemaObject = {
  $id: "eduinsight.quiz-analysis.model-output.generation.v1",
  type: "object",
  required: ["students"],
  properties: {
    students: {
      type: "array",
      items: {
        type: "object",
        required: ["studentId", "riskLevel", "misconceptions", "interventions", "rationale"],
        properties: {
          studentId: {
            type: "string",
            description: "Student ID from input payload.",
          },
          riskLevel: {
            type: "string",
            enum: [...RISK_LEVELS],
          },
          misconceptions: {
            type: "array",
            description:
              "Array of misconception objects. Each item must include: concept, errorType, affectedQuestions, evidence.",
          },
          interventions: {
            type: "array",
            description:
              "Array of intervention objects. Each item must include: type, focusArea, action.",
          },
          rationale: {
            type: "string",
          },
        },
      },
      description: "Per-student model reasoning only.",
    },
  },
};

const percentageSchema: JsonSchemaObject = {
  type: "number",
  minimum: 0,
  maximum: 100,
};

export const DerivedAnalysisSchema: JsonSchemaObject = {
  $id: "eduinsight.quiz-analysis.derived-output.v1",
  type: "object",
  additionalProperties: false,
  required: ["riskDistribution", "scoreMetrics", "conceptHeatmap", "errorTypeBreakdown"],
  properties: {
    riskDistribution: {
      type: "array",
      minItems: RISK_LEVELS.length,
      maxItems: RISK_LEVELS.length,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["riskLevel", "count", "percentage"],
        properties: {
          riskLevel: { type: "string", enum: [...RISK_LEVELS] },
          count: { type: "number", minimum: 0, maximum: 1000 },
          percentage: percentageSchema,
        },
      },
    },
    scoreMetrics: {
      type: "object",
      additionalProperties: false,
      required: ["averageScore", "medianScore", "averageCompletionRate"],
      properties: {
        averageScore: percentageSchema,
        medianScore: percentageSchema,
        averageCompletionRate: percentageSchema,
      },
    },
    conceptHeatmap: {
      type: "array",
      minItems: 0,
      maxItems: 200,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["concept", "affectedStudentCount", "questionIds", "dominantErrorType"],
        properties: {
          concept: { type: "string", minLength: 1, maxLength: 120 },
          affectedStudentCount: { type: "number", minimum: 1, maximum: 1000 },
          questionIds: {
            type: "array",
            minItems: 1,
            maxItems: 30,
            items: {
              type: "string",
              pattern: QUESTION_ID_PATTERN,
            },
          },
          dominantErrorType: { type: "string", enum: [...ERROR_TYPES] },
        },
      },
    },
    errorTypeBreakdown: {
      type: "array",
      minItems: ERROR_TYPES.length,
      maxItems: ERROR_TYPES.length,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["errorType", "count", "percentage"],
        properties: {
          errorType: { type: "string", enum: [...ERROR_TYPES] },
          count: { type: "number", minimum: 0, maximum: 1000 },
          percentage: percentageSchema,
        },
      },
    },
  },
};
