"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   RENDITION 1 — Editorial / Magazine
   Direction: Clean serif headlines, generous whitespace, asymmetric
   hero with a floating product mock, scroll-triggered reveal sections,
   muted warm palette with sharp terracotta accents.
   ═══════════════════════════════════════════════════════════════════ */

function useOnScreen(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const vis = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function ProductMock() {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8dfd4", boxShadow: "0 20px 60px rgba(61,50,41,0.10)", overflow: "hidden", width: "100%", maxWidth: 520 }}>
      <div style={{ background: "#f5f0e9", padding: "8px 14px", display: "flex", gap: 6, alignItems: "center", borderBottom: "1px solid #e8dfd4" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4956e" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8dfd4" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8dfd4" }} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#b5aa9c", letterSpacing: 1 }}>EduInsight AI — Dashboard</span>
      </div>
      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "At-Risk", value: "6", color: "#A63D2E", bg: "#FDECEA" },
          { label: "Avg Score", value: "68%", color: "#8B6914", bg: "#FEF8E7" },
          { label: "Concepts", value: "12", color: "#3D7A2E", bg: "#E9F3E5" },
        ].map((s) => (
          <div key={s.label} style={{ padding: 14, borderRadius: 8, background: s.bg, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: s.color, opacity: 0.7, marginTop: 2, letterSpacing: 0.8, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ height: 8, borderRadius: 4, background: "#f0ece5", overflow: "hidden", marginBottom: 6 }}>
          <div style={{ width: "72%", height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #C17A56, #D4956E)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#b5aa9c" }}>
          <span>Concept Mastery</span><span>72%</span>
        </div>
      </div>
      <div style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}>
        {["Alex M.", "Sarah J.", "David L."].map((name, i) => (
          <div key={name} style={{ flex: 1, padding: "8px 10px", borderRadius: 6, background: "#fcf8f3", border: "1px solid #f0ece5", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
            <span style={{ color: "#5a5048" }}>{name}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3,
              background: i === 0 ? "#FDECEA" : i === 1 ? "#FEF8E7" : "#E9F3E5",
              color: i === 0 ? "#A63D2E" : i === 1 ? "#8B6914" : "#3D7A2E",
            }}>
              {i === 0 ? "CRITICAL" : i === 1 ? "AT RISK" : "ON TRACK"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapMock() {
  const colors = ["#7a9e5c", "#8aab64", "#6b8e4e", "#c9a96e", "#c47a4a", "#7a9e5c", "#8aab64", "#a8c27a", "#c47a4a", "#9ab86c"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, width: "fit-content" }}>
      {colors.map((c, i) => (
        <div key={i} style={{ width: 36, height: 36, borderRadius: 4, background: c, opacity: 0.85 }} />
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
      <div style={{ minHeight: "100vh", background: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "3px solid #e8dfd4", borderTopColor: "#C17A56", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#FAF6F0", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* ──── NAV ──── */}
      <nav style={{ padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C17A56", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#3d3229" }}>EduInsight</span>
        </div>
        <a href="/api/auth/login" style={{ textDecoration: "none", background: "#C17A56", color: "#fff", padding: "9px 22px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
          Sign in with Google
        </a>
      </nav>

      {/* ──── HERO ──── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 48px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        <div style={{ animation: "fadeSlideUp 0.8s ease both" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#C17A56", marginBottom: 16 }}>Classroom Intelligence Platform</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 52, lineHeight: 1.12, fontWeight: 700, color: "#3d3229", margin: "0 0 20px", letterSpacing: -1 }}>
            Stop guessing.<br />Start understanding<br />every student.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#8a7d6f", maxWidth: 440, marginBottom: 32 }}>
            EduInsight uses Gemini AI to decode quiz misconceptions, stratify student risk,
            and generate actionable teaching interventions — all from your Google Classroom data.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/api/auth/login" style={{ textDecoration: "none", background: "#C17A56", color: "#fff", padding: "14px 28px", borderRadius: 8, fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8, transition: "background .2s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Get Started Free
            </a>
          </div>
          <p style={{ fontSize: 11, color: "#b5aa9c", marginTop: 14 }}>Read-only access · No data stored externally · SDG 4 aligned</p>
        </div>
        <div style={{ animation: "floatUp 4s ease-in-out infinite, fadeSlideUp 1s ease both 0.3s" }}>
          <ProductMock />
        </div>
      </section>

      {/* ──── SYSTEM CAPABILITIES ──── */}
      <section style={{ background: "#fff", borderTop: "1px solid #e8dfd4", borderBottom: "1px solid #e8dfd4" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
          <Section>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#C17A56", marginBottom: 8 }}>System Capabilities</p>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 40, color: "#3d3229", margin: "0 0 12px", letterSpacing: -0.5 }}>Pedagogical Intelligence</h2>
            <p style={{ fontSize: 15, color: "#8a7d6f", maxWidth: 520, margin: "0 auto 48px" }}>Automated insights derived from psychometric analysis of student quiz responses.</p>
          </Section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { tag: "α.", title: "Misconception Decoding", desc: "We don't just grade right or wrong. Our engine analyzes distractor choices to pinpoint exactly why a student failed." },
              { tag: "β.", title: "Risk Stratification", desc: "Predictive modeling identifies students at risk of falling behind three weeks before their grades reflect it." },
              { tag: "γ.", title: "Curriculum Heatmaps", desc: "Visualize concept mastery across your entire class. Spot systemic gaps in instruction instantaneously." },
            ].map((card, i) => (
              <Section key={card.tag} delay={i * 0.12}>
                <div style={{ background: "#FAF6F0", border: "1px solid #e8dfd4", borderRadius: 10, padding: "32px 28px", textAlign: "left", height: "100%" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#C17A56", fontWeight: 700 }}>{card.tag}</span>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#3d3229", margin: "16px 0 10px", fontWeight: 700 }}>{card.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "#8a7d6f", margin: 0 }}>{card.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ──── FROM DATA TO PEDAGOGY ──── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 40, color: "#3d3229", margin: "0 0 12px", letterSpacing: -0.5 }}>From Data to Pedagogy</h2>
            <p style={{ fontSize: 15, color: "#8a7d6f", maxWidth: 540, margin: "0 auto" }}>EduInsight doesn&apos;t just grade. It understands why a student got the answer wrong.</p>
          </div>
        </Section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Misconception Analysis */}
          <Section delay={0.1}>
            <div style={{ background: "#fff", border: "1px solid #e8dfd4", borderRadius: 12, padding: 28, height: "100%" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#FEF8E7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 16 }}>⊙</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#3d3229", margin: "0 0 8px" }}>Misconception Analysis</h3>
              <p style={{ fontSize: 13, color: "#8a7d6f", marginBottom: 18, lineHeight: 1.6 }}>AI identifies patterns in incorrect answers to reveal the root cause of misunderstanding.</p>
              <div style={{ background: "#fcf8f3", border: "1px solid #f0ece5", borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: "#C17A56", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4 }}>Q3</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#3d3229", margin: 0 }}>Common Error: 42% selected &quot;B&quot;</p>
                  <p style={{ fontSize: 11, color: "#b5aa9c", margin: "2px 0 0" }}>Students are confusing area with perimeter.</p>
                </div>
              </div>
            </div>
          </Section>
          {/* Student Risk Stratification */}
          <Section delay={0.2}>
            <div style={{ background: "#fff", border: "1px solid #e8dfd4", borderRadius: 12, padding: 28, height: "100%" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#FDECEA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 16 }}>⟁</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#3d3229", margin: "0 0 8px" }}>Student Risk Stratification</h3>
              <p style={{ fontSize: 13, color: "#8a7d6f", marginBottom: 18, lineHeight: 1.6 }}>Instantly see who is falling behind before the test.</p>
              {[
                { name: "Alex M.", badge: "CRITICAL", bg: "#FDECEA", color: "#A63D2E" },
                { name: "Sarah J.", badge: "AT RISK", bg: "#FEF8E7", color: "#8B6914" },
                { name: "David L.", badge: "ON TRACK", bg: "#E9F3E5", color: "#3D7A2E" },
              ].map((s) => (
                <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0ece5" }}>
                  <span style={{ fontSize: 14, color: "#3d3229" }}>{s.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: s.bg, color: s.color }}>{s.badge}</span>
                </div>
              ))}
            </div>
          </Section>
          {/* Concept Heatmap */}
          <Section delay={0.3}>
            <div style={{ background: "#fff", border: "1px solid #e8dfd4", borderRadius: 12, padding: 28, height: "100%" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#E9F3E5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 16 }}>▦</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#3d3229", margin: "0 0 8px" }}>Concept Heatmap</h3>
              <p style={{ fontSize: 13, color: "#8a7d6f", marginBottom: 18, lineHeight: 1.6 }}>Visualize class performance across different topic clusters.</p>
              <HeatmapMock />
            </div>
          </Section>
          {/* Intervention Recommendations */}
          <Section delay={0.4}>
            <div style={{ background: "#fff", border: "1px solid #e8dfd4", borderRadius: 12, padding: 28, height: "100%" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#FEF4E5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 16 }}>✎</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#3d3229", margin: "0 0 8px" }}>Intervention Recommendations</h3>
              <p style={{ fontSize: 13, color: "#8a7d6f", marginBottom: 18, lineHeight: 1.6 }}>Get generated lesson plans and grouping strategies to address gaps.</p>
              <div style={{ background: "#fcf8f3", borderLeft: "3px solid #C17A56", borderRadius: "0 8px 8px 0", padding: "12px 14px" }}>
                <p style={{ fontSize: 12, fontStyle: "italic", color: "#5a5048", margin: 0, lineHeight: 1.6 }}>
                  &quot;Group A needs a refresher on quadratic factoring. Try the &apos;Tile Method&apos; activity.&quot;
                </p>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ──── WORKFLOW ──── */}
      <section style={{ background: "#fff", borderTop: "1px solid #e8dfd4", borderBottom: "1px solid #e8dfd4" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
          <Section>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 40, color: "#3d3229", margin: "0 0 12px", fontStyle: "italic", letterSpacing: -0.5 }}>Workflow Integration</h2>
          </Section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 48 }}>
            {[
              { step: "1", title: "CONNECT CLASSROOM", desc: "Sync your Google Classroom rosters and quizzes with a single secure OAuth authorization." },
              { step: "2", title: "AUTOMATED SCAN", desc: "Our engine parses quiz responses, mapping student answers against 12,000+ known misconception patterns." },
              { step: "3", title: "ACTIONABLE INSIGHTS", desc: "Receive a briefing document with grouped student cohorts and specific reteaching strategies." },
            ].map((item, i) => (
              <Section key={item.step} delay={i * 0.15}>
                <div style={{ background: "#3d3229", borderRadius: 12, padding: "36px 28px", textAlign: "left", position: "relative", overflow: "hidden", height: "100%" }}>
                  <span style={{ position: "absolute", top: 12, right: 16, fontFamily: "Georgia, serif", fontSize: 64, color: "rgba(255,255,255,0.06)", fontWeight: 700 }}>{item.step}</span>
                  <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#d4956e", marginBottom: 12 }}>{item.title}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.7)", margin: 0 }}>{item.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ──── FOOTER CTA ──── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
        <Section>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 36, color: "#3d3229", margin: "0 0 16px" }}>Ready to understand your classroom?</h2>
          <p style={{ fontSize: 15, color: "#8a7d6f", marginBottom: 32 }}>Join teachers using AI-powered quiz analytics to improve learning outcomes.</p>
          <a href="/api/auth/login" style={{ textDecoration: "none", background: "#C17A56", color: "#fff", padding: "16px 36px", borderRadius: 8, fontSize: 16, fontWeight: 600, display: "inline-block" }}>
            Get Started with Google
          </a>
          <p style={{ fontSize: 11, color: "#b5aa9c", marginTop: 24 }}>SDG 4 · Quality Education · KitaHack 2026 · Powered by Gemini</p>
        </Section>
      </section>
    </div>
  );
}
