import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "edu_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string; // Google user ID
  email: string;
  name: string;
  picture: string;
  iat: number;
  exp: number;
}

function getSecret(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(payload: SessionPayload): string {
  const key = getSecret();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(json, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    tag.toString("base64url"),
  ].join(".");
}

function decrypt(token: string): SessionPayload | null {
  try {
    const key = getSecret();
    const [ivB64, dataB64, tagB64] = token.split(".");
    if (!ivB64 || !dataB64 || !tagB64) return null;
    const iv = Buffer.from(ivB64, "base64url");
    const encrypted = Buffer.from(dataB64, "base64url");
    const tag = Buffer.from(tagB64, "base64url");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    const payload = JSON.parse(decrypted.toString("utf8")) as SessionPayload;
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(payload: Omit<SessionPayload, "iat" | "exp">): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const full: SessionPayload = { ...payload, iat: now, exp: now + MAX_AGE_SECONDS };
  const token = encrypt(full);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return decrypt(cookie.value);
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
