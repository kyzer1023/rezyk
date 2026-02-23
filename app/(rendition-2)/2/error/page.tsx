"use client";

import Link from "next/link";

export default function R2Error() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(175deg, #1A271A 0%, #0E180E 100%)",
        padding: 20,
      }}
    >
      <div className="r2-fade-in" style={{ textAlign: "center", maxWidth: 400 }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EF9A9A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginBottom: 20 }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <h1 className="r2-heading" style={{ fontSize: 24, marginBottom: 8, fontWeight: 500 }}>
          Something went wrong
        </h1>
        <p
          style={{
            color: "rgba(232,229,216,0.5)",
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          An error occurred. Please retry or return to the dashboard.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="r2-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
          <Link href="/2/dashboard">
            <button className="r2-btn-outline">Back to Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
