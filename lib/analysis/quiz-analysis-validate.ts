import Ajv, { type ErrorObject } from "ajv";
import {
  DerivedAnalysisSchema,
  ERROR_TYPES,
  INTERVENTION_TYPES,
  MODEL_ARRAY_LIMITS,
  QUESTION_ID_PATTERN,
  RISK_LEVELS,
  STUDENT_ID_PATTERN,
  type ConceptHeatmapEntry,
  type DerivedAnalysis,
  type ErrorType,
  type ErrorTypeBreakdownEntry,
  type ModelIntervention,
  type ModelMisconception,
  type ModelOutput,
  type ModelStudentAnalysis,
  type QuizAnalysisInput,
  type RiskDistributionEntry,
  type ScoreMetrics,
} from "./quiz-analysis-schema";

export type ValidationErrorClass =
  | "parse_fail"
  | "schema_fail"
  | "semantic_fail"
  | "runtime_fail";

export interface ValidatorDiagnostic {
  path: string;
  message: string;
  expected?: string;
  received?: string;
}

export interface SemanticValidationOptions {
  allowDuplicateConceptPerStudent?: boolean;
  minInterventionsPerStudent?: number;
  maxInterventionsPerStudent?: number;
}

export interface ValidationSuccess {
  ok: true;
  modelOutput: ModelOutput;
  derivedAnalysis: DerivedAnalysis;
}

