import { NextResponse } from "next/server";
import { getUserProfile, type BootstrapStatus } from "@/lib/auth/token-store";
import { requireSession } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

function deriveBootstrapStatus(
  status: BootstrapStatus | undefined,
  hasInitialSync: boolean,
): BootstrapStatus {
  if (status) {
    return status;
  }
  return hasInitialSync ? "completed" : "pending";
}

export async function GET() {
  try {
    const session = await requireSession();
    const profile = await getUserProfile(session.sub);
    const hasInitialSync = profile?.hasInitialSync ?? false;

    const [coursesSnap, quizzesSnap] = await Promise.all([
      adminDb.collection("courses").where("ownerId", "==", session.sub).get(),
      adminDb.collection("quizzes").where("ownerId", "==", session.sub).get(),
    ]);

    return NextResponse.json({
      hasInitialSync,
      bootstrapStatus: deriveBootstrapStatus(profile?.bootstrapStatus, hasInitialSync),
      lastAutoSyncAt: profile?.lastAutoSyncAt ?? 0,
      lastBootstrapError: profile?.lastBootstrapError ?? "",
      integrationStatus: profile?.integrationStatus ?? "not_connected",
      stats: {
        courses: coursesSnap.size,
        quizzes: quizzesSnap.size,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: msg },
      { status: msg === "MISSING_AUTH" ? 401 : 500 },
    );
  }
}
