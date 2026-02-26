import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession();
    const snap = await adminDb
      .collection("courses")
      .where("ownerId", "==", session.sub)
      .get();

    const courses = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: d.courseId,
        name: d.name,
        section: d.section ?? "",
        studentCount: d.studentCount ?? 0,
        lastSynced: d.lastSynced ? new Date(d.lastSynced).toISOString() : null,
      };
    });

    return NextResponse.json({ courses });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg === "MISSING_AUTH" ? 401 : 500 });
  }
}
