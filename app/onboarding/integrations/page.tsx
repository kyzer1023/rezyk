"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthStatus {
  authenticated: boolean;
  user: { name: string; email: string } | null;
  integrations: {
    classroom: "connected" | "needs_reconnect" | "not_connected";
    forms: "connected" | "needs_reconnect" | "not_connected";
  };
}

interface BootstrapStatusResponse {
  hasInitialSync: boolean;
  bootstrapStatus: "pending" | "syncing" | "completed" | "error";
  lastAutoSyncAt: number;
  lastBootstrapError: string;
  stats: {
    courses: number;
    quizzes: number;
  };
}

const STATUS_LABELS: Record<string, { text: string; color: string; bg: string }> = {
  connected: { text: "Connected", color: "#3D7A2E", bg: "#E9F3E5" },
  needs_reconnect: { text: "Needs reconnect", color: "#8B6914", bg: "#FEF8E7" },
  not_connected: { text: "Not connected", color: "#A63D2E", bg: "#FDECEA" },
};

function getBootstrapLabel(status: BootstrapStatusResponse["bootstrapStatus"]): {
  text: string;
  color: string;
  bg: string;
} {
  if (status === "completed") {
    return { text: "Ready", color: "#3D7A2E", bg: "#E9F3E5" };
  }
  if (status === "syncing") {
    return { text: "Preparing data", color: "#8B6914", bg: "#FEF8E7" };
  }
  if (status === "error") {
    return { text: "Needs attention", color: "#A63D2E", bg: "#FDECEA" };
  }
  return { text: "Pending setup", color: "#8A7D6F", bg: "#F0ECE5" };
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const hasAutoStarted = useRef(false);

  const allConnected = useMemo(() => {
    if (!status) return false;
    return (
      status.integrations.classroom === "connected" &&
      status.integrations.forms === "connected"
    );
  }, [status]);

  const loadBootstrapStatus = useCallback(async () => {
    const res = await fetch("/api/bootstrap/status", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as BootstrapStatusResponse;
    setBootstrap(data);
  }, []);

  const runBootstrap = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (running) return;
      setRunning(true);
      setLocalError(null);
      try {
        const res = await fetch("/api/bootstrap/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            analyzeLimit: mode === "initial" ? 1 : 0,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          success?: boolean;
        };

        if (!res.ok || data.success === false) {
          setLocalError(data.error ?? "Unable to prepare classroom data.");
        }
      } catch {
        setLocalError("Unable to prepare classroom data.");
      } finally {
        await loadBootstrapStatus();
        setRunning(false);
      }
    },
    [loadBootstrapStatus, running],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const authRes = await fetch("/api/auth/status", { cache: "no-store" });
        const authData = (await authRes.json()) as AuthStatus;
        if (!authData.authenticated) {
          router.replace("/");
          return;
        }
        if (!cancelled) {
          setStatus(authData);
        }
        if (!cancelled) {
          await loadBootstrapStatus();
        }
      } catch {
        if (!cancelled) {
          router.replace("/");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [loadBootstrapStatus, router]);

  useEffect(() => {
    if (!allConnected || !bootstrap) return;
    const shouldAutoStart =
      bootstrap.bootstrapStatus === "pending" || !bootstrap.hasInitialSync;
    if (!hasAutoStarted.current && shouldAutoStart) {
      hasAutoStarted.current = true;
      void runBootstrap("initial");
    }
  }, [allConnected, bootstrap, runBootstrap]);

  useEffect(() => {
    if (!allConnected || !bootstrap) return;
    if (bootstrap.bootstrapStatus !== "syncing") return;
    const interval = window.setInterval(() => {
      void loadBootstrapStatus();
    }, 2500);
    return () => {
      window.clearInterval(interval);
    };
  }, [allConnected, bootstrap, loadBootstrapStatus]);

  useEffect(() => {
    if (!allConnected || !bootstrap) return;
    if (!(bootstrap.hasInitialSync && bootstrap.bootstrapStatus === "completed")) {
      return;
    }
    const timeout = window.setTimeout(() => {
      router.replace("/dashboard");
    }, 800);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [allConnected, bootstrap, router]);

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

  const setupBadge = getBootstrapLabel(bootstrap?.bootstrapStatus ?? "pending");
  const canContinue = !!bootstrap?.hasInitialSync;
  const lastError = localError ?? bootstrap?.lastBootstrapError ?? "";

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

        {allConnected && (
          <div className="edu-card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Workspace setup</p>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 4,
                  color: setupBadge.color,
                  background: setupBadge.bg,
                }}
              >
                {setupBadge.text}
              </span>
            </div>
            <p className="edu-muted" style={{ fontSize: 13, marginBottom: 8 }}>
              {bootstrap?.bootstrapStatus === "syncing" || running
                ? "Preparing your courses and quizzes in the background."
                : bootstrap?.bootstrapStatus === "completed"
                  ? "Your dashboard is ready."
                  : "Initial data prep will start automatically after connect."}
            </p>
            <p className="edu-muted" style={{ fontSize: 12, margin: 0 }}>
              {bootstrap?.stats.courses ?? 0} course(s) &middot; {bootstrap?.stats.quizzes ?? 0} quiz(es) available
            </p>
            {!!lastError && (
              <p style={{ fontSize: 12, color: "#A63D2E", marginTop: 10 }}>
                {lastError}
              </p>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {allConnected ? (
            <>
              {bootstrap?.bootstrapStatus === "error" && (
                <button
                  className="edu-btn-outline"
                  onClick={() => void runBootstrap("initial")}
                  disabled={running}
                >
                  {running ? "Retrying…" : "Retry Setup"}
                </button>
              )}
              <button
                className="edu-btn"
                onClick={() => router.push("/dashboard")}
                disabled={!canContinue}
              >
                {canContinue ? "Continue to Dashboard" : "Preparing…"}
              </button>
            </>
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
