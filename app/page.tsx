"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   RENDITION 4 — Dark Luxury
   Direction: Deep charcoal/near-black, gold/amber accents, dramatic
   staggered entrance animations, glass-morphism cards, high contrast
   typography, radial gradient spotlights, editorial authority.
   ═══════════════════════════════════════════════════════════════════ */

function useVis(ref: React.RefObject<HTMLElement | null>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.12 });
    o.observe(el);
    return () => o.disconnect();
  }, [ref]);
  return v;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useVis(ref);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(40px)", transition: `all 0.75s cubic-bezier(.16,1,.3,1) ${delay}s` }}>
      {children}
    </div>
  );
}

const BG = "#141210";
const SURFACE = "#1c1a17";
const BORDER = "rgba(193,161,107,0.12)";
const GOLD = "#C1A16B";
const AMBER = "#D4956E";
const TEXT = "#E8E0D4";
const MUTED = "rgba(232,224,212,0.4)";

function GlassMock() {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, maxWidth: 480, width: "100%", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { v: "6", l: "At-Risk", c: "#E85D4A" },
          { v: "68%", l: "Avg Score", c: GOLD },
          { v: "12", l: "Concepts", c: "#6B8E5C" },
        ].map((s) => (
          <div key={s.l} style={{ flex: 1, padding: "14px 0", textAlign: "center", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.c, fontFamily: "Georgia, serif" }}>{s.v}</div>
            <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1.5, marginTop: 4, textTransform: "uppercase" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 16 }}>
        <div style={{ width: "72%", height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${GOLD}, ${AMBER})` }} />
      </div>
      {["Alex M. — Critical", "Sarah J. — At Risk", "David L. — On Track"].map((s, i) => (
        <div key={s} style={{ padding: "8px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none", fontSize: 12, color: "rgba(232,224,212,0.3)", fontFamily: "'Courier New', monospace" }}>
          {s}
        </div>
      ))}
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
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: `2px solid rgba(193,161,107,0.2)`, borderTopColor: GOLD, borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes heroGlow{0%,100%{opacity:0.15}50%{opacity:0.25}}
      `}</style>

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(193,161,107,0.08) 0%, transparent 70%)`, animation: "heroGlow 5s ease-in-out infinite", pointerEvents: "none" }} />

        <nav style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, border: `1.5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>EDUINSIGHT</span>
          </div>
          <a href="/api/auth/login" style={{ textDecoration: "none", border: `1.5px solid ${GOLD}`, color: GOLD, padding: "10px 24px", borderRadius: 6, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Sign In
          </a>
        </nav>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px 100px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center", position: "relative", zIndex: 2 }}>
          <div>
            <div style={{ width: 48, height: 2, background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginBottom: 28 }} />
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 56, lineHeight: 1.08, fontWeight: 700, color: TEXT, margin: "0 0 24px", letterSpacing: -1.5 }}>
              Intelligence for<br />every classroom.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: MUTED, maxWidth: 440, marginBottom: 36 }}>
              AI-powered quiz analytics that decode misconceptions, stratify risk, and generate
              actionable interventions — from your Google Classroom data.
            </p>
            <a href="/api/auth/login" style={{ textDecoration: "none", background: `linear-gradient(135deg, ${GOLD}, ${AMBER})`, color: BG, padding: "16px 32px", borderRadius: 8, fontSize: 15, fontWeight: 700, display: "inline-block", letterSpacing: 0.5 }}>
              Get Started Free →
            </a>
            <p style={{ fontSize: 10, color: "rgba(232,224,212,0.2)", marginTop: 16, letterSpacing: 1.5 }}>SECURE · READ-ONLY · SDG 4 ALIGNED</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GlassMock />
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─── */}
      <section style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: GOLD, marginBottom: 8 }}>SYSTEM CAPABILITIES</p>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, color: TEXT, margin: "0 0 48px" }}>Pedagogical Intelligence</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { tag: "α.", title: "Misconception Decoding", desc: "Analyzes distractor choices to pinpoint exactly why a student failed." },
              { tag: "β.", title: "Risk Stratification", desc: "Identifies students at risk of falling behind weeks before grades reflect it." },
              { tag: "γ.", title: "Curriculum Heatmaps", desc: "Visualize concept mastery across your class. Spot systemic gaps instantly." },
            ].map((c, i) => (
              <Reveal key={c.tag} delay={i * 0.12}>
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "36px 24px", textAlign: "left", height: "100%" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 22, color: GOLD, fontWeight: 700 }}>{c.tag}</span>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: TEXT, margin: "16px 0 10px" }}>{c.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: MUTED }}>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENTO ─── */}
      <section style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}>
          <Reveal>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, color: TEXT, textAlign: "center", margin: "0 0 48px" }}>From Data to Pedagogy</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { title: "Misconception Analysis", desc: "AI identifies patterns in incorrect answers to reveal root causes.", mock: <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}><span style={{ background: GOLD, color: BG, fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4 }}>Q3</span><span style={{ fontSize: 12, color: "rgba(232,224,212,0.5)" }}>42% selected &quot;B&quot; — confusing area with perimeter</span></div> },
              { title: "Risk Stratification", desc: "Instantly see who is falling behind.", mock: <div style={{ marginTop: 16 }}>{[{n:"Alex M.",b:"CRITICAL",c:"#E85D4A"},{n:"Sarah J.",b:"AT RISK",c:GOLD},{n:"David L.",b:"ON TRACK",c:"#6B8E5C"}].map(s=><div key={s.n} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${BORDER}`}}><span style={{fontSize:13,color:TEXT}}>{s.n}</span><span style={{fontSize:9,fontWeight:700,padding:"3px 10px",borderRadius:4,border:`1px solid ${s.c}`,color:s.c}}>{s.b}</span></div>)}</div> },
              { title: "Concept Heatmap", desc: "Visualize class performance across topic clusters.", mock: <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4, marginTop: 16 }}>{["#6B8E5C","#7a9e5c","#5a7d4a","#C1A16B","#C17A56","#6B8E5C","#7a9e5c","#8aab64","#C17A56","#8aab64"].map((c,j)=><div key={j} style={{aspectRatio:"1",borderRadius:4,background:c,opacity:0.7}} />)}</div> },
              { title: "Intervention Plans", desc: "Generated lesson plans and grouping strategies.", mock: <div style={{ background: "rgba(255,255,255,0.02)", borderLeft: `2px solid ${GOLD}`, borderRadius: "0 8px 8px 0", padding: "12px 14px", marginTop: 16 }}><p style={{ fontSize: 12, fontStyle: "italic", color: "rgba(232,224,212,0.5)", margin: 0, lineHeight: 1.6 }}>&quot;Group A needs a refresher on quadratic factoring.&quot;</p></div> },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28, height: "100%" }}>
                  <h3 style={{ fontSize: 20, color: TEXT, margin: "0 0 6px", fontWeight: 700 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{f.desc}</p>
                  {f.mock}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 36, color: TEXT, fontStyle: "italic", margin: "0 0 48px" }}>Workflow Integration</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { n: "01", title: "CONNECT CLASSROOM", desc: "Sync rosters and quizzes via OAuth." },
              { n: "02", title: "AUTOMATED SCAN", desc: "Engine maps answers against misconception patterns." },
              { n: "03", title: "ACTIONABLE INSIGHTS", desc: "Grouped cohorts with reteaching strategies." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.12}>
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 24px", textAlign: "left", position: "relative", borderTop: `2px solid ${GOLD}` }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: "rgba(193,161,107,0.06)", position: "absolute", top: 12, right: 16, fontFamily: "'Courier New', monospace" }}>{s.n}</span>
                  <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: GOLD, margin: "0 0 12px" }}>{s.title}</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED, margin: 0 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ borderTop: `1px solid ${BORDER}`, padding: "80px 48px", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 36, color: TEXT, margin: "0 0 16px" }}>Ready to elevate your teaching?</h2>
          <p style={{ fontSize: 15, color: MUTED, marginBottom: 32 }}>Join educators using AI-powered analytics.</p>
          <a href="/api/auth/login" style={{ textDecoration: "none", background: `linear-gradient(135deg, ${GOLD}, ${AMBER})`, color: BG, padding: "16px 40px", borderRadius: 8, fontSize: 16, fontWeight: 700, display: "inline-block" }}>
            Get Started with Google
          </a>
          <p style={{ fontSize: 10, color: "rgba(232,224,212,0.15)", marginTop: 24, letterSpacing: 2 }}>SDG 4 · QUALITY EDUCATION · KITAHACK 2026 · GEMINI AI</p>
        </Reveal>
      </section>
    </div>
  );
}