export interface ValidationFailure {
  ok: false;
  errorClass: ValidationErrorClass;
  diagnostics: ValidatorDiagnostic[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

const RETRYABLE_ERROR_CLASSES: ValidationErrorClass[] = [
  "parse_fail",
  "schema_fail",
  "semantic_fail",
];

const studentIdRegex = new RegExp(STUDENT_ID_PATTERN);
const questionIdRegex = new RegExp(QUESTION_ID_PATTERN);
const derivedSchemaValidator = new Ajv({ allErrors: true, strict: false }).compile(
  DerivedAnalysisSchema as object,
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pointerToPath(pointer: string): string {
  if (!pointer) {
    return "$";
  }
  return `$${pointer.replace(/\/(\d+)/g, "[$1]").replace(/\//g, ".")}`;
}

function toSchemaDiagnostics(errors: ErrorObject[] | null | undefined): ValidatorDiagnostic[] {
  if (!errors || errors.length === 0) {
    return [
      {
        path: "$",
        message: "Schema validation failed with no detailed errors.",
      },
    ];
  }

  return errors.map((error) => ({
    path: pointerToPath(error.instancePath),
    message: `Schema violation (${error.keyword}): ${error.message ?? "validation failed"}.`,
    expected: error.schemaPath,
  }));
}

function toDiagnostics(
  diagnostics: ValidatorDiagnostic[],
  path: string,
  message: string,
  expected?: string,
  received?: string,
): void {
  diagnostics.push({ path, message, expected, received });
}

function pushUnexpectedKeys(
  input: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  diagnostics: ValidatorDiagnostic[],
): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(input)) {
    if (!allowedSet.has(key)) {
      toDiagnostics(
        diagnostics,
        `${path}.${key}`,
        "Unexpected property.",
        `Only: ${allowed.join(", ")}`,
        key,
      );
    }
  }
}

function validateString(
  value: unknown,
  path: string,
  diagnostics: ValidatorDiagnostic[],
  options?: {
    minLength?: number;
    enumValues?: readonly string[];
    pattern?: RegExp;
  },
): value is string {
  if (typeof value !== "string") {
    toDiagnostics(diagnostics, path, "Expected string.", "string", typeof value);
    return false;
  }

  if (options?.minLength !== undefined && value.length < options.minLength) {
    toDiagnostics(
      diagnostics,
      path,
      "String is shorter than minimum length.",
      String(options.minLength),
      String(value.length),
    );
  }

  if (options?.enumValues && !options.enumValues.includes(value)) {
    toDiagnostics(
      diagnostics,
      path,
      "Invalid enum value.",
      options.enumValues.join(" | "),
      value,
    );
  }

  if (options?.pattern && !options.pattern.test(value)) {
    toDiagnostics(
      diagnostics,
      path,
      "String does not match required pattern.",
      options.pattern.source,
      value,
    );
  }

  return true;
}

function validateStringArray(
  value: unknown,
  path: string,
  diagnostics: ValidatorDiagnostic[],
  options: { minItems: number; maxItems: number; pattern?: RegExp },
): value is string[] {
  if (!Array.isArray(value)) {
    toDiagnostics(diagnostics, path, "Expected array.", "array", typeof value);
    return false;
  }

  if (value.length < options.minItems || value.length > options.maxItems) {
    toDiagnostics(
      diagnostics,
      path,
      "Array length is out of bounds.",
      `${options.minItems}-${options.maxItems}`,
      String(value.length),
    );
  }

  for (let i = 0; i < value.length; i += 1) {
    validateString(value[i], `${path}[${i}]`, diagnostics, {
      minLength: 1,
      pattern: options.pattern,
    });
  }

  return true;
}

function validateMisconception(
  value: unknown,
  path: string,
  diagnostics: ValidatorDiagnostic[],
): ModelMisconception | null {
  if (!isRecord(value)) {
    toDiagnostics(diagnostics, path, "Expected object.", "object", typeof value);
    return null;
  }

  const allowed = ["concept", "errorType", "affectedQuestions", "evidence"] as const;
  pushUnexpectedKeys(value, allowed, path, diagnostics);
  for (const key of allowed) {
    if (!(key in value)) {
      toDiagnostics(diagnostics, `${path}.${key}`, "Missing required property.");
    }
  }

  const concept = value.concept;
  const errorType = value.errorType;
  const affectedQuestions = value.affectedQuestions;
  const evidence = value.evidence;

  validateString(concept, `${path}.concept`, diagnostics, { minLength: 1 });
  validateString(errorType, `${path}.errorType`, diagnostics, {
    enumValues: ERROR_TYPES,
  });
  validateStringArray(affectedQuestions, `${path}.affectedQuestions`, diagnostics, {
    minItems: MODEL_ARRAY_LIMITS.affectedQuestionsPerMisconception.min,
    maxItems: MODEL_ARRAY_LIMITS.affectedQuestionsPerMisconception.max,
    pattern: questionIdRegex,
  });
  validateString(evidence, `${path}.evidence`, diagnostics, { minLength: 1 });

  if (
    typeof concept !== "string" ||
    typeof errorType !== "string" ||
    !Array.isArray(affectedQuestions) ||
    typeof evidence !== "string"
  ) {
    return null;
  }

  return {
    concept,
    errorType: errorType as ErrorType,
    affectedQuestions: affectedQuestions.filter((item): item is string => typeof item === "string"),
    evidence,
  };
}

function validateIntervention(
  value: unknown,
  path: string,
  diagnostics: ValidatorDiagnostic[],
): ModelIntervention | null {
  if (!isRecord(value)) {
    toDiagnostics(diagnostics, path, "Expected object.", "object", typeof value);
    return null;
  }

  const allowed = ["type", "focusArea", "action"] as const;
  pushUnexpectedKeys(value, allowed, path, diagnostics);
  for (const key of allowed) {
    if (!(key in value)) {
      toDiagnostics(diagnostics, `${path}.${key}`, "Missing required property.");
    }
  }

  const type = value.type;
  const focusArea = value.focusArea;
  const action = value.action;

  validateString(type, `${path}.type`, diagnostics, { enumValues: INTERVENTION_TYPES });
  validateString(focusArea, `${path}.focusArea`, diagnostics, { minLength: 1 });
  validateString(action, `${path}.action`, diagnostics, { minLength: 1 });

  if (typeof type !== "string" || typeof focusArea !== "string" || typeof action !== "string") {
    return null;
  }

  return {
    type: type as ModelIntervention["type"],
    focusArea,
    action,
  };
}

function validateStudent(
  value: unknown,
  path: string,
  diagnostics: ValidatorDiagnostic[],
): ModelStudentAnalysis | null {
  if (!isRecord(value)) {
    toDiagnostics(diagnostics, path, "Expected object.", "object", typeof value);
    return null;
  }

  const allowed = ["studentId", "riskLevel", "misconceptions", "interventions", "rationale"] as const;
  pushUnexpectedKeys(value, allowed, path, diagnostics);
  for (const key of allowed) {
    if (!(key in value)) {
      toDiagnostics(diagnostics, `${path}.${key}`, "Missing required property.");
    }
  }

  const studentId = value.studentId;
  const riskLevel = value.riskLevel;
  const misconceptions = value.misconceptions;
  const interventions = value.interventions;
  const rationale = value.rationale;

  validateString(studentId, `${path}.studentId`, diagnostics, {
    minLength: 1,
    pattern: studentIdRegex,
  });
  validateString(riskLevel, `${path}.riskLevel`, diagnostics, {
    enumValues: RISK_LEVELS,
  });
  validateString(rationale, `${path}.rationale`, diagnostics, { minLength: 1 });

  if (!Array.isArray(misconceptions)) {
    toDiagnostics(diagnostics, `${path}.misconceptions`, "Expected array.", "array", typeof misconceptions);
  } else {
    if (
      misconceptions.length < MODEL_ARRAY_LIMITS.misconceptionsPerStudent.min ||
      misconceptions.length > MODEL_ARRAY_LIMITS.misconceptionsPerStudent.max
    ) {
      toDiagnostics(
        diagnostics,
        `${path}.misconceptions`,
        "Array length is out of bounds.",
        `${MODEL_ARRAY_LIMITS.misconceptionsPerStudent.min}-${MODEL_ARRAY_LIMITS.misconceptionsPerStudent.max}`,
        String(misconceptions.length),
      );
    }
  }

  if (!Array.isArray(interventions)) {
    toDiagnostics(diagnostics, `${path}.interventions`, "Expected array.", "array", typeof interventions);
  } else {
    if (
      interventions.length < MODEL_ARRAY_LIMITS.interventionsPerStudent.min ||
      interventions.length > MODEL_ARRAY_LIMITS.interventionsPerStudent.max
    ) {
      toDiagnostics(
        diagnostics,
        `${path}.interventions`,
        "Array length is out of bounds.",
        `${MODEL_ARRAY_LIMITS.interventionsPerStudent.min}-${MODEL_ARRAY_LIMITS.interventionsPerStudent.max}`,
        String(interventions.length),
      );
    }
  }

  const parsedMisconceptions: ModelMisconception[] = [];
  if (Array.isArray(misconceptions)) {
    for (let i = 0; i < misconceptions.length; i += 1) {
      const parsed = validateMisconception(
        misconceptions[i],
        `${path}.misconceptions[${i}]`,
        diagnostics,
      );
      if (parsed) {
        parsedMisconceptions.push(parsed);
      }
    }
  }

  const parsedInterventions: ModelIntervention[] = [];
  if (Array.isArray(interventions)) {
    for (let i = 0; i < interventions.length; i += 1) {
      const parsed = validateIntervention(interventions[i], `${path}.interventions[${i}]`, diagnostics);
      if (parsed) {
        parsedInterventions.push(parsed);
      }
    }
  }

  if (typeof studentId !== "string" || typeof riskLevel !== "string" || typeof rationale !== "string") {
    return null;
  }

  return {
    studentId,
    riskLevel: riskLevel as ModelStudentAnalysis["riskLevel"],
    misconceptions: parsedMisconceptions,
    interventions: parsedInterventions,
    rationale,
  };
}

function validateModelOutputShape(value: unknown): { modelOutput: ModelOutput | null; diagnostics: ValidatorDiagnostic[] } {
  const diagnostics: ValidatorDiagnostic[] = [];
  if (!isRecord(value)) {
    toDiagnostics(diagnostics, "$", "Expected root object.", "object", typeof value);
    return { modelOutput: null, diagnostics };
  }

  const allowed = ["students"] as const;
  pushUnexpectedKeys(value, allowed, "$", diagnostics);
  if (!("students" in value)) {
    toDiagnostics(diagnostics, "$.students", "Missing required property.");
    return { modelOutput: null, diagnostics };
  }

  const students = value.students;
  if (!Array.isArray(students)) {
    toDiagnostics(diagnostics, "$.students", "Expected array.", "array", typeof students);
    return { modelOutput: null, diagnostics };
  }

  if (students.length < MODEL_ARRAY_LIMITS.students.min || students.length > MODEL_ARRAY_LIMITS.students.max) {
    toDiagnostics(
      diagnostics,
      "$.students",
      "Array length is out of bounds.",
      `${MODEL_ARRAY_LIMITS.students.min}-${MODEL_ARRAY_LIMITS.students.max}`,
      String(students.length),
    );
  }

  const parsedStudents: ModelStudentAnalysis[] = [];
  for (let i = 0; i < students.length; i += 1) {
    const parsed = validateStudent(students[i], `$.students[${i}]`, diagnostics);
    if (parsed) {
      parsedStudents.push(parsed);
    }
  }

  if (diagnostics.length > 0) {
    return { modelOutput: null, diagnostics };
  }

  return {
    modelOutput: {
      students: parsedStudents,
    },
    diagnostics,
  };
}

function validateSemantics(
  modelOutput: ModelOutput,
  fixture: QuizAnalysisInput,
  options?: SemanticValidationOptions,
): ValidatorDiagnostic[] {
  const diagnostics: ValidatorDiagnostic[] = [];
  const questionIds = new Set(fixture.questions.map((question) => question.questionId));
  const expectedStudentIds = new Set(fixture.students.map((student) => student.studentId));
  const seenStudentIds = new Set<string>();

  const allowDuplicateConcepts = options?.allowDuplicateConceptPerStudent ?? false;
  const minInterventions = options?.minInterventionsPerStudent ?? MODEL_ARRAY_LIMITS.interventionsPerStudent.min;
  const maxInterventions = options?.maxInterventionsPerStudent ?? MODEL_ARRAY_LIMITS.interventionsPerStudent.max;

  for (let i = 0; i < modelOutput.students.length; i += 1) {
    const student = modelOutput.students[i];
    const path = `$.students[${i}]`;

    if (!expectedStudentIds.has(student.studentId)) {
      toDiagnostics(
        diagnostics,
        `${path}.studentId`,
        "studentId does not exist in fixture input.",
        "Known fixture studentId",
        student.studentId,
      );
    }

    if (seenStudentIds.has(student.studentId)) {
      toDiagnostics(
        diagnostics,
        `${path}.studentId`,
        "Duplicate studentId entry in model output.",
        "Unique studentId",
        student.studentId,
      );
    }
    seenStudentIds.add(student.studentId);

    if (student.interventions.length < minInterventions || student.interventions.length > maxInterventions) {
      toDiagnostics(
        diagnostics,
        `${path}.interventions`,
        "Intervention count out of semantic bounds.",
        `${minInterventions}-${maxInterventions}`,
        String(student.interventions.length),
      );
    }

    const concepts = new Set<string>();
    for (let j = 0; j < student.misconceptions.length; j += 1) {
      const misconception = student.misconceptions[j];
      const misconceptionPath = `${path}.misconceptions[${j}]`;
      const normalizedConcept = misconception.concept.trim().toLowerCase();

      if (!allowDuplicateConcepts) {
        if (concepts.has(normalizedConcept)) {
          toDiagnostics(
            diagnostics,
            `${misconceptionPath}.concept`,
            "Duplicate concept for same student is not allowed.",
          );
        }
        concepts.add(normalizedConcept);
      }

      for (let k = 0; k < misconception.affectedQuestions.length; k += 1) {
        const questionId = misconception.affectedQuestions[k];
        if (!questionIds.has(questionId)) {
          toDiagnostics(
            diagnostics,
            `${misconceptionPath}.affectedQuestions[${k}]`,
            "Question ID does not exist in fixture question set.",
            Array.from(questionIds).join(", "),
            questionId,
          );
        }
      }
    }
  }

  for (const expectedStudentId of expectedStudentIds) {
    if (!seenStudentIds.has(expectedStudentId)) {
      toDiagnostics(
        diagnostics,
        "$.students",
        "Missing fixture student in model output.",
        expectedStudentId,
      );
    }
  }

  return diagnostics;
}

function toPercent(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Number(((value / total) * 100).toFixed(2));
}

function median(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2));
  }
  return Number(sorted[middle].toFixed(2));
}

