import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    let query = adminDb
      .collection("quizzes")
      .where("ownerId", "==", session.sub);

    if (courseId) {
      query = query.where("courseId", "==", courseId);
    }

    const snap = await query.get();

    const quizzes = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: d.courseWorkId,
        courseId: d.courseId,
        title: d.title,
        formId: d.formId,
        responseCount: d.responseCount ?? 0,
        totalStudents: d.totalStudents ?? 0,
        syncStatus: d.syncStatus ?? "not_synced",
        analysisStatus: d.analysisStatus ?? "not_started",
        maxPoints: d.maxPoints ?? 0,
        lastSynced: d.lastSynced ? new Date(d.lastSynced).toISOString() : null,
      };
    });

    return NextResponse.json({ quizzes });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg === "MISSING_AUTH" ? 401 : 500 });
  }
}
