import { requireAuth } from "@/lib/requireAuth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await requireAuth(request);
  const { googleAccessToken } = await request.json();
  console.log("Received Google Access Token:", googleAccessToken);
  const resCourse = await fetch("https://classroom.googleapis.com/v1/courses", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${googleAccessToken}`,
    },
  });
  console.log("Courses response:", await resCourse.json());
  return new NextResponse(null, { status: 200 });
}
