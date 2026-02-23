"use client";

import Link from "next/link";

export default function R1Error() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="r1-fade-in" style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.4 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C1694F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1 className="r1-heading" style={{ fontSize: 26, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: "#8B7E7E", fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          We encountered an error while processing your request. This could be related
          to authentication, data sync, or analysis. Please try again.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="r1-btn" onClick={() => window.location.reload()}>Retry</button>
          <Link href="/1/dashboard">
            <button className="r1-btn-outline">Back to Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
