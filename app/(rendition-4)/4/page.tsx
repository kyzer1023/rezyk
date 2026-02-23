"use client";

import Link from "next/link";

export default function R4Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(165deg, #E8EDF2 0%, #D5DEE8 50%, #C8D4E0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div className="r4-fade-in" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "#5C7D99",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>

        <h1 className="r4-heading r4-fade-in" style={{ fontSize: 34, marginBottom: 10, fontWeight: 400, letterSpacing: -0.5 }}>
          EduInsight AI
        </h1>
        <p className="r4-fade-in r4-fd1 r4-muted" style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
          Clear, focused teaching analytics.
          Turn quiz data into intervention decisions.
        </p>

        <div className="r4-card r4-fade-in r4-fd2" style={{ padding: "32px 28px" }}>
          <Link href="/4/auth/callback">
            <button className="r4-btn" style={{ fontSize: 15, padding: "13px 28px", width: "100%" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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

        <p className="r4-fade-in r4-fd3" style={{ fontSize: 12, color: "#A0B2C4", marginTop: 28 }}>
          SDG 4 &middot; Quality Education &middot; KitaHack 2026
        </p>
      </div>
    </div>
  );
}
