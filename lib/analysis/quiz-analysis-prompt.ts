import {
  ERROR_TYPES,
  INTERVENTION_TYPES,
  RISK_LEVELS,
  type QuizAnalysisInput,
  type QuizQuestionInput,
  type QuizStudentInput,
} from "./quiz-analysis-schema";

interface PromptQuestionContext {
  itemId: string;
  questionId: string;
  concept: string;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswers: string[];
  maxScore: number;
}

interface PromptStudentContext {
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  scorePercent: number;
  attemptedQuestionIds: string[];
  incorrectQuestionIds: string[];
  incorrectQuestionContext: PromptQuestionContext[];
}

function toQuestionSummary(question: QuizQuestionInput): PromptQuestionContext {
  return {
    itemId: question.itemId,
    questionId: question.questionId,
    concept: question.concept,
    questionText: question.questionText,
    questionType: question.questionType,
    options: question.options,
    correctAnswers: question.correctAnswers,
    maxScore: question.maxScore,
  };
}

function toStudentSummary(
  student: QuizStudentInput,
  questionById: Map<string, PromptQuestionContext>,
): PromptStudentContext {
  const scorePercent = student.maxScore === 0 ? 0 : (student.score / student.maxScore) * 100;

  const incorrectQuestionContext = student.incorrectQuestionIds
    .map((questionId) => questionById.get(questionId))
    .filter((question): question is PromptQuestionContext => Boolean(question));

  return {
    studentId: student.studentId,
    studentName: student.studentName,
    score: student.score,
    maxScore: student.maxScore,
    scorePercent: Number(scorePercent.toFixed(1)),
    attemptedQuestionIds: student.attemptedQuestionIds,
    incorrectQuestionIds: student.incorrectQuestionIds,
    incorrectQuestionContext,
  };
}

export function buildQuizAnalysisPrompt(input: QuizAnalysisInput): string {
  const questionSummary = input.questions.map(toQuestionSummary);
  const questionById = new Map(questionSummary.map((question) => [question.questionId, question]));
  const studentSummary = input.students.map((student) => toStudentSummary(student, questionById));

  const promptPayload = {
    quizId: input.quizId,
    quizTitle: input.quizTitle,
    questions: questionSummary,
    students: studentSummary,
  };

  return [
    "You are a quiz misconception analyzer for teachers.",
    "Return strict JSON only, with no markdown fences.",
    "Output only per-student reasoning fields required by the response schema.",
    "Do not output class-level aggregates; those are computed in code.",
    "",
    `Allowed riskLevel values: ${RISK_LEVELS.join(", ")}`,
    `Allowed errorType values: ${ERROR_TYPES.join(", ")}`,
    `Allowed intervention.type values: ${INTERVENTION_TYPES.join(", ")}`,
    "",
    "Hard constraints:",
    "- Use only question IDs listed in the input.",
    "- Use each studentId exactly as provided.",
    "- Include every input student exactly once in students[].",
    "- Output exactly 1 misconception and exactly 1 intervention per student.",
    "- Base misconception evidence on incorrectQuestionContext (question text + concept + answer key).",
    "- Each students[] item must include: studentId, riskLevel, misconceptions, interventions, rationale.",
    "- Each misconceptions[] item must include: concept, errorType, affectedQuestions (array of question IDs), evidence.",
    "- Each interventions[] item must include: type, focusArea, action.",
    "- Keep rationale and evidence concise and specific (max 120 characters each).",
    "- Keep intervention action short and practical (max 140 characters).",
    "",
    "Input:",
    JSON.stringify(promptPayload, null, 2),
  ].join("\n");
}
