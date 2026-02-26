"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const AUTO_REFRESH_STALE_MS = 10 * 60 * 1000;

const navItems = [
  {
    href: routes.dashboard(),
    label: "Overview",
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  },
  {
    href: routes.courses(),
    label: "Courses",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
];

function buildBreadcrumbs(pathname: string): Breadcrumb[] {
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
      if (pathname.includes("/sync")) {
        crumbs.push({ label: "Sync", href: pathname });
      } else if (pathname.includes("/analysis")) {
        crumbs.push({ label: "Analysis", href: pathname });
      } else if (pathname.includes("/insights")) {
        crumbs.push({ label: "Insights", href: pathname });
      } else if (pathname.includes("/students")) {
        crumbs.push({ label: "Students", href: routes.students(courseId, quizId) });
        if (pathname.match(/students\/[^/]+$/)) {
          crumbs.push({ label: "Detail", href: pathname });
        }
      }
    }
  }

  if (pathname.includes("/history")) {
    crumbs.push({ label: "History", href: pathname });
  }

  return crumbs;
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
  const breadcrumbs = buildBreadcrumbs(pathname);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapStatusResponse | null>(null);
  const [runningBootstrap, setRunningBootstrap] = useState(false);
  const autoTriggeredRefresh = useRef(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    const shouldRunInitial =
      !bootstrap.hasInitialSync && bootstrap.bootstrapStatus !== "syncing";
    const shouldRunRefresh =
      bootstrap.hasInitialSync &&
      bootstrap.bootstrapStatus !== "syncing" &&
      isStale;

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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 230,
          padding: "22px 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          background: "#FFFFFF",
          borderRight: "1px solid #E8DFD4",
        }}
      >
        <Link href={routes.landing()} style={{ textDecoration: "none" }}>
          <div style={{ padding: "0 24px 18px", borderBottom: "1px solid #F0ECE5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#C17A56",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="14"
                  height="14"
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
              <span className="edu-heading" style={{ fontSize: 16, fontWeight: 600, color: "#C17A56" }}>
                EduInsight
              </span>
            </div>
          </div>
        </Link>

        <nav style={{ flex: 1, padding: "14px 12px" }}>
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== routes.dashboard() && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 6,
                    marginBottom: 3,
                    background: active ? "rgba(193,122,86,0.08)" : "transparent",
                    color: active ? "#C17A56" : "#8A7D6F",
                    fontWeight: active ? 600 : 400,
                    fontSize: 14,
                    transition: "all 0.15s",
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div
          ref={userMenuRef}
          style={{ padding: "14px 24px", borderTop: "1px solid #F0ECE5", position: "relative" }}
        >
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              padding: 0,
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C17A56, #D4956E)",
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{user?.name ?? "…"}</p>
                <p
                  style={{
                    fontSize: 10,
                    color: "#B5AA9C",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email ?? ""}
                </p>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8A7D6F"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isUserMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </button>

          {isUserMenuOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                bottom: "calc(100% - 4px)",
                background: "#FFFFFF",
                border: "1px solid #E8DFD4",
                borderRadius: 8,
                boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
                padding: 6,
                zIndex: 10,
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
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 6,
                    color: "#6D6154",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                  Settings
                </div>
              </Link>
            </div>
          )}
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FAF6F0" }}>
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
                  Open Settings from your account menu in the sidebar footer.
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
                <p style={{ margin: 0, fontSize: 13, color: "#5F738A" }}>
                  Data ready - last synced {lastSyncLabel}. {bootstrap.stats.courses} course(s), {bootstrap.stats.quizzes} quiz(es).
                </p>
                <button
                  className="edu-btn-outline"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => void runBootstrap("refresh")}
                  disabled={runningBootstrap}
                >
                  {runningBootstrap ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            )}
          </div>
        )}
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
