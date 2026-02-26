"use client";

import Link from "next/link";
import { useState } from "react";
import { renditionRoutes, themes } from "@/lib/renditions";
import { mockUser, mockCourses, mockQuizzes, mockStudents, mockAnalysisResult, mockHistorySnapshots, mockSyncSteps, getCourseById, getQuizzesForCourse, getQuizById, getStudentById, getNextAtRiskStudent } from "@/lib/mock-data";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import TrendChart from "@/lib/charts/TrendChart";

const ID = "2";
const r = renditionRoutes(ID);
const t = themes[ID];

const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };
const cardAccent: React.CSSProperties = { ...card, borderLeft: `3px solid ${t.accent}` };
const btn: React.CSSProperties = { background: t.accent, color: "#FFF", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" };
const btnO: React.CSSProperties = { background: "transparent", color: t.accent, border: `1.5px solid ${t.accent}`, padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" };
const heading: React.CSSProperties = { fontFamily: t.headingFont, color: t.text, fontWeight: 700 };
const badge = (level: string) => {
  const c = t.risk[level as keyof typeof t.risk] ?? t.risk.low;
  return { display: "inline-block" as const, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text };
};

export function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1B3A5C 0%, #2563EB 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", backdropFilter: "blur(8px)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: "#FFF", marginBottom: 12 }}>EduInsight AI</h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", marginBottom: 40, lineHeight: 1.7 }}>Crystal-clear classroom analytics. From quiz data to teaching insights in minutes.</p>
        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 14, padding: "40px 36px", backdropFilter: "blur(12px)" }}>
          <Link href={r.onboarding()}><button style={{ ...btn, width: "100%", fontSize: 16, padding: "14px 32px", borderRadius: 10 }}>Sign in with Google</button></Link>
          <p style={{ fontSize: 12, color: "#64748B", marginTop: 16 }}>Read-only access to Classroom courses and Forms responses.</p>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 32 }}>SDG 4 · Quality Education · KitaHack 2026</p>
      </div>
    </div>
  );
}

export function Onboarding() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <h1 style={{ ...heading, fontSize: 24, marginBottom: 8 }}>Integration Setup</h1>
        <p style={{ color: t.textSecondary, fontSize: 14, marginBottom: 28 }}>Connect your Google services to get started.</p>
        <div style={{ ...card, padding: 24, marginBottom: 20 }}>
          {["Google Classroom", "Google Forms"].map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
              <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{s}</span>
              <span style={badge("low")}>Connected</span>
            </div>
          ))}
        </div>
        <Link href={r.dashboard()}><button style={btn}>Continue to Dashboard</button></Link>
      </div>
    </div>
  );
}

