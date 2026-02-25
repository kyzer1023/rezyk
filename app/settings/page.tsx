"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

interface AuthStatus {
  authenticated: boolean;
  user: { id: string; email: string; name: string; picture: string } | null;
  integrations: {
    classroom: "connected" | "needs_reconnect" | "not_connected";
    forms: "connected" | "needs_reconnect" | "not_connected";
  };
}

const STATUS_STYLE: Record<string, { text: string; className: string }> = {
  connected: { text: "Connected", className: "edu-badge edu-badge-low" },
  needs_reconnect: { text: "Needs reconnect", className: "edu-badge edu-badge-high" },
  not_connected: { text: "Not connected", className: "edu-badge edu-badge-critical" },
};

export default function SettingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus | null>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data: AuthStatus) => setStatus(data))
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  const user = status?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const integrations = [
    { name: "Google Classroom", status: status?.integrations.classroom ?? "not_connected" },
    { name: "Google Forms", status: status?.integrations.forms ?? "not_connected" },
  ];

  const needsReconnect = integrations.some(
    (i) => i.status === "needs_reconnect" || i.status === "not_connected",
  );

  return (
    <div style={{ minHeight: "100vh", padding: 40, maxWidth: 560, margin: "0 auto", background: "#FAF6F0" }}>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 24, marginBottom: 20 }}>
        Settings
      </h1>

      <div className="edu-card edu-fade-in edu-fd1" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 14 }}>
          Account
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C17A56, #D4956E)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {initials}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15 }}>{user?.name ?? "Loading…"}</p>
            <p className="edu-muted" style={{ fontSize: 13 }}>
              {user?.email ?? ""}
            </p>
          </div>
        </div>
      </div>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 14 }}>
          Integrations
        </h3>
        {integrations.map((integration) => {
          const badge = STATUS_STYLE[integration.status];
          return (
            <div
              key={integration.name}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F0ECE5" }}
            >
              <span style={{ fontSize: 14 }}>{integration.name}</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className={badge.className}>{badge.text}</span>
                {integration.status !== "connected" && (
                  <a href="/api/auth/login">
                    <button className="edu-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>
                      Reconnect
                    </button>
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {needsReconnect && (
          <p style={{ fontSize: 12, color: "#A63D2E", marginTop: 12 }}>
            Google access expired. Reconnect to continue syncing Forms responses.
          </p>
        )}
      </div>

      <div className="edu-fade-in edu-fd3" style={{ display: "flex", gap: 10 }}>
        <Link href={routes.dashboard()}>
          <button className="edu-btn-outline">Back to Dashboard</button>
        </Link>
        <button className="edu-btn" style={{ background: "#A63D2E" }} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
