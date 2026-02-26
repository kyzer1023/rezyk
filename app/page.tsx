"use client";

import Link from "next/link";
import { themes } from "@/lib/renditions";

const entries = Object.values(themes);

export default function HubPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAF6F0", padding: "40px 20px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: "50%", background: "#C17A56",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, color: "#3D3229", marginBottom: 8 }}>
            EduInsight AI
          </h1>
          <p style={{ fontSize: 16, color: "#8A7D6F", maxWidth: 480, margin: "0 auto" }}>
            Choose a design rendition to explore the full teacher workflow with mock data.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240, 1fr))", gap: 16 }}>
          {entries.map((t) => (
            <Link key={t.id} href={`/${t.id}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: t.cardBg,
                  border: `1.5px solid ${t.cardBorder}`,
                  borderRadius: 10,
                  padding: 24,
                  cursor: "pointer",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 6px 20px ${t.accentLight}`;
                  e.currentTarget.style.borderColor = t.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = t.cardBorder;
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: t.accent,
                      color: "#FFF", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 700, fontSize: 18,
                    }}
                  >
                    {t.id}
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 600, color: t.text, margin: 0 }}>
                    {t.name}
                  </h2>
                </div>
                <p style={{ fontSize: 13, color: t.textSecondary, margin: 0, lineHeight: 1.5 }}>
                  {t.tagline}
                </p>
                <div style={{ marginTop: 16, display: "flex", gap: 6 }}>
                  {Object.values(t.risk).map((r, i) => (
                    <div key={i} style={{ width: 20, height: 6, borderRadius: 3, background: r.bg, border: `1px solid ${r.text}30` }} />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link
            href="/dashboard"
            style={{ fontSize: 13, color: "#8A7D6F", textDecoration: "underline" }}
          >
            Open live app (requires auth) →
          </Link>
        </div>
      </div>
    </div>
  );
}