export function Dashboard() {
  const analyzedCount = mockQuizzes.filter((q) => q.analysisStatus === "completed").length;
  const totalStudents = mockCourses.reduce((s, c) => s + c.studentCount, 0);
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 26, marginBottom: 20 }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Courses", value: mockCourses.length, color: t.accent },
          { label: "Analyzed", value: analyzedCount, color: "#15803D" },
          { label: "Students", value: totalStudents, color: "#7C3AED" },
          { label: "Completion", value: "94%", color: "#0891B2" },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: 20 }}>
            <p style={{ fontSize: 11, color: t.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 16 }}>Courses</h3>
          {mockCourses.map((c) => (
            <Link key={c.id} href={r.course(c.id)} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${t.cardBorder}`, alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: t.text }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{c.section}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: t.accent, margin: 0 }}>{c.studentCount} students</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 16 }}>Quick Links</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={r.courses()}><button style={{ ...btn, width: "100%" }}>All Courses</button></Link>
            <Link href={r.course("course-1")}><button style={{ ...btnO, width: "100%" }}>Resume: {mockCourses[0].name}</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Courses() {
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>Courses</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {mockCourses.map((c) => (
          <Link key={c.id} href={r.course(c.id)} style={{ textDecoration: "none" }}>
            <div style={{ ...cardAccent, padding: 20, height: "100%" }}>
              <h3 style={{ ...heading, fontSize: 16, marginBottom: 8 }}>{c.name}</h3>
              <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 12 }}>{c.section}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.accent }}>{c.studentCount} students</span>
                <span style={badge(c.lastSynced ? "low" : "high")}>{c.lastSynced ? "Synced" : "Pending"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CourseDetail({ courseId }: { courseId: string }) {
  const course = getCourseById(courseId) ?? mockCourses[0];
  const quizzes = getQuizzesForCourse(courseId);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ ...heading, fontSize: 24, margin: 0 }}>{course.name}</h1>
          <p style={{ fontSize: 14, color: t.textSecondary, margin: "4px 0 0" }}>{course.section} · {course.studentCount} students</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={r.quizzes(courseId)}><button style={btn}>Quiz List</button></Link>
          <Link href={r.history(courseId)}><button style={btnO}>History</button></Link>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {quizzes.map((q) => (
          <div key={q.id} style={{ ...cardAccent, padding: 20 }}>
            <h4 style={{ ...heading, fontSize: 15, marginBottom: 8 }}>{q.title}</h4>
            <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 12 }}>Due {q.dueDate} · {q.responseCount}/{q.totalStudents} responses</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Analyzed" : "Pending"}</span>
              <Link href={q.analysisStatus === "completed" ? r.insights(courseId, q.id) : r.sync(courseId, q.id)}><button style={{ ...btnO, padding: "6px 16px", fontSize: 12 }}>Open</button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Quizzes({ courseId }: { courseId: string }) {
  const quizzes = getQuizzesForCourse(courseId);
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>Quizzes</h1>
      {quizzes.map((q) => (
        <Link key={q.id} href={q.analysisStatus === "completed" ? r.insights(courseId, q.id) : r.sync(courseId, q.id)} style={{ textDecoration: "none" }}>
          <div style={{ ...cardAccent, padding: "16px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: t.text }}>{q.title}</p><p style={{ fontSize: 13, color: t.textSecondary, margin: "4px 0 0" }}>Due {q.dueDate} · {q.responseCount}/{q.totalStudents}</p></div>
            <span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Analyzed" : "Pending"}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Sync({ courseId, quizId }: { courseId: string; quizId: string }) {
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>Data Sync</h1>
      <div style={{ ...card, padding: 24, marginBottom: 20 }}>
        {mockSyncSteps.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < mockSyncSteps.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.status === "completed" ? t.risk.low.bg : t.cardBorder, color: s.status === "completed" ? t.risk.low.text : t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{i + 1}</div>
            <div style={{ flex: 1 }}><p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{s.label}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{s.detail}</p></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.risk.low.text} strokeWidth="2"><path d="M9 12l2 2 4-4" /></svg>
          </div>
        ))}
      </div>
      <Link href={r.analysis(courseId, quizId)}><button style={btn}>Proceed to Analysis</button></Link>
    </div>
  );
}

export function Analysis({ courseId, quizId }: { courseId: string; quizId: string }) {
  const quiz = getQuizById(quizId);
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>AI Analysis</h1>
      <div style={{ ...card, padding: 40, textAlign: "center" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={t.risk.low.text} strokeWidth="1.5" style={{ marginBottom: 16 }}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h3 style={{ ...heading, fontSize: 20, marginBottom: 8 }}>Analysis Complete</h3>
        <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24 }}>{quiz?.responseCount ?? 30} responses processed</p>
        <Link href={r.insights(courseId, quizId)}><button style={btn}>View Insights</button></Link>
      </div>
    </div>
  );
}

export function Insights({ courseId, quizId }: { courseId: string; quizId: string }) {
  const a = mockAnalysisResult;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ ...heading, fontSize: 24, margin: 0 }}>Class Insights</h1>
        <Link href={r.students(courseId, quizId)}><button style={btn}>View Students</button></Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[{ l: "Average", v: `${a.averageScore}` }, { l: "Median", v: `${a.medianScore}` }, { l: "Completion", v: `${a.completionRate}%` }, { l: "At Risk", v: `${a.riskDistribution.filter(x => x.level === "critical" || x.level === "high").reduce((s, x) => s + x.count, 0)}` }].map((s) => (
          <div key={s.l} style={{ ...card, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: t.textSecondary, textTransform: "uppercase", marginBottom: 4 }}>{s.l}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: t.text, margin: 0 }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginBottom: 20 }}>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ ...heading, fontSize: 15, marginBottom: 12 }}>Concept Mastery</h3>
          <ConceptHeatmap data={a.conceptHeatmap} accentColor="#2563EB" dangerColor="#DC2626" height={260} />
        </div>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ ...heading, fontSize: 15, marginBottom: 12 }}>Risk Levels</h3>
          <RiskDistribution data={a.riskDistribution} height={260} />
        </div>
      </div>
      <div style={{ ...card, padding: 24 }}>
        <h3 style={{ ...heading, fontSize: 15, marginBottom: 16 }}>Error Types</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {a.errorTypeBreakdown.map((e) => (
            <div key={e.type} style={{ background: t.bg, borderRadius: 8, padding: 16, textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: t.accent, margin: 0 }}>{e.percentage}%</p>
              <p style={{ fontSize: 13, color: t.textSecondary, textTransform: "capitalize", marginTop: 4 }}>{e.type}</p>
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
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 16 }}>Students</h1>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {["all", "critical", "high", "medium", "low"].map((lv) => (
          <button key={lv} onClick={() => setFilter(lv)} style={{ ...(filter === lv ? btn : btnO), padding: "6px 14px", fontSize: 12, borderRadius: 16, textTransform: "capitalize" }}>{lv}</button>
        ))}
      </div>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr style={{ background: t.bg }}><th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: t.textSecondary, fontSize: 12, textTransform: "uppercase" }}>Student</th><th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, color: t.textSecondary, fontSize: 12, textTransform: "uppercase" }}>Score</th><th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, color: t.textSecondary, fontSize: 12, textTransform: "uppercase" }}>Gaps</th><th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: t.textSecondary, fontSize: 12, textTransform: "uppercase" }}>Risk</th></tr></thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                <td style={{ padding: "12px 16px" }}><Link href={r.studentDetail(courseId, quizId, s.id)} style={{ color: t.accent, textDecoration: "none", fontWeight: 500 }}>{s.name}</Link></td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>{s.score}/{s.totalScore}</td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>{s.knowledgeGaps.length}</td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}><span style={badge(s.riskLevel)}>{s.riskLevel}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StudentDetail({ courseId, quizId, studentId }: { courseId: string; quizId: string; studentId: string }) {
  const student = getStudentById(studentId) ?? mockStudents[0];
  const next = getNextAtRiskStudent(studentId);
  return (
    <div>
      <div style={{ ...card, padding: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: t.risk[student.riskLevel].bg, color: t.risk[student.riskLevel].text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>{student.name.split(" ").map(w => w[0]).join("")}</div>
          <div><h1 style={{ ...heading, fontSize: 22, margin: 0 }}>{student.name}</h1><p style={{ fontSize: 13, color: t.textSecondary, margin: "4px 0 0" }}>{student.email} · Score: {student.score}/{student.totalScore}</p></div>
        </div>
        <span style={badge(student.riskLevel)}>{student.riskLevel} risk</span>
      </div>
      {student.knowledgeGaps.length > 0 && (
        <div style={{ ...card, padding: 24, marginBottom: 14 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 14 }}>Knowledge Gaps</h3>
          {student.knowledgeGaps.map((g, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < student.knowledgeGaps.length - 1 ? `1px solid ${t.cardBorder}` : "none", display: "flex", justifyContent: "space-between" }}>
              <div><p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{g.concept}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>Questions: {g.affectedQuestions.join(", ")}</p></div>
              <span style={badge(g.severity === "severe" ? "critical" : g.severity === "moderate" ? "medium" : "low")}>{g.errorType}</span>
            </div>
          ))}
        </div>
      )}
      {student.interventions.length > 0 && (
        <div style={{ ...card, padding: 24, marginBottom: 14 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 14 }}>Interventions</h3>
          {student.interventions.map((iv, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < student.interventions.length - 1 ? `1px solid ${t.cardBorder}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{iv.description}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{iv.focusArea} · {iv.type}</p></div>
              <span style={badge(iv.planned ? "low" : "medium")}>{iv.planned ? "Planned" : "Pending"}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={r.insights(courseId, quizId)}><button style={btnO}>Back to Insights</button></Link>
        {next && <Link href={r.studentDetail(courseId, quizId, next.id)}><button style={btn}>Next: {next.name}</button></Link>}
      </div>
    </div>
  );
}

export function History({ courseId }: { courseId: string }) {
  const course = getCourseById(courseId) ?? mockCourses[0];
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>History — {course.name}</h1>
      <div style={{ ...card, padding: 24, marginBottom: 20 }}>
        <h3 style={{ ...heading, fontSize: 15, marginBottom: 12 }}>Score Trend</h3>
        <TrendChart data={mockHistorySnapshots} lineColor="#2563EB" height={280} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {mockHistorySnapshots.map((s) => (
          <div key={s.quizId} style={{ ...cardAccent, padding: 20 }}>
            <h4 style={{ ...heading, fontSize: 15, marginBottom: 6 }}>{s.quizTitle}</h4>
            <p style={{ fontSize: 12, color: t.textSecondary, marginBottom: 8 }}>{s.date}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: t.accent }}>{s.averageScore.toFixed(1)}/40</span>
              <div style={{ display: "flex", gap: 4 }}>{s.topWeakConcepts.map((c) => <span key={c} style={{ fontSize: 10, background: t.risk.high.bg, color: t.risk.high.text, padding: "2px 6px", borderRadius: 4 }}>{c}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div style={{ minHeight: "100vh", padding: 40, maxWidth: 560, margin: "0 auto", background: t.bg }}>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>Settings</h1>
      <div style={{ ...card, padding: 24, marginBottom: 14 }}>
        <h3 style={{ ...heading, fontSize: 17, marginBottom: 14 }}>Account</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: t.accent, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>{mockUser.avatar}</div>
          <div><p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{mockUser.name}</p><p style={{ fontSize: 13, color: t.textSecondary, margin: 0 }}>{mockUser.email}</p></div>
        </div>
      </div>
      <div style={{ ...card, padding: 24, marginBottom: 14 }}>
        <h3 style={{ ...heading, fontSize: 17, marginBottom: 14 }}>Integrations</h3>
        {["Google Classroom", "Google Forms"].map((s) => (
          <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${t.cardBorder}` }}><span style={{ fontSize: 14 }}>{s}</span><span style={badge("low")}>Connected</span></div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={r.dashboard()}><button style={btnO}>Back to Dashboard</button></Link>
        <Link href={r.landing()}><button style={{ ...btn, background: "#DC2626" }}>Sign Out</button></Link>
      </div>
    </div>
  );
}

export function ErrorPage() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: t.risk.critical.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.risk.critical.text} strokeWidth="2"><path d="M12 9v2m0 4h.01M12 2l10 18H2L12 2z" /></svg>
        </div>
        <h1 style={{ ...heading, fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24 }}>Please try again or return to the dashboard.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={btn} onClick={() => window.location.reload()}>Retry</button>
          <Link href={r.dashboard()}><button style={btnO}>Dashboard</button></Link>
        </div>
      </div>
    </div>
  );
}
