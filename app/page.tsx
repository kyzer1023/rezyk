"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   RENDITION 2 — Geometric / Art Deco
   Direction: Structured grids, angular card borders, bold geometric
   accents, slab-serif headlines, copper/cream/charcoal palette,
   decorative border patterns, staggered entrance animations.
   ═══════════════════════════════════════════════════════════════════ */

function useVisible(ref: React.RefObject<HTMLElement | null>, t = 0.12) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: t });
    o.observe(el);
    return () => o.disconnect();
  }, [ref, t]);
  return v;
}

function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useVisible(ref);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0) scale(1)" : "translateY(30px) scale(0.97)", transition: `all 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function DiamondIcon({ children, bg = "#C17A56" }: { children: React.ReactNode; bg?: string }) {
  return (
    <div style={{ width: 44, height: 44, background: bg, transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
      <span style={{ transform: "rotate(-45deg)", fontSize: 18, color: "#fff" }}>{children}</span>
    </div>
  );
}

function DashboardMock() {
  return (
    <div style={{ background: "#2a2420", borderRadius: 2, border: "2px solid #c17a56", overflow: "hidden", boxShadow: "12px 12px 0 rgba(193,122,86,0.15)" }}>
      <div style={{ background: "#c17a56", padding: "6px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 2 }}>EDUINSIGHT</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>DASHBOARD</span>
      </div>
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { v: "6", l: "AT RISK", c: "#A63D2E" },
          { v: "68%", l: "AVG SCORE", c: "#D4956E" },
          { v: "92%", l: "COVERAGE", c: "#6B8E5C" },
        ].map((s) => (
          <div key={s.l} style={{ textAlign: "center", padding: 10, border: "1px solid rgba(193,122,86,0.25)" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 16px 14px" }}>
        {["Alex M. — CRITICAL", "Sarah J. — MEDIUM", "David L. — LOW"].map((s, i) => (
          <div key={s} style={{ padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(193,122,86,0.15)" : "none", fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'Courier New', monospace" }}>
            {s}
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
      <div style={{ minHeight: "100vh", background: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: "3px solid #e8dfd4", borderTopColor: "#C17A56", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#FAF6F0", minHeight: "100vh" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes decoSlide{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(193,122,86,0.3)}50%{box-shadow:0 0 0 12px rgba(193,122,86,0)}}
      `}</style>

      {/* ─── HERO ─── */}
      <section style={{ background: "linear-gradient(175deg, #3d3229 60%, #C17A56 100%)", position: "relative", overflow: "hidden" }}>
        {/* Decorative grid lines */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)", pointerEvents: "none" }} />
        
        <nav style={{ padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#C17A56", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(-45deg)" }}>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 14, fontWeight: 700, color: "#D4956E", letterSpacing: 4 }}>EDUINSIGHT</span>
          </div>
          <a href="/api/auth/login" style={{ textDecoration: "none", border: "2px solid #C17A56", color: "#D4956E", padding: "8px 20px", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
            Sign In →
          </a>
        </nav>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 48px 80px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center", position: "relative", zIndex: 2 }}>
          <div style={{ animation: "decoSlide 0.8s ease both" }}>
            <div style={{ width: 48, height: 3, background: "#C17A56", marginBottom: 24 }} />
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 56, lineHeight: 1.08, fontWeight: 700, color: "#FAF6F0", margin: "0 0 20px", letterSpacing: -1.5 }}>
              Decode Every<br />Misconception.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(250,246,240,0.55)", maxWidth: 460, marginBottom: 36 }}>
              AI-powered quiz analytics that reveal why students get answers wrong — not just that they did. Built on Google Classroom + Gemini.
            </p>
            <a href="/api/auth/login" style={{ textDecoration: "none", background: "#C17A56", color: "#fff", padding: "16px 32px", fontSize: 14, fontWeight: 700, letterSpacing: 1, display: "inline-block", transition: "all .2s" }}>
              GET STARTED FREE
            </a>
            <p style={{ fontSize: 10, color: "rgba(250,246,240,0.3)", marginTop: 14, letterSpacing: 1 }}>SECURE · READ-ONLY · SDG 4 ALIGNED</p>
          </div>
          <div style={{ animation: "decoSlide 1s ease both 0.3s", opacity: 0 }}>
            <DashboardMock />
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
        <Reveal>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: "#C17A56", marginBottom: 8 }}>SYSTEM CAPABILITIES</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, color: "#3d3229", margin: "0 0 12px" }}>Pedagogical Intelligence</h2>
          <p style={{ fontSize: 14, color: "#8a7d6f", maxWidth: 480, margin: "0 auto 48px" }}>Automated insights derived from psychometric analysis.</p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, background: "#e8dfd4" }}>
          {[
            { icon: "α", title: "Misconception Decoding", desc: "Our engine analyzes distractor choices to pinpoint exactly why a student failed." },
            { icon: "β", title: "Risk Stratification", desc: "Predictive modeling identifies students at risk before their grades reflect it." },
            { icon: "γ", title: "Curriculum Heatmaps", desc: "Visualize concept mastery across your entire district. Spot gaps instantaneously." },
          ].map((c, i) => (
            <Reveal key={c.icon} delay={i * 0.1}>
              <div style={{ background: "#FAF6F0", padding: "40px 28px", textAlign: "left", height: "100%" }}>
                <DiamondIcon>{c.icon}</DiamondIcon>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#3d3229", margin: "0 0 10px" }}>{c.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "#8a7d6f" }}>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── BENTO FEATURES ─── */}
      <section style={{ background: "#fff", borderTop: "2px solid #3d3229", borderBottom: "2px solid #3d3229" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}>
          <Reveal>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, color: "#3d3229", textAlign: "center", margin: "0 0 48px" }}>From Data to Pedagogy</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "#3d3229" }}>
            {[
              { title: "Misconception Analysis", desc: "AI identifies patterns in incorrect answers to reveal root causes.", detail: "Q3 — 42% selected \"B\" → confusing area with perimeter" },
              { title: "Risk Stratification", desc: "Instantly see who is falling behind.", detail: "Alex M. ▸ CRITICAL · Sarah J. ▸ AT RISK · David L. ▸ ON TRACK" },
              { title: "Concept Heatmap", desc: "Visualize performance across topic clusters.", detail: null },
              { title: "Intervention Plans", desc: "Generated lesson plans and grouping strategies.", detail: "\"Group A needs a refresher on quadratic factoring.\"" },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <div style={{ background: "#FAF6F0", padding: "36px 28px", height: "100%" }}>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#3d3229", margin: "0 0 8px" }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "#8a7d6f", lineHeight: 1.6, marginBottom: f.detail ? 16 : 0 }}>{f.desc}</p>
                  {f.detail && i !== 2 && (
                    <div style={{ background: "#fff", border: "1px solid #e8dfd4", padding: "10px 14px", fontFamily: "'Courier New', monospace", fontSize: 11, color: "#5a5048", lineHeight: 1.6 }}>
                      {f.detail}
                    </div>
                  )}
                  {i === 2 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3, marginTop: 16 }}>
                      {["#7a9e5c","#8aab64","#6b8e4e","#c9a96e","#c47a4a","#7a9e5c","#8aab64","#a8c27a","#c47a4a","#9ab86c"].map((c, j) => (
                        <div key={j} style={{ aspectRatio: "1", borderRadius: 2, background: c }} />
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, color: "#3d3229", fontStyle: "italic", margin: "0 0 48px" }}>Workflow Integration</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { n: "01", title: "CONNECT CLASSROOM", desc: "Sync rosters and quizzes with secure OAuth." },
            { n: "02", title: "AUTOMATED SCAN", desc: "Engine maps answers against misconception patterns." },
            { n: "03", title: "ACTIONABLE INSIGHTS", desc: "Grouped cohorts with reteaching strategies." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div style={{ background: "#3d3229", padding: "36px 24px", textAlign: "left", position: "relative", borderTop: "3px solid #C17A56" }}>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 48, fontWeight: 700, color: "rgba(193,122,86,0.12)", position: "absolute", top: 10, right: 16 }}>{s.n}</span>
                <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.5, color: "#D4956E", margin: "0 0 12px" }}>{s.title}</h4>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.5)", margin: 0 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ background: "#3d3229", borderTop: "3px solid #C17A56", padding: "80px 48px", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, color: "#FAF6F0", margin: "0 0 16px" }}>Ready to decode your classroom?</h2>
          <p style={{ fontSize: 14, color: "rgba(250,246,240,0.5)", marginBottom: 32 }}>AI-powered quiz analytics for every teacher.</p>
          <a href="/api/auth/login" style={{ textDecoration: "none", border: "2px solid #C17A56", background: "#C17A56", color: "#fff", padding: "16px 36px", fontSize: 14, fontWeight: 700, letterSpacing: 1, display: "inline-block" }}>
            GET STARTED WITH GOOGLE
          </a>
          <p style={{ fontSize: 10, color: "rgba(250,246,240,0.3)", marginTop: 20, letterSpacing: 1.5 }}>SDG 4 · QUALITY EDUCATION · KITAHACK 2026 · GEMINI AI</p>
        </Reveal>
      </section>
    </div>
  );
}
