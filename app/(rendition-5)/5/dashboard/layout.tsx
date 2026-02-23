"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser } from "@/lib/mock-data";

const ParticleStarField = dynamic(() => import("@/components/three/ParticleStarField"), { ssr: false });

const navItems = [
  { href: "/5/dashboard", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: "/5/dashboard/courses", label: "Courses", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/5/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: "/5/dashboard" }];
  if (pathname.includes("/courses")) {
    crumbs.push({ label: "Courses", href: "/5/dashboard/courses" });
    const courseMatch = pathname.match(/courses\/([^/]+)/);
    if (courseMatch) {
      const cId = courseMatch[1];
      crumbs.push({ label: "Course", href: `/5/dashboard/courses/${cId}` });
      if (pathname.includes("/quizzes")) {
        crumbs.push({ label: "Quizzes", href: `/5/dashboard/courses/${cId}/quizzes` });
        const quizMatch = pathname.match(/quizzes\/([^/]+)/);
        if (quizMatch) {
          const qId = quizMatch[1];
          if (pathname.includes("/sync")) crumbs.push({ label: "Sync", href: pathname });
          else if (pathname.includes("/analysis")) crumbs.push({ label: "Analysis", href: pathname });
          else if (pathname.includes("/insights")) crumbs.push({ label: "Insights", href: pathname });
          else if (pathname.includes("/students")) {
            crumbs.push({ label: "Students", href: `/5/dashboard/courses/${cId}/quizzes/${qId}/students` });
            if (pathname.match(/students\/[^/]+$/)) crumbs.push({ label: "Detail", href: pathname });
          }
        }
      }
      if (pathname.includes("/history")) crumbs.push({ label: "History", href: pathname });
    }
  }
  return crumbs;
}

export default function R5DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      <ParticleStarField />

      <aside style={{
        width: 200, padding: "20px 0", display: "flex", flexDirection: "column", flexShrink: 0,
        position: "relative", zIndex: 2, background: "rgba(26,26,46,0.9)",
        borderRight: "1px solid rgba(201,169,110,0.1)",
      }}>
        <Link href="/5" style={{ textDecoration: "none" }}>
          <div style={{ padding: "0 16px 16px", borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
            <h2 className="r5-heading" style={{ fontSize: 15, margin: 0 }}>
              Edu<span className="r5-gold">Insight</span>
            </h2>
          </div>
        </Link>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/5/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 6, marginBottom: 2,
                  background: active ? "rgba(201,169,110,0.1)" : "transparent",
                  color: active ? "#C9A96E" : "#94A3B8", fontWeight: active ? 700 : 400, fontSize: 13,
                  transition: "all 0.15s",
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={item.icon} /></svg>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(201,169,110,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid #C9A96E", color: "#C9A96E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{mockUser.avatar}</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: "#E8E4DB" }}>{mockUser.name}</p>
              <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>{mockUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 2 }}>
        <div style={{
          padding: "10px 24px", fontSize: 12, display: "flex", alignItems: "center", gap: 6,
          background: "rgba(26,26,46,0.8)", borderBottom: "1px solid rgba(201,169,110,0.08)",
        }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span style={{ color: "#475569" }}>/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span style={{ fontWeight: 700, color: "#C9A96E" }}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} style={{ color: "#64748B", textDecoration: "none" }}>{crumb.label}</Link>
              )}
            </span>
          ))}
        </div>
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
