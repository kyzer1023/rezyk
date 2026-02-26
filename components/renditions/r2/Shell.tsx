"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { renditionRoutes } from "@/lib/renditions";
import { mockUser } from "@/lib/mock-data";

const ID = "2";
const r = renditionRoutes(ID);

const navItems = [
  { href: r.dashboard(), label: "Overview" },
  { href: r.courses(), label: "Courses" },
  { href: r.settings(), label: "Settings" },
];

export default function Shell2({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: r.dashboard() }];
  if (pathname.includes("/courses")) {
    crumbs.push({ label: "Courses", href: r.courses() });
    const cm = pathname.match(/courses\/([^/]+)/);
    if (cm) {
      crumbs.push({ label: "Course", href: r.course(cm[1]) });
      if (pathname.includes("/quizzes")) {
        crumbs.push({ label: "Quizzes", href: r.quizzes(cm[1]) });
        const qm = pathname.match(/quizzes\/([^/]+)/);
        if (qm) {
          if (pathname.includes("/sync")) crumbs.push({ label: "Sync", href: pathname });
          else if (pathname.includes("/analysis")) crumbs.push({ label: "Analysis", href: pathname });
          else if (pathname.includes("/insights")) crumbs.push({ label: "Insights", href: pathname });
          else if (pathname.includes("/students")) {
            crumbs.push({ label: "Students", href: r.students(cm[1], qm[1]) });
            if (pathname.match(/students\/[^/]+$/)) crumbs.push({ label: "Detail", href: pathname });
          }
        }
      }
      if (pathname.includes("/history")) crumbs.push({ label: "History", href: pathname });
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F0F5FA" }}>
      <header style={{ background: "#1B3A5C", color: "#FFF", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href={r.landing()} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#FFF" }}>EduInsight</span>
          </Link>
          <nav style={{ display: "flex", gap: 4 }}>
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== r.dashboard() && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: active ? 600 : 400, color: active ? "#FFF" : "#CBD5E1", background: active ? "rgba(255,255,255,0.12)" : "transparent" }}>
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#CBD5E1" }}>{mockUser.name}</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563EB", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{mockUser.avatar}</div>
        </div>
      </header>
      <div style={{ padding: "8px 32px", background: "#FFF", borderBottom: "1px solid #D6E4F0", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span style={{ color: "#CBD5E1" }}>›</span>}
            {i === crumbs.length - 1 ? <span style={{ fontWeight: 600, color: "#2563EB" }}>{c.label}</span> : <Link href={c.href} style={{ color: "#94A3B8", textDecoration: "none" }}>{c.label}</Link>}
          </span>
        ))}
      </div>
      <main style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>{children}</main>
    </div>
  );
}