function buildRiskDistribution(modelOutput: ModelOutput): RiskDistributionEntry[] {
  const total = modelOutput.students.length;
  return RISK_LEVELS.map((riskLevel) => {
    const count = modelOutput.students.filter((student) => student.riskLevel === riskLevel).length;
    return {
      riskLevel,
      count,
      percentage: toPercent(count, total),
    };
  });
}

function buildScoreMetrics(fixture: QuizAnalysisInput): ScoreMetrics {
  const scorePercentages = fixture.students.map((student) => {
    if (student.maxScore <= 0) {
      return 0;
    }
    return (student.score / student.maxScore) * 100;
  });

  const completionPercentages = fixture.students.map((student) => {
    const questionCount = fixture.questions.length;
    if (questionCount === 0) {
      return 0;
    }
    return (student.attemptedQuestionIds.length / questionCount) * 100;
  });

  const averageScore =
    scorePercentages.length === 0
      ? 0
      : Number(
          (scorePercentages.reduce((total, value) => total + value, 0) / scorePercentages.length).toFixed(2),
        );

  const averageCompletionRate =
    completionPercentages.length === 0
      ? 0
      : Number(
          (
            completionPercentages.reduce((total, value) => total + value, 0) /
            completionPercentages.length
          ).toFixed(2),
        );

  return {
    averageScore,
    medianScore: median(scorePercentages),
    averageCompletionRate,
  };
}

