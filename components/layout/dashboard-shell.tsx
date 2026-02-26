"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DashboardBootstrapProvider,
  type BootstrapStatusResponse,
} from "@/components/layout/dashboard-bootstrap-context";
import { routes } from "@/lib/routes";

type Breadcrumb = { label: string; href: string };

interface UserInfo {
  name: string;
  email: string;
}

interface AuthStatusResponse {
  authenticated: boolean;
  user: {
    name: string;
    email: string;
  } | null;
  integrations: {
    classroom: "connected" | "needs_reconnect" | "not_connected";
    forms: "connected" | "needs_reconnect" | "not_connected";
  };
}

const AUTO_REFRESH_STALE_MS = 10 * 60 * 1000;

const navItems = [
  { href: routes.dashboard(), label: "Overview" },
  { href: routes.courses(), label: "Courses" },
];

function buildBreadcrumbs(
  pathname: string,
  viewParam: string | null,
  studentIdParam: string | null,
): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label: "Dashboard", href: routes.dashboard() }];
  if (!pathname.includes("/courses")) {
    return crumbs;
  }

  crumbs.push({ label: "Courses", href: routes.courses() });
  const courseMatch = pathname.match(/courses\/([^/]+)/);
  if (!courseMatch) {
    return crumbs;
  }

  const courseId = courseMatch[1];
  crumbs.push({ label: "Course", href: routes.course(courseId) });
  if (pathname.includes("/quizzes")) {
    crumbs.push({ label: "Quizzes", href: routes.quizzes(courseId) });
    const quizMatch = pathname.match(/quizzes\/([^/]+)/);
    if (quizMatch) {
      const quizId = quizMatch[1];
      crumbs.push({ label: "Quiz", href: routes.quizWorkspace(courseId, quizId) });

      const viewFromQuery =
        viewParam === "sync" || viewParam === "analysis" || viewParam === "insights" || viewParam === "students"
          ? viewParam
          : null;
      const effectiveView = viewFromQuery ?? "analysis";

      if (effectiveView === "sync" || effectiveView === "analysis") {
        crumbs.push({
          label: "Sync & Analyze",
          href: routes.quizWorkspace(courseId, quizId, { view: "analysis" }),
        });
      } else if (effectiveView === "insights") {
        crumbs.push({
          label: "Insights",
          href: routes.quizWorkspace(courseId, quizId, { view: "insights" }),
        });
      } else if (effectiveView === "students") {
        crumbs.push({
          label: "Students",
          href: routes.quizWorkspace(courseId, quizId, { view: "students" }),
        });
        if (studentIdParam) {
          crumbs.push({
            label: "Detail",
            href: routes.quizWorkspace(courseId, quizId, {
              view: "students",
              studentId: studentIdParam,
            }),
          });
        }
      }
    }
  }

  if (pathname.includes("/history")) {
    crumbs.push({ label: "History", href: pathname });
  }

  return crumbs;
}

