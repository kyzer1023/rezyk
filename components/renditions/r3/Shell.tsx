"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { renditionRoutes } from "@/lib/renditions";
import { mockUser } from "@/lib/mock-data";

const ID = "3";
const r = renditionRoutes(ID);

const navIcons = [
  { href: r.dashboard(), label: "Home", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: r.courses(), label: "Courses", d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: r.settings(), label: "Settings", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function Shell3({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 64, background: "#1B3830", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, flexShrink: 0 }}>
        <Link href={r.landing()} style={{ marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2D6A4F", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
          </div>
        </Link>
        {navIcons.map((item) => {
          const active = pathname === item.href || (item.href !== r.dashboard() && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} title={item.label} style={{ textDecoration: "none" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, background: active ? "rgba(255,255,255,0.12)" : "transparent", color: active ? "#FFF" : "#A7C4A0" }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={item.d} /></svg>
              </div>
            </Link>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2D6A4F", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginBottom: 16 }}>{mockUser.avatar}</div>
      </aside>
      <main style={{ flex: 1, background: "#F2F5F0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px 24px", background: "#FFF", borderBottom: "1px solid #D5DDD0", fontSize: 13, color: "#5C6B5C" }}>
          <span style={{ fontWeight: 600, color: "#2D6A4F" }}>EduInsight</span>
          <span style={{ margin: "0 8px", color: "#D5DDD0" }}>·</span>
          <span>{mockUser.name}</span>
        </div>
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
