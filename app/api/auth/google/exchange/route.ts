import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    const uid = user.uid;

    const { googleAccessToken } = await req.json();
    if (!googleAccessToken) throw new Error("MISSING_GOOGLE_TOKEN");

    const exp = Date.now() + 60 * 60 * 1000;

    await adminDb
      .collection("users")
      .doc(uid)
      .set(
        {
          google: {
            accessToken: googleAccessToken,
            exp,
          },
        },
        { merge: true },
      );
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" ? 401 : 401;
    return NextResponse.json({ error: msg }, { status });
  }
}
