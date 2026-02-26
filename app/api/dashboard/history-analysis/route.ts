import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const courseId = req.nextUrl.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const snap = await adminDb.collection("historyAnalyses").doc(courseId).get();
    if (!snap.exists) {
      return NextResponse.json({ found: false });
    }

    const data = snap.data()!;
    if (data.ownerId !== session.sub) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, ...data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
