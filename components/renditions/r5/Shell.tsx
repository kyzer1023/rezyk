"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { renditionRoutes } from "@/lib/renditions";
import { mockUser } from "@/lib/mock-data";

const ID = "5";
const r = renditionRoutes(ID);

const navItems = [
  { href: r.dashboard(), label: "Overview", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: r.courses(), label: "Courses", d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: r.settings(), label: "Settings", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function Shell5({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 200, background: "#1F2937", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <Link href={r.landing()} style={{ textDecoration: "none" }}>
          <div style={{ padding: "18px 16px", borderBottom: "1px solid #374151", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#FFF" }}>EduInsight</span>
          </div>
        </Link>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== r.dashboard() && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, marginBottom: 2, background: active ? "rgba(99,102,241,0.15)" : "transparent", color: active ? "#FFF" : "#9CA3AF", fontSize: 13, fontWeight: active ? 600 : 400 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={item.d} /></svg>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #374151", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#6366F1", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{mockUser.avatar}</div>
          <div><p style={{ fontSize: 12, fontWeight: 500, color: "#E5E7EB", margin: 0 }}>{mockUser.name}</p><p style={{ fontSize: 10, color: "#6B7280", margin: 0 }}>{mockUser.email}</p></div>
        </div>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "8px 24px", background: "#111827", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#9CA3AF" }}>
            <span style={{ color: "#6366F1", fontWeight: 600 }}>Dashboard</span>
            {pathname.includes("/courses") && <><span>›</span><span>Courses</span></>}
            {pathname.includes("/quizzes") && <><span>›</span><span>Quizzes</span></>}
            {pathname.includes("/insights") && <><span>›</span><span style={{ color: "#FFF" }}>Insights</span></>}
            {pathname.includes("/students") && <><span>›</span><span style={{ color: "#FFF" }}>Students</span></>}
            {pathname.includes("/history") && <><span>›</span><span style={{ color: "#FFF" }}>History</span></>}
          </div>
        </header>
        <main style={{ flex: 1, padding: "20px 24px", background: "#F8F9FB", overflowY: "auto" }}>{children}</main>
      </div>
    </div>
  );
}
