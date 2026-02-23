"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser } from "@/lib/mock-data";

const navItems = [
  { href: "/4/dashboard", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: "/4/dashboard/courses", label: "Courses", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/4/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: "/4/dashboard" }];
  if (pathname.includes("/courses")) {
    crumbs.push({ label: "Courses", href: "/4/dashboard/courses" });
    const courseMatch = pathname.match(/courses\/([^/]+)/);
    if (courseMatch) {
      const cId = courseMatch[1];
      crumbs.push({ label: "Course", href: `/4/dashboard/courses/${cId}` });
      if (pathname.includes("/quizzes")) {
        crumbs.push({ label: "Quizzes", href: `/4/dashboard/courses/${cId}/quizzes` });
        const quizMatch = pathname.match(/quizzes\/([^/]+)/);
        if (quizMatch) {
          const qId = quizMatch[1];
          if (pathname.includes("/sync")) crumbs.push({ label: "Sync", href: pathname });
          else if (pathname.includes("/analysis")) crumbs.push({ label: "Analysis", href: pathname });
          else if (pathname.includes("/insights")) crumbs.push({ label: "Insights", href: pathname });
          else if (pathname.includes("/students")) {
            crumbs.push({ label: "Students", href: `/4/dashboard/courses/${cId}/quizzes/${qId}/students` });
            if (pathname.match(/students\/[^/]+$/)) crumbs.push({ label: "Detail", href: pathname });
          }
        }
      }
      if (pathname.includes("/history")) crumbs.push({ label: "History", href: pathname });
    }
  }
  return crumbs;
}

export default function R4DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(165deg, #E8EDF2 0%, #D5DEE8 50%, #C8D4E0 100%)",
      }}
    >
      <aside
        style={{
          width: 64,
          padding: "16px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(160,178,196,0.15)",
        }}
      >
        <Link href="/4" style={{ textDecoration: "none", marginBottom: 24 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#5C7D99",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
        </Link>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/4/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }} title={item.label}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: active ? "rgba(92,125,153,0.12)" : "transparent",
                    color: active ? "#5C7D99" : "#8C9EB0",
                    transition: "all 0.15s",
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={item.icon} />
                  </svg>
                </div>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #5C7D99, #7B9BB5)",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
          }}
          title={mockUser.name}
        >
          {mockUser.avatar}
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "10px 28px",
            borderBottom: "1px solid rgba(160,178,196,0.12)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            background: "rgba(255,255,255,0.35)",
            backdropFilter: "blur(10px)",
          }}
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span style={{ color: "#B8C8D8" }}>/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span style={{ fontWeight: 600, color: "#5C7D99" }}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} style={{ color: "#8C9EB0", textDecoration: "none" }}>{crumb.label}</Link>
              )}
            </span>
          ))}
        </div>
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
