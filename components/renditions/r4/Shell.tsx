"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { renditionRoutes } from "@/lib/renditions";

const ID = "4";
const r = renditionRoutes(ID);

const tabs = [
  { href: r.dashboard(), label: "Home", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: r.courses(), label: "Courses", d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: r.settings(), label: "Settings", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function Shell4({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FFF8F0" }}>
      <header style={{ padding: "14px 24px", background: "#FFF", borderBottom: "1px solid #F0E0D0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <Link href={r.landing()} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg, #E8725C, #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#4A3728" }}>EduInsight</span>
        </Link>
      </header>
      <main style={{ flex: 1, padding: "20px 24px", overflowY: "auto", paddingBottom: 80 }}>{children}</main>
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#FFF", borderTop: "1px solid #F0E0D0", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 50 }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== r.dashboard() && pathname.startsWith(tab.href));
          return (
            <Link key={tab.href} href={tab.href} style={{ textDecoration: "none", textAlign: "center" }}>
              <svg width="22" height="22" fill="none" stroke={active ? "#E8725C" : "#BCA78E"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={tab.d} /></svg>
              <p style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? "#E8725C" : "#BCA78E", margin: "2px 0 0" }}>{tab.label}</p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
