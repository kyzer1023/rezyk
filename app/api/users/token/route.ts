import { adminDb } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/requireAuth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const decoded = await requireAuth(request);
  const uid = decoded.uid;

  const res = await adminDb.collection("users").doc(uid).get();
  if (!res.exists) {
    return new Response("User not found", { status: 404 });
  }
  const googleAccessToken = res.data()?.google?.accessToken;
  return new NextResponse(JSON.stringify({ uid, googleAccessToken }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
