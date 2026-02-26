import { getSession, type SessionPayload } from "@/lib/auth/session";
import { getValidAccessToken } from "@/lib/auth/token-store";

export const runtime = "nodejs";

export interface AuthContext {
  session: SessionPayload;
  googleAccessToken: string;
}

export async function requireAuth(): Promise<AuthContext> {
  const session = await getSession();
  if (!session) {
    throw new Error("MISSING_AUTH");
  }

  const googleAccessToken = await getValidAccessToken(session.sub);
  return { session, googleAccessToken };
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("MISSING_AUTH");
  }
  return session;
}
