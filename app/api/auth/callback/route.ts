import { NextResponse } from "next/server";
import { exchangeCodeForTokens, fetchUserInfo } from "@/lib/auth/google-oauth";
import { saveUserAndTokens } from "@/lib/auth/token-store";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    const message = encodeURIComponent(`Google sign-in was cancelled or denied: ${error}`);
    return NextResponse.redirect(new URL(`/error?message=${message}`, url.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/error?message=Missing+authorization+code", url.origin));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await fetchUserInfo(tokens.accessToken);

    await saveUserAndTokens(userInfo.id, {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    }, tokens);

    await createSession({
      sub: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    });

    return NextResponse.redirect(new URL("/dashboard", url.origin));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error during sign-in";
    console.error("Auth callback error:", msg);
    return NextResponse.redirect(
      new URL(`/error?message=${encodeURIComponent(msg)}`, url.origin),
    );
  }
}
