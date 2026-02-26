import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { callGemini, ONLINE_MODEL_ID } from "@/lib/gemini";
import { buildQuizAnalysisPrompt } from "@/lib/analysis/quiz-analysis-prompt";
import {
  ModelOutputGenerationSchema,
  type QuizAnalysisInput,
  type QuizQuestionInput,
  type QuizStudentInput,
} from "@/lib/analysis/quiz-analysis-schema";
import { validateQuizAnalysisResponse } from "@/lib/analysis/quiz-analysis-validate";

export const runtime = "nodejs";
export const maxDuration = 60;

interface StoredQuestion {
  questionId: string;
  title: string;
  questionType: string;
  options: string[];
  correctAnswers: string[];
  maxScore: number;
}

interface StoredResponse {
  respondentEmail: string;
  totalScore: number;
  maxScore: number;
  answers: Record<string, { textAnswers: string[]; score: number }>;
}

function sanitizeStudentId(email: string): string {
  return `student-${email.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
}

function buildAnalysisInput(
  quizId: string,
  quizTitle: string,
  storedQuestions: StoredQuestion[],
  responses: StoredResponse[],
): QuizAnalysisInput {
  const questions: QuizQuestionInput[] = storedQuestions.map((q, idx) => ({
    itemId: `item-${idx + 1}`,
    questionId: `Q${idx + 1}`,
    concept: q.title.slice(0, 80),
    questionText: q.title,
    questionType: q.questionType as QuizQuestionInput["questionType"],
    options: q.options,
    correctAnswers: q.correctAnswers,
    maxScore: q.maxScore || 1,
  }));

  const questionIdMap = new Map(
    storedQuestions.map((q, idx) => [q.questionId, `Q${idx + 1}`]),
  );

  const students: QuizStudentInput[] = responses.map((resp) => {
    const studentId = sanitizeStudentId(resp.respondentEmail);
    const studentName = resp.respondentEmail.split("@")[0].replace(/[._]/g, " ");

    const attemptedQuestionIds: string[] = [];
    const incorrectQuestionIds: string[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const [rawQId, answer] of Object.entries(resp.answers)) {
      const mappedQId = questionIdMap.get(rawQId);
      if (!mappedQId) continue;

      attemptedQuestionIds.push(mappedQId);
      const qDef = storedQuestions.find((q) => q.questionId === rawQId);
      const qMax = qDef?.maxScore || 1;
      maxScore += qMax;
      totalScore += answer.score;

      if (answer.score < qMax) {
        incorrectQuestionIds.push(mappedQId);
      }
    }

    return {
      studentId,
      studentName,
      score: totalScore,
      maxScore: maxScore || resp.maxScore,
      attemptedQuestionIds,
      incorrectQuestionIds,
    };
  });

  return { quizId, quizTitle: quizTitle, questions, students };
}


export async function POST(req: Request) {
  try {
    const { session } = await requireAuth();
    const body = await req.json();
    const { courseId, quizId } = body;

    if (!courseId || !quizId) {
      return NextResponse.json({ error: "courseId and quizId are required" }, { status: 400 });
    }

    const docId = `${courseId}_${quizId}`;

    await adminDb.collection("quizzes").doc(docId).update({
      analysisStatus: "running",
    });

    const quizSnap = await adminDb.collection("quizzes").doc(docId).get();
    if (!quizSnap.exists) {
      return NextResponse.json({ error: "Quiz not found. Sync first." }, { status: 404 });
    }

    const quizData = quizSnap.data()!;
    const storedQuestions = (quizData.questions ?? []) as StoredQuestion[];
    const quizTitle = (quizData.title as string) ?? "Quiz";

    if (storedQuestions.length === 0) {
      return NextResponse.json({ error: "No questions found. Re-sync the quiz." }, { status: 400 });
    }

    const responsesSnap = await adminDb
      .collection("quizzes")
      .doc(docId)
      .collection("responses")
      .get();

    const responses: StoredResponse[] = responsesSnap.docs.map((doc) => doc.data() as StoredResponse);

    if (responses.length === 0) {
      return NextResponse.json({ error: "No student responses found. Re-sync the quiz." }, { status: 400 });
    }

    const analysisInput = buildAnalysisInput(docId, quizTitle, storedQuestions, responses);
    const prompt = buildQuizAnalysisPrompt(analysisInput);
    const rawText = await callGemini({ prompt, responseSchema: ModelOutputGenerationSchema });

    const validationResult = validateQuizAnalysisResponse(rawText, analysisInput);

    if (!validationResult.ok) {
      await adminDb.collection("quizzes").doc(docId).update({
        analysisStatus: "error",
      });

      return NextResponse.json({
        error: "Analysis validation failed",
        errorClass: validationResult.errorClass,
        diagnostics: validationResult.diagnostics.slice(0, 10),
      }, { status: 422 });
    }

    const emailToStudentId = new Map(
      responses.map((r) => [sanitizeStudentId(r.respondentEmail), r.respondentEmail]),
    );

    await adminDb.collection("analyses").doc(docId).set({
      quizId: docId,
      courseId,
      courseWorkId: quizId,
      modelOutput: JSON.parse(JSON.stringify(validationResult.modelOutput)),
      derivedAnalysis: JSON.parse(JSON.stringify(validationResult.derivedAnalysis)),
      analysisInput: JSON.parse(JSON.stringify(analysisInput)),
      emailMapping: Object.fromEntries(emailToStudentId),
      createdAt: Date.now(),
      modelId: ONLINE_MODEL_ID,
      ownerId: session.sub,
    });

    await adminDb.collection("quizzes").doc(docId).update({
      analysisStatus: "completed",
    });

    return NextResponse.json({
      success: true,
      summary: {
        studentsAnalyzed: validationResult.modelOutput.students.length,
        riskDistribution: validationResult.derivedAnalysis.riskDistribution,
        scoreMetrics: validationResult.derivedAnalysis.scoreMetrics,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Analysis error:", msg);
    const status = msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
