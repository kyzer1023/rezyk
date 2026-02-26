import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import { callGemini, ONLINE_MODEL_ID } from "@/lib/gemini";
import { NoteGenerationSchema, buildNotePrompt, type StudentNote } from "@/lib/notes/note-schema";

export const runtime = "nodejs";
export const maxDuration = 300;

type RiskCategory = "critical" | "high" | "medium" | "low" | "critical+high" | "all";

function matchesCategory(riskLevel: string, category: RiskCategory): boolean {
  if (category === "all") return true;
  if (category === "critical+high") return riskLevel === "critical" || riskLevel === "high";
  return riskLevel === category;
}

export async function POST(req: Request) {
  try {
    const { session } = await requireAuth();
    const { courseId, quizId, category = "critical+high" } = await req.json() as {
      courseId: string;
      quizId: string;
      category?: RiskCategory;
    };

    if (!courseId || !quizId) {
      return NextResponse.json({ error: "courseId and quizId are required" }, { status: 400 });
    }

    const analysisDocId = `${courseId}_${quizId}`;
    const analysisSnap = await adminDb.collection("analyses").doc(analysisDocId).get();
    if (!analysisSnap.exists) {
      return NextResponse.json({ error: "Analysis not found. Run quiz analysis first." }, { status: 404 });
    }

    const analysisData = analysisSnap.data()!;
    const students = (analysisData.modelOutput?.students ?? []) as Array<{
      studentId: string;
      riskLevel: string;
      misconceptions: { concept: string; errorType: string; evidence: string; affectedQuestions: string[] }[];
      interventions: { type: string; focusArea: string; action: string }[];
      rationale: string;
    }>;

    const emailMapping = (analysisData.emailMapping ?? {}) as Record<string, string>;
    const quizDocId = analysisDocId;
    const quizSnap = await adminDb.collection("quizzes").doc(quizDocId).get();
    const quizTitle = (quizSnap.data()?.title as string) ?? "Quiz";

    const filtered = students.filter((s) => matchesCategory(s.riskLevel, category));

    if (filtered.length === 0) {
      return NextResponse.json({ success: true, generated: 0, failed: 0, results: [] });
    }

    const results: { studentId: string; displayName: string; status: "success" | "error"; error?: string }[] = [];
    let generated = 0;
    let failed = 0;

    for (const student of filtered) {
      const email = emailMapping[student.studentId] ?? student.studentId;
      const displayName = email.split("@")[0].replace(/[._]/g, " ");

      try {
        const prompt = buildNotePrompt({
          displayName,
          riskLevel: student.riskLevel,
          misconceptions: student.misconceptions.map((m) => ({
            concept: m.concept,
            errorType: m.errorType,
            evidence: m.evidence,
          })),
          interventions: student.interventions,
          rationale: student.rationale,
          quizTitle,
        });

        const rawText = await callGemini({ prompt, responseSchema: NoteGenerationSchema });
        const parsed = JSON.parse(rawText) as StudentNote;

        const noteDocId = `${courseId}_${quizId}_${student.studentId}`;
        await adminDb.collection("notes").doc(noteDocId).set({
          courseId,
          quizId,
          studentId: student.studentId,
          displayName,
          riskLevel: student.riskLevel,
          note: parsed,
          generatedAt: Date.now(),
          modelId: ONLINE_MODEL_ID,
          sourceAnalysisId: analysisDocId,
          status: "success",
          ownerId: session.sub,
        });

        results.push({ studentId: student.studentId, displayName, status: "success" });
        generated++;
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        results.push({ studentId: student.studentId, displayName, status: "error", error: errorMsg });
        failed++;
      }
    }

    return NextResponse.json({ success: true, generated, failed, total: filtered.length, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Batch note generation error:", msg);
    const status = msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
