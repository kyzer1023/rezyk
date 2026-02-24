import { adminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function requireAuth(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) throw new Error("MISSING_AUTH");

  const decoded = await adminAuth.verifyIdToken(idToken);
  return decoded; // has uid, email, etc.
}
