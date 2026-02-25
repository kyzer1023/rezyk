import { getGoogleAccessTokenFromRequest } from "@/lib/googleAccessToken";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { uid, googleAccessToken } =
      await getGoogleAccessTokenFromRequest(request);
    return NextResponse.json({ uid, googleAccessToken }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const status =
      msg === "USER_NOT_FOUND"
        ? 404
        : msg === "MISSING_AUTH" || msg === "MISSING_GOOGLE_TOKEN"
          ? 401
          : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
