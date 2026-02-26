"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { renditionRoutes } from "@/lib/renditions";
import { mockUser } from "@/lib/mock-data";

const ID = "1";
const r = renditionRoutes(ID);

const nav = [
  { href: r.dashboard(), label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: r.courses(), label: "Courses", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: r.settings(), label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function Shell1({ children }: { children: React.ReactNode }) {
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, background: "#FFF", borderRight: "1px solid #E8DFD4", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <Link href={r.landing()} style={{ textDecoration: "none" }}>
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #F0ECE5", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#C17A56", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 600, color: "#C17A56" }}>EduInsight</span>
          </div>
        </Link>
        <nav style={{ flex: 1, padding: "14px 12px" }}>
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== r.dashboard() && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 6, marginBottom: 3, background: active ? "rgba(193,122,86,0.08)" : "transparent", color: active ? "#C17A56" : "#8A7D6F", fontWeight: active ? 600 : 400, fontSize: 14 }}>
                  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={item.icon} /></svg>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #F0ECE5", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #C17A56, #D4956E)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{mockUser.avatar}</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#3D3229" }}>{mockUser.name}</p>
            <p style={{ fontSize: 10, color: "#B5AA9C", margin: 0 }}>{mockUser.email}</p>
          </div>
        </div>
      </aside>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FAF6F0" }}>
        <div style={{ padding: "10px 28px", borderBottom: "1px solid #F0ECE5", display: "flex", alignItems: "center", gap: 6, fontSize: 13, background: "#FFF" }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span style={{ color: "#D6CBBF" }}>/</span>}
              {i === crumbs.length - 1 ? <span style={{ fontWeight: 600, color: "#C17A56" }}>{c.label}</span> : <Link href={c.href} style={{ color: "#B5AA9C", textDecoration: "none" }}>{c.label}</Link>}
            </span>
          ))}
        </div>
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
