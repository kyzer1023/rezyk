import { getSession } from "@/lib/auth/session";
import { getValidAccessToken } from "@/lib/auth/token-store";

export type GoogleAccessTokenResult = {
  userId: string;
  googleAccessToken: string;
};

export async function getGoogleAccessTokenFromRequest(): Promise<GoogleAccessTokenResult> {
  const session = await getSession();
  if (!session) {
    throw new Error("MISSING_AUTH");
  }

  const googleAccessToken = await getValidAccessToken(session.sub);
  return { userId: session.sub, googleAccessToken };
}