function buildConceptHeatmap(modelOutput: ModelOutput): ConceptHeatmapEntry[] {
  const aggregate = new Map<
    string,
    {
      studentIds: Set<string>;
      questionIds: Set<string>;
      errorTypeCounts: Map<ErrorType, number>;
    }
  >();

  for (const student of modelOutput.students) {
    for (const misconception of student.misconceptions) {
      const key = misconception.concept.trim();
      const existing = aggregate.get(key) ?? {
        studentIds: new Set<string>(),
        questionIds: new Set<string>(),
        errorTypeCounts: new Map<ErrorType, number>(),
      };
      existing.studentIds.add(student.studentId);
      for (const questionId of misconception.affectedQuestions) {
        existing.questionIds.add(questionId);
      }
      existing.errorTypeCounts.set(
        misconception.errorType,
        (existing.errorTypeCounts.get(misconception.errorType) ?? 0) + 1,
      );
      aggregate.set(key, existing);
    }
  }

  const results: ConceptHeatmapEntry[] = [];
  for (const [concept, summary] of aggregate.entries()) {
    let dominantErrorType: ErrorType = ERROR_TYPES[0];
    let dominantCount = -1;
    for (const errorType of ERROR_TYPES) {
      const count = summary.errorTypeCounts.get(errorType) ?? 0;
      if (count > dominantCount) {
        dominantCount = count;
        dominantErrorType = errorType;
      }
    }

    results.push({
      concept,
      affectedStudentCount: summary.studentIds.size,
      questionIds: Array.from(summary.questionIds).sort(),
      dominantErrorType,
    });
  }

  results.sort((left, right) => right.affectedStudentCount - left.affectedStudentCount);
  return results;
}

