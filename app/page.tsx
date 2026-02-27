"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   RENDITION 3 — Organic / Natural
   Direction: Flowing blob shapes, soft sage/terracotta earth gradients,
   fully rounded corners, gentle breathing animations, layered depth,
   handwritten-style accent font vibe, nature-inspired warm tones.
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

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useVis(ref);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(28px)", transition: `all 0.8s cubic-bezier(.25,.46,.45,.94) ${delay}s` }}>
      {children}
    </div>
  );
}

function Blob({ color, size, top, left, blur = 120 }: { color: string; size: number; top: string; left: string; blur?: number }) {
  return (
    <div style={{
      position: "absolute", top, left, width: size, height: size,
      borderRadius: "50%", background: color, filter: `blur(${blur}px)`,
      pointerEvents: "none", opacity: 0.35,
    }} />
  );
}

function MockCard() {
  return (
    <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderRadius: 24, padding: 28, border: "1px solid rgba(193,122,86,0.12)", boxShadow: "0 24px 48px rgba(61,50,41,0.08)", maxWidth: 480, width: "100%" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Students", value: "32", bg: "linear-gradient(135deg, #e9f3e5, #d4e8cc)" },
          { label: "At Risk", value: "6", bg: "linear-gradient(135deg, #fdecea, #f8d4cc)" },
          { label: "Avg Score", value: "72%", bg: "linear-gradient(135deg, #fef8e7, #fceec8)" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, padding: "14px 12px", borderRadius: 16, background: s.bg, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#3d3229" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#8a7d6f", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { name: "Alex M.", risk: "Critical", c: "#A63D2E", bg: "#fdecea" },
          { name: "Sarah J.", risk: "At Risk", c: "#8B6914", bg: "#fef8e7" },
          { name: "David L.", risk: "On Track", c: "#3D7A2E", bg: "#e9f3e5" },
        ].map((s) => (
          <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderRadius: 12, background: "rgba(250,246,240,0.6)" }}>
            <span style={{ fontSize: 13, color: "#3d3229", fontWeight: 500 }}>{s.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.c }}>{s.risk}</span>
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
      <div style={{ minHeight: "100vh", background: "#f4f0e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "3px solid #e0d6ca", borderTopColor: "#6B8E5C", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f0e8", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        @keyframes gentleDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-12px)}}
      `}</style>

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <Blob color="#C17A56" size={500} top="-10%" left="65%" blur={150} />
        <Blob color="#6B8E5C" size={400} top="30%" left="-8%" blur={140} />
        <Blob color="#D4956E" size={300} top="60%" left="50%" blur={130} />

        <nav style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #C17A56, #6B8E5C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#3d3229" }}>EduInsight AI</span>
          </div>
          <a href="/api/auth/login" style={{ textDecoration: "none", background: "linear-gradient(135deg, #C17A56, #a96842)", color: "#fff", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 600 }}>
            Sign in with Google
          </a>
        </nav>

        <div style={{ flex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 48px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", position: "relative", zIndex: 2, width: "100%" }}>
          <div>
            <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, background: "rgba(107,142,92,0.12)", color: "#4a7340", fontSize: 12, fontWeight: 600, marginBottom: 20 }}>Powered by Gemini AI</span>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 50, lineHeight: 1.14, fontWeight: 700, color: "#3d3229", margin: "0 0 20px" }}>
              Nurture every learner with intelligent insights
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "#7a7064", maxWidth: 440, marginBottom: 32 }}>
              Transform quiz results into deep understanding of each student&apos;s learning journey.
              Discover misconceptions, identify at-risk learners, and grow your teaching impact.
            </p>
            <a href="/api/auth/login" style={{ textDecoration: "none", background: "linear-gradient(135deg, #6B8E5C, #4a7340)", color: "#fff", padding: "16px 32px", borderRadius: 28, fontSize: 15, fontWeight: 600, display: "inline-block", boxShadow: "0 8px 24px rgba(107,142,92,0.25)" }}>
              Start Your Journey →
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", animation: "gentleDrift 6s ease-in-out infinite" }}>
            <MockCard />
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
        <Fade>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#6B8E5C", textTransform: "uppercase" }}>System Capabilities</span>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, color: "#3d3229", margin: "8px 0 12px" }}>Pedagogical Intelligence</h2>
          <p style={{ fontSize: 15, color: "#8a7d6f", maxWidth: 480, margin: "0 auto 48px" }}>Automated insights derived from psychometric analysis.</p>
        </Fade>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { emoji: "🔬", title: "Misconception Decoding", desc: "Our engine analyzes distractor choices to pinpoint exactly why a student failed.", bg: "linear-gradient(135deg, #fef8e7, #fcf0d8)" },
            { emoji: "📊", title: "Risk Stratification", desc: "Predictive modeling identifies students at risk of falling behind before grades reflect it.", bg: "linear-gradient(135deg, #fdecea, #f8d4cc)" },
            { emoji: "🗺️", title: "Curriculum Heatmaps", desc: "Visualize concept mastery across your entire class. Spot systemic gaps instantaneously.", bg: "linear-gradient(135deg, #e9f3e5, #d8ebcf)" },
          ].map((c, i) => (
            <Fade key={c.title} delay={i * 0.12}>
              <div style={{ background: c.bg, borderRadius: 20, padding: "36px 28px", textAlign: "left", height: "100%", border: "1px solid rgba(0,0,0,0.04)" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 16 }}>{c.emoji}</span>
                <h3 style={{ fontSize: 19, color: "#3d3229", margin: "0 0 10px", fontWeight: 700 }}>{c.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "#7a7064", margin: 0 }}>{c.desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ─── FROM DATA TO PEDAGOGY ─── */}
      <section style={{ background: "rgba(255,255,255,0.5)", borderRadius: "40px 40px 0 0", marginTop: -20 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, color: "#3d3229", margin: "0 0 12px" }}>From Data to Pedagogy</h2>
              <p style={{ fontSize: 15, color: "#8a7d6f", maxWidth: 500, margin: "0 auto" }}>It understands why a student got the answer wrong.</p>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { title: "Misconception Analysis", desc: "AI identifies patterns in incorrect answers to reveal root causes.", icon: "⊙", detail: <div style={{ background: "#fcf8f3", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}><span style={{ background: "#C17A56", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 8 }}>Q3</span><div><p style={{ fontSize: 12, fontWeight: 600, color: "#3d3229", margin: 0 }}>42% selected &quot;B&quot;</p><p style={{ fontSize: 11, color: "#b5aa9c", margin: "2px 0 0" }}>Confusing area with perimeter</p></div></div> },
              { title: "Student Risk Stratification", desc: "Instantly see who is falling behind before the test.", icon: "⟁", detail: <div style={{ marginTop: 16, display: "flex", flexDirection: "column" as const, gap: 6 }}>{[{n:"Alex M.",b:"CRITICAL",bg:"#fdecea",c:"#A63D2E"},{n:"Sarah J.",b:"AT RISK",bg:"#fef8e7",c:"#8B6914"},{n:"David L.",b:"ON TRACK",bg:"#e9f3e5",c:"#3D7A2E"}].map(s=><div key={s.n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f0ece5"}}><span style={{fontSize:13,color:"#3d3229"}}>{s.n}</span><span style={{fontSize:9,fontWeight:700,padding:"3px 10px",borderRadius:12,background:s.bg,color:s.c}}>{s.b}</span></div>)}</div> },
              { title: "Concept Heatmap", desc: "Visualize class performance across topic clusters.", icon: "▦", detail: <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginTop: 16 }}>{["#7a9e5c","#8aab64","#6b8e4e","#c9a96e","#c47a4a","#7a9e5c","#8aab64","#a8c27a","#c47a4a","#9ab86c"].map((c,j)=><div key={j} style={{aspectRatio:"1",borderRadius:8,background:c,opacity:0.85}} />)}</div> },
              { title: "Intervention Recommendations", desc: "Generated lesson plans to address gaps.", icon: "✎", detail: <div style={{ background: "#fcf8f3", borderLeft: "3px solid #6B8E5C", borderRadius: "0 12px 12px 0", padding: "12px 14px", marginTop: 16 }}><p style={{ fontSize: 12, fontStyle: "italic", color: "#5a5048", margin: 0, lineHeight: 1.6 }}>&quot;Group A needs a refresher on quadratic factoring. Try the Tile Method activity.&quot;</p></div> },
            ].map((f, i) => (
              <Fade key={f.title} delay={i * 0.1}>
                <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid rgba(0,0,0,0.05)", height: "100%" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f4f0e8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 18, color: "#C17A56" }}>{f.icon}</div>
                  <h3 style={{ fontSize: 20, color: "#3d3229", margin: "0 0 6px", fontWeight: 700 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "#8a7d6f", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                  {f.detail}
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 36, color: "#3d3229", fontStyle: "italic", margin: "0 0 48px" }}>Workflow Integration</h2>
        </Fade>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { n: "1", title: "Connect Classroom", desc: "Sync rosters and quizzes with a single secure OAuth authorization.", gradient: "linear-gradient(135deg, #C17A56, #a96842)" },
            { n: "2", title: "Automated Scan", desc: "Our engine parses quiz responses, mapping against 12,000+ misconception patterns.", gradient: "linear-gradient(135deg, #8a7d6f, #6b6058)" },
            { n: "3", title: "Actionable Insights", desc: "Receive grouped student cohorts and specific reteaching strategies.", gradient: "linear-gradient(135deg, #6B8E5C, #4a7340)" },
          ].map((s, i) => (
            <Fade key={s.n} delay={i * 0.12}>
              <div style={{ background: s.gradient, borderRadius: 24, padding: "36px 28px", textAlign: "left", position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", top: 16, right: 20, fontSize: 64, fontWeight: 800, color: "rgba(255,255,255,0.08)" }}>{s.n}</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,0.9)", margin: "0 0 12px", textTransform: "uppercase" }}>{s.title}</h4>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.6)", margin: 0 }}>{s.desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ textAlign: "center", padding: "60px 48px 80px", position: "relative", overflow: "hidden" }}>
        <Blob color="#6B8E5C" size={300} top="20%" left="10%" blur={100} />
        <Blob color="#C17A56" size={250} top="10%" left="70%" blur={100} />
        <Fade>
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 36, color: "#3d3229", margin: "0 0 16px" }}>Begin your teaching evolution</h2>
            <p style={{ fontSize: 15, color: "#8a7d6f", marginBottom: 32 }}>Join teachers using AI to grow every student.</p>
            <a href="/api/auth/login" style={{ textDecoration: "none", background: "linear-gradient(135deg, #C17A56, #6B8E5C)", color: "#fff", padding: "16px 36px", borderRadius: 28, fontSize: 16, fontWeight: 600, display: "inline-block", boxShadow: "0 8px 32px rgba(107,142,92,0.2)" }}>
              Get Started with Google
            </a>
            <p style={{ fontSize: 11, color: "#b5aa9c", marginTop: 20 }}>SDG 4 · Quality Education · KitaHack 2026 · Gemini AI</p>
          </div>
        </Fade>
      </section>
    </div>
  );
}
