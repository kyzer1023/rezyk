import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";
import type { StoredStudentNote } from "@/lib/analysis/student-notes-schema";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireSession();
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    const quizId = url.searchParams.get("quizId");
    const studentId = url.searchParams.get("studentId");

    if (!courseId || !quizId) {
      return NextResponse.json({ error: "courseId and quizId are required" }, { status: 400 });
    }

    let query = adminDb
      .collection("studentNotes")
      .where("courseId", "==", courseId)
      .where("quizId", "==", quizId);

    if (studentId) {
      query = query.where("studentId", "==", studentId);
    }

    const snap = await query.get();
    const notes: StoredStudentNote[] = snap.docs.map((doc) => doc.data() as StoredStudentNote);

    return NextResponse.json({ notes });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
