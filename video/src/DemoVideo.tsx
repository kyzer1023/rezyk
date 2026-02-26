import {
  AbsoluteFill,
  Html5Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BRAND = "#C17A56";
const BG = "#FAF6F0";
const DARK = "#3A2E24";
const MUTED = "#8A7D6F";
const GREEN = "#6B8E5C";
const RED = "#A63D2E";
const BLUE = "#2B5E9E";

function FadeIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 80 } });
  return (
    <div style={{ opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px)` }}>
      {children}
    </div>
  );
}

function ScaleIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 100 } });
  return (
    <div style={{ opacity: interpolate(s, [0, 1], [0, 1]), transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})` }}>
      {children}
    </div>
  );
}

function FadeOut({ startFrame, duration, children }: { startFrame: number; duration: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const opacity = frame >= startFrame ? interpolate(frame, [startFrame, startFrame + duration], [1, 0], { extrapolateRight: "clamp" }) : 1;
  return <div style={{ opacity }}>{children}</div>;
}

function FloatingParticles() {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 8 }, (_, i) => ({
    x: 100 + (i * 230) % 1700,
    y: 100 + (i * 170) % 900,
    size: 4 + (i % 3) * 3,
    speed: 0.3 + (i % 4) * 0.15,
    offset: i * 40,
  }));

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y + Math.sin((frame + p.offset) * p.speed * 0.05) * 30,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `rgba(193, 122, 86, ${0.08 + (i % 3) * 0.04})`,
          }}
        />
      ))}
    </>
  );
}

function ProgressBar() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = (frame / durationInFrames) * 100;
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(0,0,0,0.05)", zIndex: 100 }}>
      <div style={{ height: "100%", width: `${progress}%`, background: BRAND, transition: "width 0.03s" }} />
    </div>
  );
}

function TitleScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({ frame, fps, config: { damping: 10, stiffness: 60 } });
  const pulseScale = 1 + Math.sin(frame * 0.06) * 0.03;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, #F5EDE3 0%, ${BG} 50%, #E8DDD0 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FloatingParticles />

      <ScaleIn>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${BRAND}, #A05E3A)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
            transform: `scale(${logoScale * pulseScale})`,
            boxShadow: "0 12px 40px rgba(193,122,86,0.3)",
          }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
      </ScaleIn>

      <FadeIn delay={12}>
        <h1 style={{ fontSize: 80, fontWeight: 800, color: DARK, margin: 0, letterSpacing: -2, textAlign: "center" }}>
          EduInsight AI
        </h1>
      </FadeIn>

      <FadeIn delay={25}>
        <p style={{ fontSize: 30, color: MUTED, marginTop: 16, textAlign: "center" }}>
          Smart Quiz Analytics for Google Classroom
        </p>
      </FadeIn>

      <FadeIn delay={45}>
        <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
          {[
            { label: "Gemini AI", icon: "✦" },
            { label: "Firebase", icon: "🔥" },
            { label: "Google Classroom", icon: "📚" },
          ].map((tech, i) => (
            <ScaleIn key={tech.label} delay={50 + i * 8}>
              <span
                style={{
                  padding: "12px 28px",
                  borderRadius: 40,
                  background: "rgba(193,122,86,0.08)",
                  border: "1px solid rgba(193,122,86,0.15)",
                  color: BRAND,
                  fontSize: 18,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{tech.icon}</span> {tech.label}
              </span>
            </ScaleIn>
          ))}
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

function ProblemScene() {
  const items = [
    { icon: "📊", text: "Quiz scores are too high-level for fast intervention", delay: 15 },
    { icon: "🔍", text: "Identifying concept-level learning gaps takes hours", delay: 45 },
    { icon: "⏳", text: "Manual analysis of each student's mistakes is not scalable", delay: 75 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #1A1410 0%, #2D221A 50%, #3D2E22 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 100,
      }}
    >
      <FadeIn>
        <h2 style={{ fontSize: 56, color: "#F5E6D6", fontWeight: 800, marginBottom: 56, textAlign: "center", letterSpacing: -1 }}>
          The Problem
        </h2>
      </FadeIn>
      <div style={{ display: "flex", flexDirection: "column", gap: 36, maxWidth: 900 }}>
        {items.map((item) => (
          <FadeIn key={item.text} delay={item.delay}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, background: "rgba(255,255,255,0.04)", padding: "20px 28px", borderRadius: 12, borderLeft: `4px solid ${BRAND}` }}>
              <span style={{ fontSize: 40 }}>{item.icon}</span>
              <p style={{ fontSize: 26, color: "#E8DDD0", margin: 0, lineHeight: 1.5 }}>{item.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function SolutionScene() {
  const steps = [
    { step: "1", title: "Sync", desc: "Import courses and quiz data from Google Classroom and Forms", color: BRAND, icon: "🔄", delay: 20 },
    { step: "2", title: "Analyze", desc: "Gemini AI classifies each error as conceptual, procedural, or careless", color: GREEN, icon: "🧠", delay: 45 },
    { step: "3", title: "Act", desc: "Get per-student interventions teachers can use right away", color: BLUE, icon: "🎯", delay: 70 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, #F5EDE3 0%, ${BG} 60%, #E8DDD0 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <FloatingParticles />
      <FadeIn>
        <h2 style={{ fontSize: 52, color: DARK, fontWeight: 800, marginBottom: 16, textAlign: "center", letterSpacing: -1 }}>
          Our Solution
        </h2>
        <p style={{ fontSize: 22, color: MUTED, textAlign: "center", maxWidth: 700, marginBottom: 56 }}>
          From quiz data to actionable insights in minutes, not hours
        </p>
      </FadeIn>

      <div style={{ display: "flex", gap: 36, justifyContent: "center" }}>
        {steps.map((item, i) => (
          <ScaleIn key={item.step} delay={item.delay}>
            <div
              style={{
                background: "#FFF",
                borderRadius: 20,
                padding: "44px 36px",
                width: 280,
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 44, display: "block", marginBottom: 16 }}>{item.icon}</span>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: item.color,
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  margin: "0 auto 16px",
                }}
              >
                {item.step}
              </div>
              <h3 style={{ fontSize: 26, color: DARK, margin: "0 0 10px", fontWeight: 800 }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: MUTED, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", right: -22, top: "50%", fontSize: 24, color: "#D6CBBF" }}>→</div>
              )}
            </div>
          </ScaleIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function ScreenshotScene({ src, label, caption }: { src: string; label: string; caption: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const imgSpring = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const imgScale = interpolate(imgSpring, [0, 1], [0.88, 1]);
  const imgY = interpolate(imgSpring, [0, 1], [40, 0]);
  const labelSpring = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 20 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #141210 0%, #1E1A16 50%, #28221C 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 56,
      }}
    >
      <div style={{ opacity: interpolate(labelSpring, [0, 1], [0, 1]), marginBottom: 8 }}>
        <span style={{ color: BRAND, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>
          {label}
        </span>
      </div>
      <FadeIn delay={8}>
        <h3 style={{ color: "#F5E6D6", fontSize: 30, fontWeight: 600, marginBottom: 28, textAlign: "center" }}>
          {caption}
        </h3>
      </FadeIn>
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
          transform: `scale(${imgScale}) translateY(${imgY}px)`,
          opacity: interpolate(imgSpring, [0, 1], [0, 1]),
          maxWidth: 1340,
          width: "100%",
        }}
      >
        <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
      </div>
    </AbsoluteFill>
  );
}

function FeaturesScene() {
  const features = [
    { title: "Misconception Detection", desc: "Classifies errors as conceptual, procedural, or careless", color: RED, icon: "🔬", delay: 12 },
    { title: "Risk Prioritization", desc: "Students ranked by severity for targeted intervention", color: BRAND, icon: "⚠️", delay: 28 },
    { title: "Knowledge Gap Mapping", desc: "Concept-level heatmap reveals class-wide weaknesses", color: BLUE, icon: "🗺️", delay: 44 },
    { title: "Actionable Interventions", desc: "AI-generated recommendations teachers can use immediately", color: GREEN, icon: "💡", delay: 60 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, #F5EDE3 0%, ${BG} 60%, #E8DDD0 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <FloatingParticles />
      <FadeIn>
        <h2 style={{ fontSize: 52, color: DARK, fontWeight: 800, marginBottom: 52, textAlign: "center", letterSpacing: -1 }}>
          Key Features
        </h2>
      </FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, maxWidth: 1000 }}>
        {features.map((f) => (
          <FadeIn key={f.title} delay={f.delay}>
            <div
              style={{
                background: "#FFF",
                borderRadius: 16,
                padding: "32px 28px",
                borderLeft: `5px solid ${f.color}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 32 }}>{f.icon}</span>
              <div>
                <h3 style={{ fontSize: 22, color: DARK, margin: "0 0 8px", fontWeight: 700 }}>{f.title}</h3>
                <p style={{ fontSize: 16, color: MUTED, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function ClosingScene() {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame * 0.04) * 0.015;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${BRAND} 0%, #9E5535 50%, #7A3E24 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ScaleIn>
        <div style={{ textAlign: "center", transform: `scale(${breathe})` }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 64, color: "#FFF", fontWeight: 800, marginBottom: 12, letterSpacing: -1 }}>
            EduInsight AI
          </h2>
        </div>
      </ScaleIn>

      <FadeIn delay={15}>
        <p style={{ fontSize: 28, color: "rgba(255,255,255,0.85)", marginBottom: 48, textAlign: "center" }}>
          Understand your classroom, one quiz at a time.
        </p>
      </FadeIn>

      <FadeIn delay={30}>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 44 }}>
          {["SDG 4: Quality Education", "KitaHack 2026", "Powered by Gemini"].map((tag) => (
            <span
              key={tag}
              style={{
                padding: "12px 28px",
                borderRadius: 28,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#FFF",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={50}>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
          github.com/kyzer1023/rezyk
        </p>
      </FadeIn>
    </AbsoluteFill>
  );
}

export const DemoVideo: React.FC = () => {
  const FPS = 30;
  const sec = (s: number) => Math.ceil(s * FPS);

  const scenes = [
    { dur: sec(11), comp: <TitleScene />, audio: "audio/s1-title.mp3" },
    { dur: sec(17), comp: <ProblemScene />, audio: "audio/s2-problem.mp3" },
    { dur: sec(29), comp: <SolutionScene />, audio: "audio/s3-solution.mp3" },
    { dur: sec(9), comp: <ScreenshotScene src="dashboard.png" label="Dashboard" caption="Real-time classroom overview at a glance" />, audio: "audio/s4-dashboard.mp3" },
    { dur: sec(8), comp: <ScreenshotScene src="courses.png" label="Google Classroom" caption="Courses synced directly from your Classroom" />, audio: "audio/s5-courses.mp3" },
    { dur: sec(13), comp: <ScreenshotScene src="insights.png" label="AI Analysis" caption="Gemini-powered class insights and risk distribution" />, audio: "audio/s6-insights.mp3" },
    { dur: sec(12), comp: <ScreenshotScene src="students.png" label="Student Tracking" caption="Per-student risk levels and misconception analysis" />, audio: "audio/s7-students.mp3" },
    { dur: sec(17), comp: <FeaturesScene />, audio: "audio/s8-features.mp3" },
    { dur: sec(12), comp: <ClosingScene />, audio: "audio/s9-closing.mp3" },
  ];

  let offset = 0;
  const sequences = scenes.map((scene, i) => {
    const from = offset;
    offset += scene.dur;
    return (
      <Sequence key={i} from={from} durationInFrames={scene.dur}>
        <FadeOut startFrame={scene.dur - 15} duration={15}>
          {scene.comp}
        </FadeOut>
        <Html5Audio src={staticFile(scene.audio)} volume={0.9} />
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif" }}>
      {sequences}
      <ProgressBar />
    </AbsoluteFill>
  );
};
