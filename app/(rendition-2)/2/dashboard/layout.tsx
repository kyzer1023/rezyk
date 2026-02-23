"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser } from "@/lib/mock-data";

const navItems = [
  { href: "/2/dashboard", label: "Overview", icon: "M4 6h16M4 12h8m-8 6h16" },
  { href: "/2/dashboard/courses", label: "Courses", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/2/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: "/2/dashboard" }];
  if (pathname.includes("/courses")) {
    crumbs.push({ label: "Courses", href: "/2/dashboard/courses" });
    const courseMatch = pathname.match(/courses\/([^/]+)/);
    if (courseMatch) {
      const cId = courseMatch[1];
      crumbs.push({ label: "Course", href: `/2/dashboard/courses/${cId}` });
      if (pathname.includes("/quizzes")) {
        crumbs.push({ label: "Quizzes", href: `/2/dashboard/courses/${cId}/quizzes` });
        const quizMatch = pathname.match(/quizzes\/([^/]+)/);
        if (quizMatch) {
          const qId = quizMatch[1];
          if (pathname.includes("/sync")) crumbs.push({ label: "Sync", href: pathname });
          else if (pathname.includes("/analysis")) crumbs.push({ label: "Analysis", href: pathname });
          else if (pathname.includes("/insights")) crumbs.push({ label: "Insights", href: pathname });
          else if (pathname.includes("/students")) {
            crumbs.push({ label: "Students", href: `/2/dashboard/courses/${cId}/quizzes/${qId}/students` });
            if (pathname.match(/students\/[^/]+$/)) crumbs.push({ label: "Detail", href: pathname });
          }
        }
      }
      if (pathname.includes("/history")) crumbs.push({ label: "History", href: pathname });
    }
  }
  return crumbs;
}

export default function R2DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(175deg, #1A271A 0%, #0E180E 100%)",
      }}
    >
      <aside
        style={{
          width: 200,
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: "1px solid rgba(139,168,120,0.12)",
          background: "rgba(20,32,20,0.6)",
        }}
      >
        <Link href="/2" style={{ textDecoration: "none" }}>
          <div style={{ padding: "0 20px 18px", borderBottom: "1px solid rgba(139,168,120,0.12)" }}>
            <h2
              className="r2-heading"
              style={{ fontSize: 16, margin: 0, color: "#8BA878", fontWeight: 500, letterSpacing: 0.5 }}
            >
              EduInsight AI
            </h2>
          </div>
        </Link>

        <nav style={{ flex: 1, padding: "14px 10px" }}>
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/2/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 4,
                    marginBottom: 2,
                    background: active ? "rgba(139,168,120,0.12)" : "transparent",
                    color: active ? "#8BA878" : "rgba(232,229,216,0.5)",
                    fontWeight: active ? 600 : 400,
                    fontSize: 14,
                    transition: "all 0.15s",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(139,168,120,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 4,
                background: "rgba(139,168,120,0.2)",
                color: "#8BA878",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {mockUser.avatar}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: "#E8E5D8" }}>{mockUser.name}</p>
              <p style={{ fontSize: 10, color: "rgba(232,229,216,0.4)", margin: 0 }}>{mockUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "10px 28px",
            borderBottom: "1px solid rgba(139,168,120,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
          }}
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span style={{ color: "rgba(139,168,120,0.3)" }}>/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span style={{ fontWeight: 600, color: "#8BA878" }}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} style={{ color: "rgba(232,229,216,0.4)", textDecoration: "none" }}>
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </div>
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
