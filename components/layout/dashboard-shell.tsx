"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser } from "@/lib/mock-data";
import { routes } from "@/lib/routes";

type Breadcrumb = { label: string; href: string };

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
  {
    href: routes.settings(),
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
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

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

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

        <div style={{ padding: "14px 24px", borderTop: "1px solid #F0ECE5" }}>
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
              }}
            >
              {mockUser.avatar}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{mockUser.name}</p>
              <p style={{ fontSize: 10, color: "#B5AA9C", margin: 0 }}>{mockUser.email}</p>
            </div>
          </div>
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
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
