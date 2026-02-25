import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use /api/auth/login for OAuth sign-in." },
    { status: 410 },
  );
}
