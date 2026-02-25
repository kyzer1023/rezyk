import { getGoogleAccessTokenFromRequest } from "@/lib/googleAccessToken";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { googleAccessToken } = await getGoogleAccessTokenFromRequest(req);
    const { courseId } = await params;
    const resQuiz = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      },
    );
    const data = await resQuiz.json();
    console.log("Quizzes response:", data);
    return NextResponse.json(data, { status: resQuiz.status });
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
