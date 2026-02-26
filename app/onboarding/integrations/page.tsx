"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthStatus {
  authenticated: boolean;
  user: { name: string; email: string } | null;
  integrations: {
    classroom: "connected" | "needs_reconnect" | "not_connected";
    forms: "connected" | "needs_reconnect" | "not_connected";
  };
}

const STATUS_LABELS: Record<string, { text: string; color: string; bg: string }> = {
  connected: { text: "Connected", color: "#3D7A2E", bg: "#E9F3E5" },
  needs_reconnect: { text: "Needs reconnect", color: "#8B6914", bg: "#FEF8E7" },
  not_connected: { text: "Not connected", color: "#A63D2E", bg: "#FDECEA" },
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data: AuthStatus) => {
        if (!data.authenticated) {
          router.replace("/");
          return;
        }
        setStatus(data);
        setLoading(false);
      })
      .catch(() => router.replace("/"));
  }, [router]);

  if (loading || !status) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8A7D6F" }}>Loading integrations…</p>
      </div>
    );
  }

  const integrations = [
    { name: "Google Classroom", status: status.integrations.classroom, desc: "Read courses, rosters, and quiz assignments" },
    { name: "Google Forms", status: status.integrations.forms, desc: "Read quiz questions, answer keys, and student responses" },
  ];

  const allConnected = integrations.every((i) => i.status === "connected");

  return (
    <div style={{ minHeight: "100vh", background: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="edu-fade-in" style={{ maxWidth: 480, width: "100%" }}>
        <h1 className="edu-heading" style={{ fontSize: 24, marginBottom: 8, textAlign: "center" }}>
          Integration Status
        </h1>
        <p className="edu-muted" style={{ fontSize: 14, textAlign: "center", marginBottom: 28 }}>
          EduInsight needs access to your Google services to sync and analyze quiz data.
        </p>

        <div className="edu-card" style={{ padding: 24, marginBottom: 20 }}>
          {integrations.map((integration) => {
            const badge = STATUS_LABELS[integration.status];
            return (
              <div key={integration.name} style={{ padding: "14px 0", borderBottom: "1px solid #F0ECE5" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{integration.name}</p>
                    <p className="edu-muted" style={{ fontSize: 12, margin: "4px 0 0" }}>{integration.desc}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 4,
                      color: badge.color,
                      background: badge.bg,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {badge.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {allConnected ? (
            <button className="edu-btn" onClick={() => router.push("/dashboard")}>
              Continue to Dashboard
            </button>
          ) : (
            <a href="/api/auth/login">
              <button className="edu-btn">Reconnect Google Access</button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
