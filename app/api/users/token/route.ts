import { getGoogleAccessTokenFromRequest } from "@/lib/googleAccessToken";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId, googleAccessToken } =
      await getGoogleAccessTokenFromRequest();
    return NextResponse.json({ userId, googleAccessToken }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const status =
      msg === "USER_NOT_FOUND"
        ? 404
        : msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED"
          ? 401
          : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
