import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

interface FormQuestion {
  questionId: string;
  title: string;
  questionType: string;
  options: string[];
  correctAnswers: string[];
  maxScore: number;
}

interface FormResponseAnswer {
  textAnswers?: { answers?: { value: string }[] };
  grade?: { score?: number; correct?: boolean };
}

function extractFormId(formUrl: string): string | null {
  const match = formUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function parseFormQuestions(formData: Record<string, unknown>): FormQuestion[] {
  const items = (formData.items ?? []) as Record<string, unknown>[];
  const questions: FormQuestion[] = [];

  for (const item of items) {
    const questionItem = item.questionItem as Record<string, unknown> | undefined;
    if (!questionItem) continue;
    const question = questionItem.question as Record<string, unknown> | undefined;
    if (!question) continue;

    const questionId = question.questionId as string;
    const title = (item.title as string) ?? "";
    const grading = question.grading as Record<string, unknown> | undefined;
    const maxScore = (grading?.pointValue as number) ?? 0;
    const correctKey = grading?.correctAnswers as Record<string, unknown> | undefined;
    const correctAnswersList = (correctKey?.answers ?? []) as { value: string }[];
    const correctAnswers = correctAnswersList.map((a) => a.value);

    const choiceQuestion = question.choiceQuestion as Record<string, unknown> | undefined;
    let questionType = "TEXT";
    const options: string[] = [];
    if (choiceQuestion) {
      questionType = (choiceQuestion.type as string) ?? "RADIO";
      const choiceOptions = (choiceQuestion.options ?? []) as { value: string }[];
      for (const opt of choiceOptions) {
        options.push(opt.value);
      }
    }

    questions.push({ questionId, title, questionType, options, correctAnswers, maxScore });
  }

  return questions;
}

export async function POST(req: Request) {
  try {
    const { session, googleAccessToken } = await requireAuth();
    const body = await req.json();
    const { courseId } = body;
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const cwRes = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      { headers: { Authorization: `Bearer ${googleAccessToken}` } },
    );
    if (!cwRes.ok) {
      const err = await cwRes.json();
      return NextResponse.json({ error: err.error?.message ?? "Failed to fetch courseWork" }, { status: cwRes.status });
    }

    const cwData = await cwRes.json();
    const courseWorkItems = (cwData.courseWork ?? []) as Record<string, unknown>[];
    const now = Date.now();
    const results: { title: string; formId: string; questionCount: number; responseCount: number }[] = [];

    let studentCount = 0;
    try {
      const studentsRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/students`,
        { headers: { Authorization: `Bearer ${googleAccessToken}` } },
      );
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        studentCount = ((studentsData.students ?? []) as unknown[]).length;
      }
    } catch {
      // ignore roster errors
    }

    for (const cw of courseWorkItems) {
      const materials = (cw.materials ?? []) as Record<string, unknown>[];
      let formId: string | null = null;

      for (const mat of materials) {
        const form = mat.form as Record<string, unknown> | undefined;
        if (form?.formUrl) {
          formId = extractFormId(form.formUrl as string);
          break;
        }
      }

      if (!formId) continue;

      const courseWorkId = cw.id as string;
      const title = (cw.title as string) ?? "Untitled";
      const maxPoints = (cw.maxPoints as number) ?? 0;
      const courseWorkState = (cw.state as string) ?? "PUBLISHED";
      const docId = `${courseId}_${courseWorkId}`;

      let questions: FormQuestion[] = [];
      try {
        const formRes = await fetch(
          `https://forms.googleapis.com/v1/forms/${formId}`,
          { headers: { Authorization: `Bearer ${googleAccessToken}` } },
        );
        if (formRes.ok) {
          const formData = await formRes.json();
          questions = parseFormQuestions(formData);
        }
      } catch {
        // form read failed; store without questions
      }

      let responseCount = 0;
      try {
        const respRes = await fetch(
          `https://forms.googleapis.com/v1/forms/${formId}/responses`,
          { headers: { Authorization: `Bearer ${googleAccessToken}` } },
        );
        if (respRes.ok) {
          const respData = await respRes.json();
          const responses = (respData.responses ?? []) as Record<string, unknown>[];
          responseCount = responses.length;

          const batch = adminDb.batch();
          for (const response of responses) {
            const respondentEmail = (response.respondentEmail as string) ?? "anonymous";
            const totalScore = (response.totalScore as number) ?? 0;
            const answersRaw = (response.answers ?? {}) as Record<string, FormResponseAnswer>;
            const answers: Record<string, { textAnswers: string[]; score: number }> = {};
            let maxResponseScore = 0;

            for (const [qId, answer] of Object.entries(answersRaw)) {
              const textAnswers = (answer.textAnswers?.answers ?? []).map((a) => a.value);
              const score = answer.grade?.score ?? 0;
              answers[qId] = { textAnswers, score };
              const qMaxScore = questions.find((q) => q.questionId === qId)?.maxScore ?? 0;
              maxResponseScore += qMaxScore;
            }

            const respRef = adminDb
              .collection("quizzes").doc(docId)
              .collection("responses").doc(respondentEmail.replace(/[/.]/g, "_"));
            batch.set(respRef, {
              respondentEmail,
              totalScore,
              maxScore: maxResponseScore,
              answers,
              submittedAt: (response.lastSubmittedTime as string) ?? "",
            });
          }
          await batch.commit();
        }
      } catch {
        // response fetch failed
      }

      await adminDb.collection("quizzes").doc(docId).set({
        courseId,
        courseWorkId,
        formId,
        title,
        maxPoints,
        courseWorkState,
        questions,
        responseCount,
        totalStudents: studentCount,
        syncStatus: "synced",
        analysisStatus: "not_started",
        lastSynced: now,
        ownerId: session.sub,
      }, { merge: true });

      results.push({ title, formId, questionCount: questions.length, responseCount });
    }

    return NextResponse.json({ success: true, quizzes: results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
