import { NextResponse } from "next/server";
import { buildConsentUrl } from "@/lib/auth/google-oauth";

export const runtime = "nodejs";

export function GET() {
  const url = buildConsentUrl();
  return NextResponse.redirect(url);
}
