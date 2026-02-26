"use client";

import Link from "next/link";
import { useState } from "react";
import { renditionRoutes, themes } from "@/lib/renditions";
import { mockUser, mockCourses, mockQuizzes, mockStudents, mockAnalysisResult, mockHistorySnapshots, mockSyncSteps, getCourseById, getQuizzesForCourse, getStudentById, getNextAtRiskStudent } from "@/lib/mock-data";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import TrendChart from "@/lib/charts/TrendChart";

const ID = "4";
const r = renditionRoutes(ID);
const t = themes[ID];

const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14, boxShadow: "0 2px 8px rgba(74,55,40,0.06)" };
const btn: React.CSSProperties = { background: "linear-gradient(135deg, #E8725C, #F59E0B)", color: "#FFF", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" };
const btnO: React.CSSProperties = { background: "transparent", color: t.accent, border: `2px solid ${t.accent}`, padding: "11px 24px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" };
const heading: React.CSSProperties = { color: t.text, fontWeight: 800 };
const badge = (level: string) => {
  const c = t.risk[level as keyof typeof t.risk] ?? t.risk.low;
  return { display: "inline-block" as const, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: c.bg, color: c.text };
};

export function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FFF8F0 0%, #FFECD2 50%, #FCB69F 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #E8725C, #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
      </div>
      <h1 style={{ ...heading, fontSize: 40, marginBottom: 12, textAlign: "center" }}>EduInsight AI</h1>
      <p style={{ fontSize: 17, color: t.textSecondary, textAlign: "center", maxWidth: 360, marginBottom: 36, lineHeight: 1.7 }}>Warm, insightful analytics for every teacher.</p>
      <div style={{ maxWidth: 380, width: "100%" }}>
        <Link href={r.onboarding()}><button style={{ ...btn, width: "100%", fontSize: 17, padding: "16px 28px" }}>Sign in with Google</button></Link>
        <p style={{ fontSize: 12, color: t.muted, textAlign: "center", marginTop: 16 }}>SDG 4 · KitaHack 2026</p>
      </div>
    </div>
  );
}

