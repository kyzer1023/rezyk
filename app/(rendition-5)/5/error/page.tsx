"use client";

import Link from "next/link";

export default function R5Error() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1A1A2E", padding: 20 }}>
      <div className="r5-slide-in" style={{ textAlign: "center", maxWidth: 380 }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <h1 className="r5-heading" style={{ fontSize: 22, marginBottom: 6 }}>Something went wrong</h1>
        <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>An error occurred. Please retry or return to the dashboard.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button className="r5-btn" onClick={() => window.location.reload()}>Retry</button>
          <Link href="/5/dashboard"><button className="r5-btn-outline">Dashboard</button></Link>
        </div>
      </div>
    </div>
  );
}
