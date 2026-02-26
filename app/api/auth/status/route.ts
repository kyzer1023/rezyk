import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/auth/token-store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      integrations: { classroom: "not_connected", forms: "not_connected" },
    });
  }

  const profile = await getUserProfile(session.sub);
  const integrationStatus = profile?.integrationStatus ?? "not_connected";

  const scopeStr = profile?.tokens?.scope ?? "";
  const hasClassroom = scopeStr.includes("classroom");
  const hasForms = scopeStr.includes("forms");

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.sub,
      email: session.email,
      name: session.name,
      picture: session.picture,
    },
    integrations: {
      classroom: hasClassroom ? integrationStatus : "not_connected",
      forms: hasForms ? integrationStatus : "not_connected",
    },
  });
}
