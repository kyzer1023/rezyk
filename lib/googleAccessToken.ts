import { adminDb } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/requireAuth";

type StoredGoogleData = {
  accessToken?: string;
  exp?: number;
};

export type GoogleAccessTokenResult = {
  uid: string;
  googleAccessToken: string;
  exp?: number;
};

export async function getGoogleAccessTokenFromRequest(
  req: Request,
): Promise<GoogleAccessTokenResult> {
  const decoded = await requireAuth(req);
  const uid = decoded.uid;

  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) {
    throw new Error("USER_NOT_FOUND");
  }

  const google = userDoc.data()?.google as StoredGoogleData | undefined;
  const googleAccessToken = google?.accessToken;
  if (!googleAccessToken) {
    throw new Error("MISSING_GOOGLE_TOKEN");
  }

  return {
    uid,
    googleAccessToken,
    exp: google?.exp,
  };
}
