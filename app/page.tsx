"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════
   RENDITION 2 — Geometric / Art Deco (Refined)
   Direction: Structured grids, angular card borders, bold geometric
   accents, slab-serif headlines, copper/cream/charcoal palette,
   decorative border patterns, staggered entrance animations,
   smooth hero-to-content transition, equal-size workflow cards.
   ═══════════════════════════════════════════════════════════════════ */

const COPPER = "#C17A56";
const COPPER_LIGHT = "#D4956E";
const CHARCOAL = "#3d3229";
const CREAM = "#FAF6F0";
const MUTED = "#8a7d6f";
const BORDER = "#e8dfd4";

function useVisible(ref: React.RefObject<HTMLElement | null>, threshold = 0.12) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setV(true); },
      { threshold },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [ref, threshold]);
  return v;
}

function useParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setOffset(window.scrollY * speed);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return offset;
}

type RevealVariant = "fade-up" | "fade-left" | "fade-right" | "scale" | "fade";

function Reveal({
  children,
  delay = 0,
  variant = "fade-up",
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: RevealVariant;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useVisible(ref);

  const transforms: Record<RevealVariant, string> = {
    "fade-up": "translateY(36px)",
    "fade-left": "translateX(-36px)",
    "fade-right": "translateX(36px)",
    scale: "scale(0.92)",
    fade: "none",
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "none" : transforms[variant],
        transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function DiamondIcon({ children, bg = COPPER }: { children: React.ReactNode; bg?: string }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        background: bg,
        transform: "rotate(45deg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        transition: "transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease",
      }}
    >
      <span style={{ transform: "rotate(-45deg)", fontSize: 18, color: "#fff", fontWeight: 700 }}>
        {children}
      </span>
    </div>
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const vis = useVisible(ref as React.RefObject<HTMLElement | null>);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!vis) return;
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [vis, target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

function DashboardMock() {
  const [hoveredRow, setHoveredRow] = useState(-1);

  return (
    <div
      style={{
        background: "#2a2420",
        borderRadius: 2,
        border: `2px solid ${COPPER}`,
        overflow: "hidden",
        boxShadow: "12px 12px 0 rgba(193,122,86,0.15)",
        transition: "box-shadow 0.5s ease, transform 0.5s ease",
      }}
    >
      <div
        style={{
          background: COPPER,
          padding: "6px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 2,
          }}
        >
          EDUINSIGHT
        </span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>DASHBOARD</span>
      </div>

      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { v: "6", l: "AT RISK", c: "#A63D2E" },
          { v: "68%", l: "AVG SCORE", c: COPPER_LIGHT },
          { v: "92%", l: "COVERAGE", c: "#6B8E5C" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              textAlign: "center",
              padding: 10,
              border: "1px solid rgba(193,122,86,0.25)",
              transition: "border-color 0.3s ease",
            }}
          >
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 20,
                fontWeight: 700,
                color: s.c,
              }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: 1.5,
                marginTop: 4,
              }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px 14px" }}>
        {["Alex M. — CRITICAL", "Sarah J. — MEDIUM", "David L. — LOW"].map((s, i) => (
          <div
            key={s}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(-1)}
            style={{
              padding: "6px 0",
              borderBottom: i < 2 ? "1px solid rgba(193,122,86,0.15)" : "none",
              fontSize: 11,
              color: hoveredRow === i ? COPPER_LIGHT : "rgba(255,255,255,0.5)",
              fontFamily: "'Courier New', monospace",
              transition: "color 0.25s ease, padding-left 0.25s ease",
              paddingLeft: hoveredRow === i ? 6 : 0,
            }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function TypewriterText({ text, speed = 40 }: { text: string; speed?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const vis = useVisible(ref as React.RefObject<HTMLElement | null>);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!vis) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [vis, text, speed]);

  return (
    <span ref={ref}>
      {displayed}
      {displayed.length < text.length && (
        <span style={{ opacity: 0.6, animation: "blink 0.8s step-end infinite" }}>|</span>
      )}
    </span>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const parallaxY = useParallax(0.15);

  const handleNavHover = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    target.style.background = "rgba(193,122,86,0.12)";
  }, []);

  const handleNavLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    target.style.background = "transparent";
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        const authRes = await fetch("/api/auth/status", { cache: "no-store" });
        const authData = (await authRes.json()) as { authenticated: boolean };
        if (!authData.authenticated) {
          setChecking(false);
          return;
        }
        const bootstrapRes = await fetch("/api/bootstrap/status", { cache: "no-store" });
        if (!bootstrapRes.ok) {
          router.replace("/dashboard");
          return;
        }
        const bootstrapData = (await bootstrapRes.json()) as { hasInitialSync: boolean };
        router.replace(bootstrapData.hasInitialSync ? "/dashboard" : "/onboarding/integrations");
      } catch {
        setChecking(false);
      }
    }
    void checkSession();
  }, [router]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: CREAM,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            border: `3px solid ${BORDER}`,
            borderTopColor: COPPER,
            borderRadius: "50%",
            animation: "spin .7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: CREAM, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes decoSlide { from { opacity: 0; transform: translateX(-40px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(193,122,86,0.3) } 50% { box-shadow: 0 0 0 12px rgba(193,122,86,0) } }
        @keyframes blink { 50% { opacity: 0 } }
        @keyframes shimmer {
          0% { background-position: -200% 0 }
          100% { background-position: 200% 0 }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-6px) }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.04 }
          50% { opacity: 0.07 }
        }
      `}</style>

      {/* ─── HERO ─── */}
      <section
        style={{
          background: `linear-gradient(175deg, ${CHARCOAL} 0%, #4a3d33 55%, ${COPPER} 85%, ${COPPER_LIGHT} 100%)`,
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        {/* Decorative grid lines with subtle pulse */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)",
            pointerEvents: "none",
            animation: "gridPulse 6s ease-in-out infinite",
          }}
        />

        {/* Radial glow accent behind dashboard mock */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "8%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(193,122,86,0.12) 0%, transparent 70%)`,
            pointerEvents: "none",
            transform: `translateY(${parallaxY * 0.5}px)`,
          }}
        />

        {/* Diagonal decorative line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "40%",
            width: 1,
            height: "120%",
            background: "rgba(193,122,86,0.08)",
            transform: "rotate(15deg)",
            transformOrigin: "top center",
            pointerEvents: "none",
          }}
        />

        <nav
          style={{
            padding: "20px 48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 1200,
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: COPPER,
                transform: "rotate(45deg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.4s ease",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: "rotate(-45deg)" }}
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 14,
                fontWeight: 700,
                color: COPPER_LIGHT,
                letterSpacing: 4,
              }}
            >
              EDUINSIGHT
            </span>
          </div>
          <a
            href="/api/auth/login"
            onMouseEnter={handleNavHover}
            onMouseLeave={handleNavLeave}
            style={{
              textDecoration: "none",
              border: `2px solid ${COPPER}`,
              color: COPPER_LIGHT,
              padding: "8px 20px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              transition: "all 0.3s ease",
              background: "transparent",
            }}
          >
            Sign In →
          </a>
        </nav>

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "60px 48px 100px",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 60,
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ animation: "decoSlide 0.8s ease both" }}>
            <div style={{ width: 48, height: 3, background: COPPER, marginBottom: 24 }} />
            <h1
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 56,
                lineHeight: 1.08,
                fontWeight: 700,
                color: CREAM,
                margin: "0 0 20px",
                letterSpacing: -1.5,
              }}
            >
              Stop Guessing,
              <br />
              Start{"\u00A0"}Understanding.
            </h1>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.75,
                color: "rgba(250,246,240,0.55)",
                maxWidth: 460,
                marginBottom: 36,
              }}
            >
              AI-powered quiz analytics that decode quiz misconceptions, stratify student risk
              and generate actionable teaching interventions, all from your Google Classroom data.
            </p>
            <a
              href="/api/auth/login"
              style={{
                textDecoration: "none",
                background: COPPER,
                color: "#fff",
                padding: "16px 32px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1,
                display: "inline-block",
                transition: "all 0.3s ease",
                animation: "pulse 3s ease infinite",
              }}
            >
              GET STARTED FREE
            </a>
            <p
              style={{
                fontSize: 12,
                color: "rgba(250,246,240,0.56)",
                marginTop: 14,
                letterSpacing: 1,
                fontWeight: 600,
              }}
            >
              SECURE · READ-ONLY · SDG 4 ALIGNED
            </p>
          </div>
          <div
            style={{
              animation: "decoSlide 1s ease both 0.3s",
              opacity: 0,
              transform: `translateY(${parallaxY * -0.3}px)`,
            }}
          >
            <DashboardMock />
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─── */}
      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}
      >
        <Reveal>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 4,
              color: COPPER,
              marginBottom: 8,
            }}
          >
            SYSTEM CAPABILITIES
          </p>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 38,
              color: CHARCOAL,
              margin: "0 0 12px",
            }}
          >
            Pedagogical Intelligence
          </h2>
          <p
            style={{
              fontSize: 14,
              color: MUTED,
              maxWidth: 480,
              margin: "0 auto 48px",
            }}
          >
            Automated insights derived from psychometric analysis.
          </p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, background: BORDER }}>
          {[
            {
              icon: "α",
              title: "Misconception Decoding",
              desc: "Our engine analyzes distractor choices to pinpoint exactly why a student failed — surfaced through detailed bar chart breakdowns.",
            },
            {
              icon: "β",
              title: "Risk Stratification",
              desc: "Donut-chart visualization classifies students by risk level so you can prioritize intervention before grades slip.",
            },
            {
              icon: "γ",
              title: "Performance Analytics",
              desc: "Track score trends over time with line charts and see concept mastery distributions at a glance.",
            },
          ].map((c, i) => (
            <Reveal key={c.icon} delay={i * 0.12}>
              <div
                style={{
                  background: CREAM,
                  padding: "40px 28px",
                  textAlign: "left",
                  height: "100%",
                  transition: "background 0.35s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = CREAM;
                }}
              >
                <DiamondIcon>{c.icon}</DiamondIcon>
                <h3
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 20,
                    color: CHARCOAL,
                    margin: "0 0 10px",
                  }}
                >
                  {c.title}
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED }}>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── BENTO FEATURES ─── */}
      <section style={{ background: "#fff", borderTop: `2px solid ${CHARCOAL}`, borderBottom: `2px solid ${CHARCOAL}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}>
          <Reveal>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 38,
                color: CHARCOAL,
                textAlign: "center",
                margin: "0 0 48px",
              }}
            >
              From Data to Pedagogy
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: CHARCOAL }}>
            {[
              {
                title: "Misconception Analysis",
                desc: "AI identifies patterns in incorrect answers to reveal root causes — displayed as detailed horizontal bar charts ranking each error type.",
                detail: "Q3 — 42% selected \"B\" → confusing area with perimeter",
                variant: "fade-left" as RevealVariant,
              },
              {
                title: "Risk Stratification",
                desc: "Donut chart instantly shows who is falling behind, grouped by severity.",
                detail: "Alex M. ▸ CRITICAL · Sarah J. ▸ AT RISK · David L. ▸ ON TRACK",
                variant: "fade-right" as RevealVariant,
              },
              {
                title: "Score Trend Tracking",
                desc: "Line chart tracks class performance across quizzes over time, highlighting improvement trajectories.",
                detail: null,
                variant: "fade-left" as RevealVariant,
              },
              {
                title: "Intervention Plans",
                desc: "Generated lesson plans and grouping strategies powered by Gemini AI.",
                detail: "\"Group A needs a refresher on quadratic factoring.\"",
                variant: "fade-right" as RevealVariant,
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1} variant={f.variant}>
                <div
                  style={{
                    background: CREAM,
                    padding: "36px 28px",
                    height: "100%",
                    transition: "background 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = CREAM;
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 20,
                      color: CHARCOAL,
                      margin: "0 0 8px",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: MUTED,
                      lineHeight: 1.6,
                      marginBottom: f.detail ? 16 : 0,
                    }}
                  >
                    {f.desc}
                  </p>
                  {f.detail && (
                    <div
                      style={{
                        background: "#fff",
                        border: `1px solid ${BORDER}`,
                        padding: "10px 14px",
                        fontFamily: "'Courier New', monospace",
                        fontSize: 11,
                        color: "#5a5048",
                        lineHeight: 1.6,
                      }}
                    >
                      {f.detail}
                    </div>
                  )}
                  {i === 2 && (
                    <div style={{ marginTop: 16, position: "relative", height: 56 }}>
                      <svg
                        viewBox="0 0 200 50"
                        style={{ width: "100%", height: "100%" }}
                        fill="none"
                      >
                        <polyline
                          points="0,40 40,35 80,28 120,18 160,22 200,10"
                          stroke={COPPER}
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points="0,40 40,35 80,28 120,18 160,22 200,10"
                          stroke="none"
                          fill={`url(#trendGrad)`}
                        />
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COPPER} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={COPPER} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {[
                          [0, 40],
                          [40, 35],
                          [80, 28],
                          [120, 18],
                          [160, 22],
                          [200, 10],
                        ].map(([x, y], j) => (
                          <circle
                            key={j}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={COPPER}
                            style={{ animation: `floatUp 2s ease-in-out ${j * 0.2}s infinite` }}
                          />
                        ))}
                      </svg>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ─── */}
      <section style={{ background: CHARCOAL, padding: "48px 0" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 48px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 32,
            textAlign: "center",
          }}
        >
          {[
            { value: 92, suffix: "%", label: "Topic Coverage" },
            { value: 3, suffix: "s", label: "Analysis Speed" },
            { value: 40, suffix: "+", label: "Error Types Detected" },
            { value: 100, suffix: "%", label: "Read-Only Access" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} variant="scale">
              <div>
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 36,
                    fontWeight: 700,
                    color: COPPER_LIGHT,
                    marginBottom: 6,
                  }}
                >
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(250,246,240,0.4)", letterSpacing: 2 }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section
        style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}
      >
        <Reveal>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 38,
              color: CHARCOAL,
              fontStyle: "italic",
              margin: "0 0 48px",
            }}
          >
            Workflow Integration
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            {
              n: "01",
              title: "CONNECT CLASSROOM",
              desc: "Sync rosters and quizzes with secure OAuth.",
            },
            {
              n: "02",
              title: "AUTOMATED SCAN",
              desc: "Engine maps answers against misconception patterns.",
            },
            {
              n: "03",
              title: "ACTIONABLE INSIGHTS",
              desc: "Grouped cohorts with reteaching strategies.",
            },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div
                style={{
                  background: CHARCOAL,
                  padding: "36px 28px",
                  textAlign: "left",
                  position: "relative",
                  borderTop: `3px solid ${COPPER}`,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.35s ease, box-shadow 0.35s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 48,
                    fontWeight: 700,
                    color: "rgba(193,122,86,0.12)",
                    position: "absolute",
                    top: 10,
                    right: 16,
                  }}
                >
                  {s.n}
                </span>
                <h4
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 2.5,
                    color: COPPER_LIGHT,
                    margin: "0 0 12px",
                  }}
                >
                  {s.title}
                </h4>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIAL / QUOTE ─── */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "40px 48px 80px",
          textAlign: "center",
        }}
      >
        <Reveal variant="scale">
          <div style={{ position: "relative" }}>
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 120,
                color: BORDER,
                position: "absolute",
                top: -50,
                left: -20,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              &ldquo;
            </span>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 22,
                lineHeight: 1.7,
                color: CHARCOAL,
                fontStyle: "italic",
                position: "relative",
                zIndex: 1,
              }}
            >
              <TypewriterText text='Now I know exactly which concepts my students struggle with — and I can fix it in the next lesson."' />
            </p>
            <div style={{ marginTop: 20 }}>
              <div style={{ width: 36, height: 1, background: COPPER, margin: "0 auto 12px" }} />
              <p style={{ fontSize: 12, color: MUTED, letterSpacing: 2 }}>
                DESIGNED FOR TEACHERS · POWERED BY GEMINI
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── CTA ─── */}
      <section
        style={{
          background: CHARCOAL,
          borderTop: `3px solid ${COPPER}`,
          padding: "80px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle geometric decoration */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            border: `2px solid rgba(193,122,86,0.08)`,
            transform: "rotate(45deg)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 140,
            height: 140,
            border: `2px solid rgba(193,122,86,0.06)`,
            transform: "rotate(45deg)",
            pointerEvents: "none",
          }}
        />

        <Reveal>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 34,
              color: CREAM,
              margin: "0 0 16px",
            }}
          >
            Ready to decode your classroom?
          </h2>
          <p style={{ fontSize: 14, color: "rgba(250,246,240,0.5)", marginBottom: 32 }}>
            AI-powered quiz analytics for every teacher.
          </p>
          <a
            href="/api/auth/login"
            style={{
              textDecoration: "none",
              border: `2px solid ${COPPER}`,
              background: COPPER,
              color: "#fff",
              padding: "16px 36px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1,
              display: "inline-block",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = COPPER_LIGHT;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COPPER;
              e.currentTarget.style.color = "#fff";
            }}
          >
            GET STARTED WITH GOOGLE
          </a>
          <p
            style={{
              fontSize: 10,
              color: "rgba(250,246,240,0.3)",
              marginTop: 20,
              letterSpacing: 1.5,
            }}
          >
            SDG 4 · QUALITY EDUCATION · KITAHACK 2026 · GEMINI AI
          </p>
        </Reveal>
      </section>
    </div>
  );
}
