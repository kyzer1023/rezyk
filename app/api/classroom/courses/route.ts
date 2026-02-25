import { getGoogleAccessTokenFromRequest } from "@/lib/googleAccessToken";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { googleAccessToken } = await getGoogleAccessTokenFromRequest();
    const resCourse = await fetch(
      "https://classroom.googleapis.com/v1/courses",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      },
    );
    const data = await resCourse.json();
    return NextResponse.json(data, { status: resCourse.status });
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
