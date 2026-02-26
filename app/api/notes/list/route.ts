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
    const studentId = url.searchParams.get("studentId");

    if (!courseId || !quizId) {
      return NextResponse.json({ error: "courseId and quizId are required" }, { status: 400 });
    }

    if (studentId) {
      const docId = `${courseId}_${quizId}_${studentId}`;
      const snap = await adminDb.collection("notes").doc(docId).get();
      if (!snap.exists || snap.data()?.ownerId !== session.sub) {
        return NextResponse.json({ notes: [] });
      }
      return NextResponse.json({ notes: [snap.data()] });
    }

    const snap = await adminDb
      .collection("notes")
      .where("courseId", "==", courseId)
      .where("quizId", "==", quizId)
      .where("ownerId", "==", session.sub)
      .get();

    const notes = snap.docs.map((doc) => doc.data());
    return NextResponse.json({ notes });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg === "MISSING_AUTH" ? 401 : 500 });
  }
}
