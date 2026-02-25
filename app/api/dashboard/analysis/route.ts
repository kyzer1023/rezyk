import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    const quizId = url.searchParams.get("quizId");

    if (!courseId || !quizId) {
      return NextResponse.json({ error: "courseId and quizId are required" }, { status: 400 });
    }

    const docId = `${courseId}_${quizId}`;
    const snap = await adminDb.collection("analyses").doc(docId).get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Analysis not found", found: false }, { status: 404 });
    }

    const data = snap.data()!;
    if (data.ownerId !== session.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      found: true,
      modelOutput: data.modelOutput,
      derivedAnalysis: data.derivedAnalysis,
      analysisInput: data.analysisInput,
      emailMapping: data.emailMapping,
      createdAt: data.createdAt,
      modelId: data.modelId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg === "MISSING_AUTH" ? 401 : 500 });
  }
}
