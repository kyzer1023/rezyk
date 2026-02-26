import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const { searchParams } = req.nextUrl;
    const courseId = searchParams.get("courseId");
    const quizId = searchParams.get("quizId");
    const studentId = searchParams.get("studentId");

    if (!courseId || !quizId) {
      return NextResponse.json(
        { error: "courseId and quizId are required" },
        { status: 400 },
      );
    }

    if (studentId) {
      const noteId = `${courseId}_${quizId}_${studentId}`;
      const noteSnap = await adminDb.collection("studentNotes").doc(noteId).get();
      if (!noteSnap.exists) {
        return NextResponse.json({ found: false });
      }
      return NextResponse.json({ found: true, note: noteSnap.data() });
    }

    const notesSnap = await adminDb
      .collection("studentNotes")
      .where("courseId", "==", courseId)
      .where("quizId", "==", quizId)
      .where("ownerId", "==", session.sub)
      .get();

    const notes = notesSnap.docs.map((doc) => doc.data());
    return NextResponse.json({ notes });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
