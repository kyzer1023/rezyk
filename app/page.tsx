"use client";

import Link from "next/link";

const renditions = [
  {
    id: 1,
    name: "Warm Academic",
    description: "Serif-accented warmth with paper textures and gentle fade-in animations. Classic and inviting.",
    fonts: "Libre Baskerville + Source Sans 3",
    bgColor: "#FAF7F2",
    accentColor: "#C1694F",
    textColor: "#3B2F2F",
    cardBg: "#FFFFFF",
    features: ["Paper grain texture", "Serif typography", "Fade-in stagger"],
  },
  {
    id: 2,
    name: "Zen Chalkboard",
    description: "Deep green chalkboard aesthetic with chalk-like typography, quiet dark tones, and subtle grain texture.",
    fonts: "Playfair Display + Source Sans 3",
    bgColor: "#1A271A",
    accentColor: "#8BA878",
    textColor: "#E8E5D8",
    cardBg: "#2A3C2A",
    features: ["Chalkboard texture", "Chalk write animation", "Dark zen palette"],
  },
  {
    id: 3,
    name: "Warm Earth",
    description: "Terracotta and olive organic tones with a warm sidebar, card-based student list, and gentle slide animations.",
    fonts: "Crimson Pro + Nunito",
    bgColor: "#FAF6F0",
    accentColor: "#C17A56",
    textColor: "#3D3229",
    cardBg: "#FFFFFF",
    features: ["Terracotta accents", "Serif headings", "Warm sidebar"],
  },
  {
    id: 4,
    name: "Nordic Fog",
    description: "Muted cool greys and steel blue with a compact icon-rail sidebar, frosted glass cards, and subtle grain overlay.",
    fonts: "Outfit + Figtree",
    bgColor: "#E8EDF2",
    accentColor: "#5C7D99",
    textColor: "#2C3540",
    cardBg: "rgba(255,255,255,0.7)",
    features: ["Icon-rail sidebar", "Grain texture", "Frost-glass cards"],
  },
  {
    id: 5,
    name: "Dark Scholarly",
    description: "Dignified dark theme with WebGL constellation particles, gold accents, and smooth slide transitions.",
    fonts: "Playfair Display + Lato",
    bgColor: "#1A1A2E",
    accentColor: "#C9A96E",
    textColor: "#E8E4DB",
    cardBg: "#16213E",
    features: ["WebGL star field", "Gold shimmer", "Slide transitions"],
  },
];

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#1a1a1a",
      }}
    >
      <style>{`
        @keyframes pickerFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .picker-card {
          animation: pickerFadeIn 0.5s ease-out both;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .picker-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
        }
        .picker-card:nth-child(1) { animation-delay: 0.1s; }
        .picker-card:nth-child(2) { animation-delay: 0.2s; }
        .picker-card:nth-child(3) { animation-delay: 0.3s; }
        .picker-card:nth-child(4) { animation-delay: 0.4s; }
        .picker-card:nth-child(5) { animation-delay: 0.5s; }
        .picker-feature {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          background: rgba(0,0,0,0.06);
          margin: 2px;
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 56, animation: "pickerFadeIn 0.5s ease-out both" }}>
          <h1 style={{ fontSize: 38, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>
            EduInsight AI Renditions
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
            Five distinct design approaches for the same teacher dashboard.
            Each features the complete navigation workflow with different aesthetics.
          </p>
        </div>

        <div style={{ display: "grid", gap: 24 }}>
          {renditions.map((r) => (
            <Link key={r.id} href={`/${r.id}`} className="picker-card">
              <div style={{ display: "flex", border: "1px solid #E5E5E5", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
                {/* Color preview */}
                <div
                  style={{
                    width: 200,
                    minHeight: 180,
                    background: r.bgColor,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: 20,
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: r.accentColor, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: r.bgColor === "#1A1A2E" || r.bgColor === "#1A271A" ? r.textColor : "#fff" }}>
                      {r.id}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {[r.bgColor, r.accentColor, r.textColor, r.cardBg].map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: c,
                          border: "1.5px solid rgba(0,0,0,0.1)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, padding: "20px 28px" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                    {r.name}
                  </h2>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.5, marginBottom: 12 }}>
                    {r.description}
                  </p>
                  <p style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>
                    Fonts: {r.fonts}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {r.features.map((f) => (
                      <span key={f} className="picker-feature">{f}</span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ display: "flex", alignItems: "center", paddingRight: 24, color: "#ccc" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
