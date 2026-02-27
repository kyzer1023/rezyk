import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import type { SavedStudentNote } from "@/lib/analysis/student-notes-schema";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
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
        return NextResponse.json({ notes: [] });
      }

      const note = noteSnap.data() as SavedStudentNote;
      if (note.ownerId !== session.sub) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      return NextResponse.json({ notes: [note] });
    }

    const notesSnap = await adminDb
      .collection("studentNotes")
      .where("courseId", "==", courseId)
      .where("quizId", "==", quizId)
      .where("ownerId", "==", session.sub)
      .get();

    const notes = notesSnap.docs.map((doc) => doc.data() as SavedStudentNote);
    return NextResponse.json({ notes });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
