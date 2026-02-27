"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   RENDITION 5 — Playful / Modern
   Direction: Vibrant coral + teal accents on warm cream, bouncy spring
   animations, oversized rounded cards, emoji-driven iconography,
   confetti-dot backgrounds, bold sans-serif, sticker-like badges.
   ═══════════════════════════════════════════════════════════════════ */

function useVis(ref: React.RefObject<HTMLElement | null>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, [ref]);
  return v;
}

function Pop({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useVis(ref);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0) scale(1)" : "translateY(24px) scale(0.92)",
      transition: `all 0.55s cubic-bezier(.34,1.56,.64,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

const CORAL = "#E07A5F";
const TEAL = "#3D8B7A";
const CREAM = "#FFF8F0";
const WARM = "#F5EDE3";
const DARK = "#2D2926";

function FunMock() {
  return (
    <div style={{ background: "#fff", borderRadius: 28, padding: 24, border: "3px solid #f0ece5", boxShadow: "0 16px 48px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)", maxWidth: 440, width: "100%", position: "relative" }}>
      <div style={{ position: "absolute", top: -12, right: 20, background: CORAL, color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>LIVE</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {[
          { emoji: "🎯", value: "6", label: "At Risk", bg: "#FFF0EC" },
          { emoji: "📈", value: "72%", label: "Average", bg: "#EEFBF6" },
          { emoji: "💡", value: "12", label: "Insights", bg: "#FFF6E8" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, padding: "16px 10px", borderRadius: 18, background: s.bg, textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: DARK }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#8a7d6f", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { name: "Alex M.", status: "Critical", bg: "#FFF0EC", color: CORAL, emoji: "🔴" },
          { name: "Sarah J.", status: "At Risk", bg: "#FFF6E8", color: "#C17A56", emoji: "🟡" },
          { name: "David L.", status: "On Track", bg: "#EEFBF6", color: TEAL, emoji: "🟢" },
        ].map((s) => (
          <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 14, background: s.bg }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{s.emoji} {s.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const authRes = await fetch("/api/auth/status", { cache: "no-store" });
        const authData = (await authRes.json()) as { authenticated: boolean };
        if (!authData.authenticated) { setChecking(false); return; }
        const bootstrapRes = await fetch("/api/bootstrap/status", { cache: "no-store" });
        if (!bootstrapRes.ok) { router.replace("/dashboard"); return; }
        const bootstrapData = (await bootstrapRes.json()) as { hasInitialSync: boolean };
        router.replace(bootstrapData.hasInitialSync ? "/dashboard" : "/onboarding/integrations");
      } catch { setChecking(false); }
    }
    void checkSession();
  }, [router]);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "4px solid #f0ece5", borderTopColor: CORAL, borderRadius: "50%", animation: "spin .6s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: CREAM, minHeight: "100vh" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes wiggle{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{ padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${CORAL}, ${TEAL})`, display: "flex", alignItems: "center", justifyContent: "center", animation: "wiggle 3s ease-in-out infinite" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: DARK }}>EduInsight AI</span>
        </div>
        <a href="/api/auth/login" style={{ textDecoration: "none", background: CORAL, color: "#fff", padding: "12px 28px", borderRadius: 14, fontSize: 14, fontWeight: 700, boxShadow: `0 4px 14px rgba(224,122,95,0.3)` }}>
          🚀 Get Started
        </a>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 48px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 20, background: "#EEFBF6", border: `1.5px solid ${TEAL}`, marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>Powered by Gemini AI</span>
          </div>
          <h1 style={{ fontSize: 52, lineHeight: 1.12, fontWeight: 900, color: DARK, margin: "0 0 20px" }}>
            Make every quiz a <span style={{ color: CORAL, textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: CORAL, textUnderlineOffset: "6px" }}>teaching moment</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "#7a7064", maxWidth: 440, marginBottom: 32 }}>
            Transform Google Classroom quiz data into personalized learning insights.
            Know exactly which concepts each student struggles with — and why.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/api/auth/login" style={{ textDecoration: "none", background: `linear-gradient(135deg, ${CORAL}, #D06A4F)`, color: "#fff", padding: "16px 32px", borderRadius: 16, fontSize: 16, fontWeight: 700, display: "inline-block", boxShadow: `0 8px 24px rgba(224,122,95,0.3)` }}>
              Start Free with Google →
            </a>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            {["🔒 Secure", "👁️ Read-only", "🌍 SDG 4"].map((t) => (
              <span key={t} style={{ fontSize: 12, color: "#8a7d6f", fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", animation: "bounce 3s ease-in-out infinite" }}>
          <FunMock />
        </div>
      </section>

      {/* ─── CAPABILITIES ─── */}
      <section style={{ background: "#fff", borderRadius: "40px 40px 0 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
          <Pop>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: TEAL, textTransform: "uppercase" }}>System Capabilities</span>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: DARK, margin: "8px 0 12px" }}>Pedagogical Intelligence 🧠</h2>
            <p style={{ fontSize: 15, color: "#8a7d6f", maxWidth: 480, margin: "0 auto 48px" }}>Automated insights derived from psychometric analysis.</p>
          </Pop>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { emoji: "🔬", title: "Misconception Decoding", desc: "Our engine analyzes distractor choices to pinpoint exactly why a student failed.", bg: "#FFF6E8" },
              { emoji: "📊", title: "Risk Stratification", desc: "Predictive modeling identifies at-risk students before their grades reflect it.", bg: "#FFF0EC" },
              { emoji: "🗺️", title: "Curriculum Heatmaps", desc: "Visualize concept mastery across your class. Spot systemic gaps instantly.", bg: "#EEFBF6" },
            ].map((c, i) => (
              <Pop key={c.title} delay={i * 0.1}>
                <div style={{ background: c.bg, borderRadius: 24, padding: "36px 24px", textAlign: "left", height: "100%", border: "2px solid rgba(0,0,0,0.04)" }}>
                  <span style={{ fontSize: 36, display: "block", marginBottom: 14 }}>{c.emoji}</span>
                  <h3 style={{ fontSize: 20, color: DARK, margin: "0 0 10px", fontWeight: 800 }}>{c.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "#7a7064", margin: 0 }}>{c.desc}</p>
                </div>
              </Pop>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENTO ─── */}
      <section style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px 80px" }}>
          <Pop>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: DARK, textAlign: "center", margin: "0 0 48px" }}>From Data to Pedagogy 📖</h2>
          </Pop>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { emoji: "⊙", title: "Misconception Analysis", desc: "AI reveals root causes of misunderstanding.", accent: CORAL,
                mock: <div style={{ background: "#FFF6E8", borderRadius: 14, padding: "12px 14px", marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}><span style={{ background: CORAL, color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 10 }}>Q3</span><div><p style={{ fontSize: 12, fontWeight: 700, color: DARK, margin: 0 }}>42% selected &quot;B&quot;</p><p style={{ fontSize: 11, color: "#8a7d6f", margin: "2px 0 0" }}>Confusing area with perimeter</p></div></div> },
              { emoji: "⟁", title: "Student Risk Stratification", desc: "See who needs help right now.", accent: "#D06A4F",
                mock: <div style={{ marginTop: 16, display: "flex", flexDirection: "column" as const, gap: 6 }}>{[{n:"Alex M.",e:"🔴",s:"Critical",c:CORAL},{n:"Sarah J.",e:"🟡",s:"At Risk",c:"#C17A56"},{n:"David L.",e:"🟢",s:"On Track",c:TEAL}].map(s=><div key={s.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:10,background:WARM}}><span style={{fontSize:13,color:DARK}}>{s.e} {s.n}</span><span style={{fontSize:10,fontWeight:700,color:s.c}}>{s.s}</span></div>)}</div> },
              { emoji: "▦", title: "Concept Heatmap", desc: "Visualize class performance across topics.", accent: TEAL,
                mock: <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginTop: 16 }}>{["#6B8E5C","#8aab64","#6b8e4e","#c9a96e","#E07A5F","#6B8E5C","#8aab64","#a8c27a","#E07A5F","#8aab64"].map((c,j)=><div key={j} style={{aspectRatio:"1",borderRadius:10,background:c,opacity:0.85}} />)}</div> },
              { emoji: "✎", title: "Intervention Plans", desc: "AI-generated teaching strategies.", accent: "#6B8E5C",
                mock: <div style={{ background: "#EEFBF6", borderLeft: `4px solid ${TEAL}`, borderRadius: "0 14px 14px 0", padding: "14px 16px", marginTop: 16 }}><p style={{ fontSize: 13, fontStyle: "italic", color: "#3D8B7A", margin: 0, lineHeight: 1.6 }}>&quot;Group A needs a refresher on quadratic factoring. Try the Tile Method.&quot;</p></div> },
            ].map((f, i) => (
              <Pop key={f.title} delay={i * 0.1}>
                <div style={{ background: CREAM, borderRadius: 24, padding: 28, border: "2px solid #f0ece5", height: "100%" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "#fff", border: "2px solid #f0ece5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 20, color: f.accent }}>{f.emoji}</div>
                  <h3 style={{ fontSize: 20, color: DARK, margin: "0 0 6px", fontWeight: 800 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "#7a7064", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                  {f.mock}
                </div>
              </Pop>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
        <Pop>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: DARK, fontStyle: "italic", margin: "0 0 48px" }}>Workflow Integration ⚡</h2>
        </Pop>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { n: "1️⃣", title: "Connect Classroom", desc: "Sync rosters and quizzes with secure OAuth.", bg: `linear-gradient(135deg, ${CORAL}, #D06A4F)` },
            { n: "2️⃣", title: "Automated Scan", desc: "Engine maps answers against misconception patterns.", bg: `linear-gradient(135deg, #8a7d6f, #6b6058)` },
            { n: "3️⃣", title: "Actionable Insights", desc: "Grouped cohorts with reteaching strategies.", bg: `linear-gradient(135deg, ${TEAL}, #2a7262)` },
          ].map((s, i) => (
            <Pop key={s.title} delay={i * 0.12}>
              <div style={{ background: s.bg, borderRadius: 24, padding: "36px 24px", textAlign: "left", color: "#fff" }}>
                <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>{s.n}</span>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>{s.title}</h4>
                <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.8, margin: 0 }}>{s.desc}</p>
              </div>
            </Pop>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ background: `linear-gradient(135deg, ${CORAL}, ${TEAL})`, borderRadius: "40px 40px 0 0", padding: "80px 48px", textAlign: "center" }}>
        <Pop>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: "#fff", margin: "0 0 16px" }}>Ready to level up your teaching? 🚀</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 32 }}>Join teachers using AI to understand every student.</p>
          <a href="/api/auth/login" style={{ textDecoration: "none", background: "#fff", color: CORAL, padding: "18px 40px", borderRadius: 18, fontSize: 17, fontWeight: 800, display: "inline-block", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
            Get Started with Google
          </a>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 24 }}>SDG 4 · Quality Education · KitaHack 2026 · Gemini AI</p>
        </Pop>
      </section>
    </div>
  );
}