function BreadcrumbTrail({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const breadcrumbs = buildBreadcrumbs(
    pathname,
    searchParams.get("view"),
    searchParams.get("studentId"),
  );

  return (
    <>
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {index > 0 && <span style={{ color: "#D6CBBF" }}>/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span style={{ fontWeight: 600, color: "#C17A56" }}>{crumb.label}</span>
          ) : (
            <Link href={crumb.href} style={{ color: "#B5AA9C", textDecoration: "none" }}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </>
  );
}

function formatLastSync(lastAutoSyncAt: number): string {
  if (!lastAutoSyncAt) {
    return "Never";
  }
  const diffMs = Date.now() - lastAutoSyncAt;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return new Date(lastAutoSyncAt).toLocaleDateString();
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapStatusResponse | null>(null);
  const [runningBootstrap, setRunningBootstrap] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const autoTriggeredRefresh = useRef(false);

  const integrationsConnected = useMemo(() => {
    if (!authStatus) return false;
    return (
      authStatus.integrations.classroom === "connected" &&
      authStatus.integrations.forms === "connected"
    );
  }, [authStatus]);

  const loadBootstrapStatus = useCallback(async () => {
    const res = await fetch("/api/bootstrap/status", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as BootstrapStatusResponse;
    setBootstrap(data);
  }, []);

  const runBootstrap = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      if (runningBootstrap) return;
      setRunningBootstrap(true);
      setBootstrap((prev) =>
        prev
          ? {
              ...prev,
              bootstrapStatus: "syncing",
              lastBootstrapError: "",
            }
          : prev,
      );
      try {
        await fetch("/api/bootstrap/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            analyzeLimit: mode === "initial" ? 1 : 0,
          }),
        });
      } catch {
        // swallow UI trigger errors and rely on status endpoint
      } finally {
        await loadBootstrapStatus();
        setRunningBootstrap(false);
      }
    },
    [loadBootstrapStatus, runningBootstrap],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/auth/status", { cache: "no-store" });
        const data = (await res.json()) as AuthStatusResponse;
        if (cancelled) return;
        setAuthStatus(data);
        if (data.authenticated && data.user) {
          setUser({ name: data.user.name, email: data.user.email });
          await loadBootstrapStatus();
        }
      } catch {
        // silent
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [loadBootstrapStatus]);

  useEffect(() => {
    if (!bootstrap || bootstrap.bootstrapStatus !== "syncing") return;
    const interval = window.setInterval(() => {
      void loadBootstrapStatus();
    }, 2500);
    return () => {
      window.clearInterval(interval);
    };
  }, [bootstrap, loadBootstrapStatus]);

  useEffect(() => {
    if (!authStatus?.authenticated || !bootstrap || !integrationsConnected) return;
    if (autoTriggeredRefresh.current) return;

    const isStale =
      !bootstrap.lastAutoSyncAt ||
      Date.now() - bootstrap.lastAutoSyncAt > AUTO_REFRESH_STALE_MS;
    const hasEmptyCachedStats =
      bootstrap.stats.courses === 0 && bootstrap.stats.quizzes === 0;
    const shouldRunInitial =
      !bootstrap.hasInitialSync && bootstrap.bootstrapStatus !== "syncing";
    const shouldRunRefresh =
      bootstrap.hasInitialSync &&
      bootstrap.bootstrapStatus !== "syncing" &&
      (isStale || hasEmptyCachedStats);

    if (!shouldRunInitial && !shouldRunRefresh) {
      return;
    }

    autoTriggeredRefresh.current = true;
    void runBootstrap(shouldRunInitial ? "initial" : "refresh");
  }, [authStatus, bootstrap, integrationsConnected, runBootstrap]);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!userMenuRef.current || !(event.target instanceof Node)) {
        return;
      }
      if (!userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  const lastSyncLabel = bootstrap ? formatLastSync(bootstrap.lastAutoSyncAt) : "Never";
  const bootstrapContextValue = useMemo(
    () => ({
      bootstrap,
      runningBootstrap,
      runBootstrap,
    }),
    [bootstrap, runBootstrap, runningBootstrap],
  );

  return (
    <DashboardBootstrapProvider value={bootstrapContextValue}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            height: 48,
            background: "#6E4836",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24, flex: 1 }}>
            <Link
              href={routes.landing()}
              style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#FFF", letterSpacing: 0.2 }}>
                EduInsight
              </span>
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== routes.dashboard() && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        padding: "6px 16px",
                        borderRadius: 5,
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        color: active ? "#FFF" : "rgba(255,255,255,0.65)",
                        background: active ? "rgba(255,255,255,0.15)" : "transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div ref={userMenuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                {user?.name ?? ""}
              </span>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "#4A9E83",
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>
            </button>

            {isUserMenuOpen && (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "#FFFFFF",
                  border: "1px solid #E8DFD4",
                  borderRadius: 8,
                  boxShadow: "0 10px 20px rgba(61, 50, 41, 0.12)",
                  padding: 6,
                  minWidth: 132,
                  zIndex: 20,
                }}
              >
                <Link
                  href={routes.settings()}
                  onClick={() => setIsUserMenuOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    role="menuitem"
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      color: "#6D6154",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Settings
                  </div>
                </Link>
              </div>
            )}
          </div>
        </header>

        <div
          style={{
            padding: "10px 28px",
            borderBottom: "1px solid #F0ECE5",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            background: "#FFFFFF",
          }}
        >
          <Suspense fallback={<span style={{ color: "#B5AA9C" }}>Dashboard</span>}>
            <BreadcrumbTrail pathname={pathname} />
          </Suspense>
        </div>

        {authStatus?.authenticated && bootstrap && (
          <div
            style={{
              padding: "10px 28px",
              borderBottom: "1px solid #F0ECE5",
              background: "#FFFDF9",
            }}
          >
            {!integrationsConnected ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#8B6914" }}>
                  Google access needs reconnect before syncing can continue.
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#B5AA9C" }}>
                  Open Settings from your profile menu.
                </p>
              </div>
            ) : bootstrap.bootstrapStatus === "syncing" ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#8B6914" }}>
                  Preparing classroom data in background... {bootstrap.stats.courses} course(s), {bootstrap.stats.quizzes} quiz(es).
                </p>
                <button className="edu-btn-outline" style={{ fontSize: 12, padding: "4px 10px" }} disabled>
                  Syncing...
                </button>
              </div>
            ) : bootstrap.bootstrapStatus === "error" ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#A63D2E" }}>
                  {bootstrap.lastBootstrapError || "Data refresh failed. Retry to refresh classroom data."}
                </p>
                <button
                  className="edu-btn-outline"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() =>
                    void runBootstrap(bootstrap.hasInitialSync ? "refresh" : "initial")
                  }
                  disabled={runningBootstrap}
                >
                  {runningBootstrap ? "Retrying..." : "Retry Sync"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#8A7D6F" }}>
                  Data ready - last synced {lastSyncLabel}. {bootstrap.stats.courses} course(s), {bootstrap.stats.quizzes} quiz(es).
                </p>
                <button
                  className="edu-btn-outline"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => void runBootstrap("refresh")}
                  disabled
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        )}

        <main style={{ flex: 1, padding: 28, background: "#FAF6F0", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </DashboardBootstrapProvider>
  );
}
