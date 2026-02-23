"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser } from "@/lib/mock-data";

const navItems = [
  { href: "/1/dashboard", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: "/1/dashboard/courses", label: "Courses", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/1/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: "/1/dashboard" }];
  if (pathname.includes("/courses")) {
    crumbs.push({ label: "Courses", href: "/1/dashboard/courses" });
    const courseMatch = pathname.match(/courses\/([^/]+)/);
    if (courseMatch) {
      const cId = courseMatch[1];
      crumbs.push({ label: "Course", href: `/1/dashboard/courses/${cId}` });
      if (pathname.includes("/quizzes")) {
        crumbs.push({ label: "Quizzes", href: `/1/dashboard/courses/${cId}/quizzes` });
        const quizMatch = pathname.match(/quizzes\/([^/]+)/);
        if (quizMatch) {
          const qId = quizMatch[1];
          if (pathname.includes("/sync")) crumbs.push({ label: "Sync", href: pathname });
          else if (pathname.includes("/analysis")) crumbs.push({ label: "Analysis", href: pathname });
          else if (pathname.includes("/insights")) crumbs.push({ label: "Insights", href: pathname });
          else if (pathname.includes("/students")) {
            crumbs.push({ label: "Students", href: `/1/dashboard/courses/${cId}/quizzes/${qId}/students` });
            if (pathname.match(/students\/[^/]+$/)) crumbs.push({ label: "Detail", href: pathname });
          }
        }
      }
      if (pathname.includes("/history")) crumbs.push({ label: "History", href: pathname });
    }
  }
  return crumbs;
}

export default function R1DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 2 }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "#FFFFFF",
          borderRight: "1px solid #E8E0D5",
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <Link href="/1" style={{ textDecoration: "none" }}>
          <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #E8E0D5" }}>
            <h2 className="r1-heading r1-accent" style={{ fontSize: 18, margin: 0 }}>EduInsight AI</h2>
          </div>
        </Link>

        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/1/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 6,
                    marginBottom: 4,
                    background: active ? "rgba(193,105,79,0.08)" : "transparent",
                    color: active ? "#C1694F" : "#3B2F2F",
                    fontWeight: active ? 600 : 400,
                    fontSize: 15,
                    transition: "background 0.15s",
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #E8E0D5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#C1694F",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {mockUser.avatar}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{mockUser.name}</p>
              <p style={{ fontSize: 12, color: "#8B7E7E", margin: 0 }}>{mockUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Breadcrumbs */}
        <div
          style={{
            padding: "14px 32px",
            borderBottom: "1px solid #E8E0D5",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            background: "#FFFFFF",
          }}
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <span style={{ color: "#C4B8AC" }}>/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span style={{ fontWeight: 600, color: "#C1694F" }}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} style={{ color: "#8B7E7E", textDecoration: "none" }}>
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </div>

        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
