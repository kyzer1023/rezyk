import { getGoogleAccessTokenFromRequest } from "@/lib/googleAccessToken";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { googleAccessToken } =
      await getGoogleAccessTokenFromRequest(request);
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
    console.log("Courses response:", data);
    return NextResponse.json(data, { status: resCourse.status });
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
