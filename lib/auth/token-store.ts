import { adminDb } from "@/lib/firebaseAdmin";
import { refreshAccessToken, type TokenSet } from "./google-oauth";

const USERS_COLLECTION = "users";
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

export interface StoredUser {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    scope: string;
  };
  integrationStatus: "connected" | "needs_reconnect" | "not_connected";
  createdAt: number;
  updatedAt: number;
}

export async function saveUserAndTokens(
  googleId: string,
  profile: { email: string; name: string; picture: string },
  tokens: TokenSet,
): Promise<void> {
  const now = Date.now();
  const ref = adminDb.collection(USERS_COLLECTION).doc(googleId);
  const existing = await ref.get();

  const data: Partial<StoredUser> = {
    googleId,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? "",
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
    },
    integrationStatus: "connected",
    updatedAt: now,
  };

  if (!existing.exists) {
    data.createdAt = now;
  }

  await ref.set(data, { merge: true });
}

export async function getValidAccessToken(googleId: string): Promise<string> {
  const ref = adminDb.collection(USERS_COLLECTION).doc(googleId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("USER_NOT_FOUND");
  }

  const user = snap.data() as StoredUser;
  if (!user.tokens?.refreshToken) {
    throw new Error("RECONNECT_REQUIRED");
  }

  if (user.tokens.expiresAt > Date.now() + REFRESH_BUFFER_MS) {
    return user.tokens.accessToken;
  }

  try {
    const refreshed = await refreshAccessToken(user.tokens.refreshToken);
    await ref.update({
      "tokens.accessToken": refreshed.accessToken,
      "tokens.expiresAt": refreshed.expiresAt,
      integrationStatus: "connected",
      updatedAt: Date.now(),
    });
    return refreshed.accessToken;
  } catch {
    await ref.update({
      integrationStatus: "needs_reconnect",
      updatedAt: Date.now(),
    });
    throw new Error("RECONNECT_REQUIRED");
  }
}

export async function getUserProfile(
  googleId: string,
): Promise<StoredUser | null> {
  const snap = await adminDb.collection(USERS_COLLECTION).doc(googleId).get();
  if (!snap.exists) return null;
  return snap.data() as StoredUser;
}

export async function markReconnectNeeded(googleId: string): Promise<void> {
  await adminDb.collection(USERS_COLLECTION).doc(googleId).update({
    integrationStatus: "needs_reconnect",
    updatedAt: Date.now(),
  });
}
