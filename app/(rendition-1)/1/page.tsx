"use client";

import Link from "next/link";

export default function R1Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="r1-fade-in" style={{ textAlign: "center", maxWidth: 520 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#C1694F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 28,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>

        <h1 className="r1-heading" style={{ fontSize: 36, marginBottom: 12, fontWeight: 700 }}>
          EduInsight AI
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "#6B5E5E", marginBottom: 40 }}>
          Transform quiz scores into actionable teaching insights. Identify student
          misconceptions and plan targeted interventions in minutes.
        </p>

        <Link href="/1/auth/callback">
          <button className="r1-btn" style={{ fontSize: 17, padding: "14px 36px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </span>
          </button>
        </Link>
      </div>

      <div
        className="r1-fade-in r1-fade-in-delay-3"
        style={{
          marginTop: 64,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 24,
          maxWidth: 560,
          width: "100%",
        }}
      >
        {[
          { label: "Sync Data", desc: "Pull quiz responses" },
          { label: "AI Analysis", desc: "Detect misconceptions" },
          { label: "Insights", desc: "Class heatmaps" },
          { label: "Intervene", desc: "Targeted actions" },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`r1-card r1-fade-in r1-fade-in-delay-${i + 1}`}
            style={{ padding: 20, textAlign: "center" }}
          >
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontSize: 13, color: "#8B7E7E" }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
