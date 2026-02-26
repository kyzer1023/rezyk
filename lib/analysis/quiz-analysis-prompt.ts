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
    "You are a quiz misconception analyzer for teachers. Your role is to provide deep, actionable insights into each student's understanding.",
    "Return strict JSON only, with no markdown fences.",
    "Output only per-student reasoning fields required by the response schema.",
    "Do not output class-level aggregates; those are computed in code.",
    "",
    `Allowed riskLevel values: ${RISK_LEVELS.join(", ")}`,
    `Allowed errorType values: ${ERROR_TYPES.join(", ")}`,
    `Allowed intervention.type values: ${INTERVENTION_TYPES.join(", ")}`,
    "",
    "ANALYSIS DEPTH GUIDELINES:",
    "For each student, analyze their errors by distinguishing between:",
    "- conceptual: Student lacks understanding of the underlying concept/theory.",
    "- procedural: Student understands the concept but makes errors in applying steps/methods.",
    "- careless: Student understands both concept and procedure but made a minor slip.",
    "",
    "When writing the 'evidence' field, be SPECIFIC about WHY the student got it wrong:",
    "- Reference the actual question content and what the correct answer required.",
    "- Explain what the student likely misunderstood or confused.",
    "- Connect errors across questions to identify patterns (e.g., 'struggles with all bond-type classification questions').",
    "",
    "When writing the 'rationale' field, provide a DIAGNOSTIC SUMMARY that a teacher can act on:",
    "- Summarize the student's overall knowledge depth: what they understand vs. what they lack.",
    "- Highlight whether the gap is foundational (needs prerequisite review) or surface-level (needs practice).",
    "- Suggest priority: which gap to address first for maximum learning impact.",
    "",
    "For interventions, be TEACHER-ACTIONABLE and SPECIFIC:",
    "- Tie each intervention to the specific misconception identified.",
    "- Include concrete steps (e.g., 'Review ionic vs covalent bonding using visual electron-sharing diagrams').",
    "",
    "Hard constraints:",
    "- Use only question IDs listed in the input.",
    "- Use each studentId exactly as provided.",
    "- Include every input student exactly once in students[].",
    "- For students who got questions wrong: output 1-3 misconceptions and 1-2 interventions based on severity.",
    "- For students who got all questions right: output exactly 1 misconception with errorType 'careless' and 1 intervention.",
    "- Base misconception evidence on incorrectQuestionContext (question text + concept + answer key).",
    "- Each students[] item must include: studentId, riskLevel, misconceptions, interventions, rationale.",
    "- Each misconceptions[] item must include: concept, errorType, affectedQuestions (array of question IDs), evidence.",
    "- Each interventions[] item must include: type, focusArea, action.",
    "- Evidence: max 200 chars. Be specific about the knowledge gap.",
    "- Rationale: max 250 chars. Summarize knowledge depth and priority.",
    "- Intervention action: max 200 chars. Give concrete teacher steps.",
    "",
    "Input:",
    JSON.stringify(promptPayload, null, 2),
  ].join("\n");
}
