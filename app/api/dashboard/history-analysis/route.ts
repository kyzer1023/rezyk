import { NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const snap = await adminDb.collection("historyAnalyses").doc(courseId).get();
    if (!snap.exists || snap.data()?.ownerId !== session.sub) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, ...snap.data() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg === "MISSING_AUTH" ? 401 : 500 });
  }
}
