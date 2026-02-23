"use client";

import Link from "next/link";

export default function R2Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(175deg, #1A271A 0%, #0E180E 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(139,168,120,0.06) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 70%, rgba(139,168,120,0.04) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="r2-board r2-fade-in"
        style={{
          padding: "56px 48px",
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 4,
            background: "#8BA878",
            borderRadius: 2,
            margin: "0 auto 28px",
            opacity: 0.7,
          }}
        />

        <h1
          className="r2-heading r2-chalk-write"
          style={{ fontSize: 36, marginBottom: 12, fontWeight: 500, lineHeight: 1.2 }}
        >
          EduInsight AI
        </h1>
        <p
          className="r2-chalk r2-fade-in r2-fade-in-d1"
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "rgba(232,229,216,0.7)",
            marginBottom: 36,
            maxWidth: 380,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          A quiet space to understand your students.
          Transform quiz results into clear, focused teaching actions.
        </p>

        <Link href="/2/auth/callback">
          <button
            className="r2-btn r2-fade-in r2-fade-in-d2"
            style={{ fontSize: 16, padding: "14px 36px", width: "100%" }}
          >
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

        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 24,
            justifyContent: "center",
            opacity: 0.45,
            fontSize: 12,
          }}
          className="r2-fade-in r2-fade-in-d3"
        >
          <span>SDG 4 Quality Education</span>
          <span>KitaHack 2026</span>
        </div>
      </div>
    </div>
  );
}