function buildErrorTypeBreakdown(modelOutput: ModelOutput): ErrorTypeBreakdownEntry[] {
  const totalMisconceptions = modelOutput.students.reduce(
    (total, student) => total + student.misconceptions.length,
    0,
  );

  return ERROR_TYPES.map((errorType) => {
    const count = modelOutput.students.reduce((total, student) => {
      return (
        total +
        student.misconceptions.filter((misconception) => misconception.errorType === errorType).length
      );
    }, 0);

    return {
      errorType,
      count,
      percentage: toPercent(count, totalMisconceptions),
    };
  });
}

function validateDerivedAnalysisShape(derived: DerivedAnalysis): ValidatorDiagnostic[] {
  const isValid = derivedSchemaValidator(derived);
  if (isValid) {
    return [];
  }
  return toSchemaDiagnostics(derivedSchemaValidator.errors);
}

export function isRetryableValidationError(errorClass: ValidationErrorClass): boolean {
  return RETRYABLE_ERROR_CLASSES.includes(errorClass);
}

export function validateQuizAnalysisResponse(
  rawText: string,
  fixture: QuizAnalysisInput,
  options?: SemanticValidationOptions,
): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    return {
      ok: false,
      errorClass: "parse_fail",
      diagnostics: [
        {
          path: "$",
          message: "Failed to parse JSON response.",
          received: error instanceof Error ? error.message : "Unknown parse error.",
        },
      ],
    };
  }

  const schemaResult = validateModelOutputShape(parsed);
  if (!schemaResult.modelOutput) {
    return {
      ok: false,
      errorClass: "schema_fail",
      diagnostics: schemaResult.diagnostics,
    };
  }

  const semanticDiagnostics = validateSemantics(schemaResult.modelOutput, fixture, options);
  if (semanticDiagnostics.length > 0) {
    return {
      ok: false,
      errorClass: "semantic_fail",
      diagnostics: semanticDiagnostics,
    };
  }

  try {
    const derivedAnalysis: DerivedAnalysis = {
      riskDistribution: buildRiskDistribution(schemaResult.modelOutput),
      scoreMetrics: buildScoreMetrics(fixture),
      conceptHeatmap: buildConceptHeatmap(schemaResult.modelOutput),
      errorTypeBreakdown: buildErrorTypeBreakdown(schemaResult.modelOutput),
    };

    const derivedDiagnostics = validateDerivedAnalysisShape(derivedAnalysis);
    if (derivedDiagnostics.length > 0) {
      return {
        ok: false,
        errorClass: "runtime_fail",
        diagnostics: derivedDiagnostics,
      };
    }

    return {
      ok: true,
      modelOutput: schemaResult.modelOutput,
      derivedAnalysis,
    };
  } catch (error) {
    return {
      ok: false,
      errorClass: "runtime_fail",
      diagnostics: [
        {
          path: "$",
          message: "Unexpected runtime error while deriving deterministic analysis.",
          received: error instanceof Error ? error.message : "Unknown runtime error.",
        },
      ],
    };
  }
}