export function Onboarding() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <h1 style={{ ...heading, fontSize: 22, marginBottom: 8 }}>All Set!</h1>
        <p style={{ color: t.textSecondary, fontSize: 14, marginBottom: 24 }}>Your Google services are connected.</p>
        <div style={{ ...card, padding: 20, marginBottom: 20 }}>
          {["Google Classroom", "Google Forms"].map((s) => (<div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${t.cardBorder}` }}><span style={{ fontSize: 15 }}>{s}</span><span style={badge("low")}>Connected</span></div>))}
        </div>
        <Link href={r.dashboard()}><button style={{ ...btn, width: "100%" }}>Let&apos;s Go!</button></Link>
      </div>
    </div>
  );
}

export function Dashboard() {
  const analyzedCount = mockQuizzes.filter((q) => q.analysisStatus === "completed").length;
  const totalStudents = mockCourses.reduce((s, c) => s + c.studentCount, 0);
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 4 }}>Welcome back!</h1>
      <p style={{ color: t.textSecondary, fontSize: 14, marginBottom: 20 }}>Here&apos;s your classroom snapshot.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[{ l: "Courses", v: mockCourses.length, emoji: "📚" }, { l: "Analyzed", v: analyzedCount, emoji: "✅" }, { l: "Students", v: totalStudents, emoji: "👩‍🎓" }, { l: "Rate", v: "94%", emoji: "📊" }].map((s) => (
          <div key={s.l} style={{ ...card, padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>{s.emoji}</span>
            <div><p style={{ fontSize: 11, color: t.textSecondary, textTransform: "uppercase", margin: 0 }}>{s.l}</p><p style={{ fontSize: 22, fontWeight: 800, color: t.text, margin: 0 }}>{s.v}</p></div>
          </div>
        ))}
      </div>
      <Link href={r.courses()}><button style={{ ...btn, width: "100%", marginBottom: 10 }}>Open Courses</button></Link>
      <Link href={r.course("course-1")}><button style={{ ...btnO, width: "100%" }}>Resume: {mockCourses[0].name}</button></Link>
      <div style={{ ...card, padding: 20, marginTop: 16 }}>
        <h3 style={{ ...heading, fontSize: 16, marginBottom: 12 }}>Quizzes</h3>
        {mockQuizzes.slice(0, 3).map((q) => (
          <div key={q.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
            <span style={{ fontSize: 14, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.title}</span>
            <span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Done" : "Pending"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Courses() {
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 16 }}>Courses</h1>
      {mockCourses.map((c) => (
        <Link key={c.id} href={r.course(c.id)} style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: 20, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #E8725C, #F59E0B)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>{c.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>{c.name}</p>
                <p style={{ fontSize: 13, color: t.textSecondary, margin: "2px 0 0" }}>{c.section} · {c.studentCount} students</p>
              </div>
              <span style={badge(c.lastSynced ? "low" : "high")}>{c.lastSynced ? "Synced" : "New"}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function CourseDetail({ courseId }: { courseId: string }) {
  const course = getCourseById(courseId) ?? mockCourses[0];
  const quizzes = getQuizzesForCourse(courseId);
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 22, marginBottom: 4 }}>{course.name}</h1>
      <p style={{ color: t.textSecondary, fontSize: 14, marginBottom: 16 }}>{course.studentCount} students · {course.section}</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Link href={r.quizzes(courseId)} style={{ flex: 1 }}><button style={{ ...btn, width: "100%" }}>Quizzes</button></Link>
        <Link href={r.history(courseId)} style={{ flex: 1 }}><button style={{ ...btnO, width: "100%" }}>History</button></Link>
      </div>
      {quizzes.map((q) => (
        <Link key={q.id} href={q.analysisStatus === "completed" ? r.insights(courseId, q.id) : r.sync(courseId, q.id)} style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{q.title}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{q.responseCount}/{q.totalStudents} responses</p></div>
            <span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Done" : "Pending"}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Quizzes({ courseId }: { courseId: string }) {
  const quizzes = getQuizzesForCourse(courseId);
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 22, marginBottom: 16 }}>Quizzes</h1>
      {quizzes.map((q) => (
        <Link key={q.id} href={q.analysisStatus === "completed" ? r.insights(courseId, q.id) : r.sync(courseId, q.id)} style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: 18, marginBottom: 10 }}>
            <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: t.text }}>{q.title}</p>
            <p style={{ fontSize: 13, color: t.textSecondary, margin: "6px 0 0" }}>Due {q.dueDate} · {q.responseCount}/{q.totalStudents}</p>
            <div style={{ marginTop: 10 }}><span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Analyzed" : "Pending"}</span></div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Sync({ courseId, quizId }: { courseId: string; quizId: string }) {
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 22, marginBottom: 16 }}>Syncing Data</h1>
      <div style={{ ...card, padding: 20, marginBottom: 20 }}>
        {mockSyncSteps.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < mockSyncSteps.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: s.status === "completed" ? "linear-gradient(135deg, #27AE60, #2ECC71)" : t.cardBorder, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>✓</div>
            <div style={{ flex: 1 }}><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{s.label}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>{s.detail}</p></div>
          </div>
        ))}
      </div>
      <Link href={r.analysis(courseId, quizId)}><button style={{ ...btn, width: "100%" }}>Continue to Analysis</button></Link>
    </div>
  );
}

export function Analysis({ courseId, quizId }: { courseId: string; quizId: string }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 40 }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, #27AE60, #2ECC71)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 8 }}>All Done!</h1>
      <p style={{ color: t.textSecondary, marginBottom: 28 }}>Gemini has analyzed all responses.</p>
      <Link href={r.insights(courseId, quizId)}><button style={{ ...btn, fontSize: 17 }}>See Insights</button></Link>
    </div>
  );
}

export function Insights({ courseId, quizId }: { courseId: string; quizId: string }) {
  const a = mockAnalysisResult;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ ...heading, fontSize: 22, margin: 0 }}>Insights</h1>
        <Link href={r.students(courseId, quizId)}><button style={{ ...btn, padding: "8px 16px", fontSize: 13 }}>Students</button></Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[{ l: "Average", v: `${a.averageScore}` }, { l: "Median", v: `${a.medianScore}` }, { l: "Completion", v: `${a.completionRate}%` }, { l: "At Risk", v: `${a.riskDistribution.filter(x => x.level === "critical" || x.level === "high").reduce((s, x) => s + x.count, 0)}` }].map((s) => (
          <div key={s.l} style={{ ...card, padding: 14, textAlign: "center" }}><p style={{ fontSize: 10, color: t.textSecondary, textTransform: "uppercase", marginBottom: 4 }}>{s.l}</p><p style={{ fontSize: 22, fontWeight: 800, color: t.text, margin: 0 }}>{s.v}</p></div>
        ))}
      </div>
      <div style={{ ...card, padding: 20, marginBottom: 14 }}><h3 style={{ ...heading, fontSize: 15, marginBottom: 10 }}>Concepts</h3><ConceptHeatmap data={a.conceptHeatmap} accentColor="#27AE60" dangerColor="#E8725C" height={240} /></div>
      <div style={{ ...card, padding: 20, marginBottom: 14 }}><h3 style={{ ...heading, fontSize: 15, marginBottom: 10 }}>Risk Levels</h3><RiskDistribution data={a.riskDistribution} height={240} /></div>
      <div style={{ ...card, padding: 20 }}>
        <h3 style={{ ...heading, fontSize: 15, marginBottom: 12 }}>Errors</h3>
        <div style={{ display: "flex", gap: 10 }}>
          {a.errorTypeBreakdown.map((e) => (
            <div key={e.type} style={{ flex: 1, background: `linear-gradient(135deg, ${t.accentLight}, #FFF)`, borderRadius: 12, padding: 14, textAlign: "center" }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: t.accent, margin: 0 }}>{e.percentage}%</p>
              <p style={{ fontSize: 12, color: t.textSecondary, textTransform: "capitalize", marginTop: 4 }}>{e.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Students({ courseId, quizId }: { courseId: string; quizId: string }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? mockStudents : mockStudents.filter((s) => s.riskLevel === filter);
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 22, marginBottom: 12 }}>Students</h1>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
        {["all", "critical", "high", "medium", "low"].map((lv) => (
          <button key={lv} onClick={() => setFilter(lv)} style={{ ...(filter === lv ? btn : btnO), padding: "8px 16px", fontSize: 12, borderRadius: 20, textTransform: "capitalize", whiteSpace: "nowrap", flexShrink: 0 }}>{lv}</button>
        ))}
      </div>
      {filtered.map((s) => (
        <Link key={s.id} href={r.studentDetail(courseId, quizId, s.id)} style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: t.risk[s.riskLevel].bg, color: t.risk[s.riskLevel].text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>{s.name.split(" ").map(w => w[0]).join("")}</div>
            <div style={{ flex: 1 }}><p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: t.text }}>{s.name}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{s.score}/{s.totalScore} · {s.knowledgeGaps.length} gap(s)</p></div>
            <span style={badge(s.riskLevel)}>{s.riskLevel}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function StudentDetail({ courseId, quizId, studentId }: { courseId: string; quizId: string; studentId: string }) {
  const student = getStudentById(studentId) ?? mockStudents[0];
  const next = getNextAtRiskStudent(studentId);
  return (
    <div>
      <div style={{ ...card, padding: 24, marginBottom: 16, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: t.risk[student.riskLevel].bg, color: t.risk[student.riskLevel].text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, margin: "0 auto 12px" }}>{student.name.split(" ").map(w => w[0]).join("")}</div>
        <h1 style={{ ...heading, fontSize: 22, marginBottom: 4 }}>{student.name}</h1>
        <p style={{ color: t.textSecondary, fontSize: 13, marginBottom: 10 }}>{student.email}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <div><p style={{ fontSize: 24, fontWeight: 800, color: t.accent, margin: 0 }}>{student.score}/{student.totalScore}</p><p style={{ fontSize: 11, color: t.textSecondary }}>Score</p></div>
          <div><span style={badge(student.riskLevel)}>{student.riskLevel}</span><p style={{ fontSize: 11, color: t.textSecondary, marginTop: 4 }}>Risk</p></div>
        </div>
      </div>
      {student.knowledgeGaps.length > 0 && (
        <div style={{ ...card, padding: 20, marginBottom: 12 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 12 }}>Gaps</h3>
          {student.knowledgeGaps.map((g, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: i < student.knowledgeGaps.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{g.concept}</span><span style={badge(g.severity === "severe" ? "critical" : "medium")}>{g.errorType}</span></div>
              <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>Qs: {g.affectedQuestions.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
      {student.interventions.length > 0 && (
        <div style={{ ...card, padding: 20, marginBottom: 12 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 12 }}>Plan</h3>
          {student.interventions.map((iv, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: i < student.interventions.length - 1 ? `1px solid ${t.cardBorder}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><p style={{ fontSize: 14, margin: 0 }}>{iv.description}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>{iv.focusArea}</p></div>
              <span style={badge(iv.planned ? "low" : "medium")}>{iv.planned ? "✓" : "—"}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={r.insights(courseId, quizId)} style={{ flex: 1 }}><button style={{ ...btnO, width: "100%" }}>Insights</button></Link>
        {next && <Link href={r.studentDetail(courseId, quizId, next.id)} style={{ flex: 1 }}><button style={{ ...btn, width: "100%" }}>Next</button></Link>}
      </div>
    </div>
  );
}

export function History({ courseId: _courseId }: { courseId: string }) {
  void _courseId;
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 22, marginBottom: 16 }}>History</h1>
      <div style={{ ...card, padding: 20, marginBottom: 14 }}><TrendChart data={mockHistorySnapshots} lineColor="#E8725C" height={240} /></div>
      {mockHistorySnapshots.map((s) => (
        <div key={s.quizId} style={{ ...card, padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{s.quizTitle}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>{s.date}</p></div>
          <p style={{ fontSize: 20, fontWeight: 800, color: t.accent, margin: 0 }}>{s.averageScore.toFixed(1)}</p>
        </div>
      ))}
    </div>
  );
}

export function Settings() {
  return (
    <div style={{ minHeight: "100vh", padding: "24px", background: t.bg }}>
      <h1 style={{ ...heading, fontSize: 22, marginBottom: 16 }}>Settings</h1>
      <div style={{ ...card, padding: 20, marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #E8725C, #F59E0B)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>{mockUser.avatar}</div>
        <div><p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{mockUser.name}</p><p style={{ fontSize: 13, color: t.textSecondary, margin: 0 }}>{mockUser.email}</p></div>
      </div>
      <div style={{ ...card, padding: 20, marginBottom: 14 }}>
        {["Google Classroom", "Google Forms"].map((s) => (<div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${t.cardBorder}` }}><span style={{ fontSize: 15 }}>{s}</span><span style={badge("low")}>Connected</span></div>))}
      </div>
      <Link href={r.dashboard()}><button style={{ ...btnO, width: "100%", marginBottom: 10 }}>Dashboard</button></Link>
      <Link href={r.landing()}><button style={{ ...btn, width: "100%", background: "linear-gradient(135deg, #C0392B, #E74C3C)" }}>Sign Out</button></Link>
    </div>
  );
}

export function ErrorPage() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ ...heading, fontSize: 22, marginBottom: 8 }}>Oops!</h1>
        <p style={{ color: t.textSecondary, marginBottom: 24 }}>Something went wrong. Let&apos;s try again.</p>
        <button style={{ ...btn, marginRight: 10 }} onClick={() => window.location.reload()}>Retry</button>
        <Link href={r.dashboard()}><button style={btnO}>Home</button></Link>
      </div>
    </div>
  );
}
