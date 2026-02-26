"use client";

import Link from "next/link";
import { useState } from "react";
import { renditionRoutes, themes } from "@/lib/renditions";
import { mockUser, mockCourses, mockQuizzes, mockStudents, mockAnalysisResult, mockHistorySnapshots, mockSyncSteps, getCourseById, getQuizzesForCourse, getStudentById, getNextAtRiskStudent } from "@/lib/mock-data";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import TrendChart from "@/lib/charts/TrendChart";

const ID = "5";
const r = renditionRoutes(ID);
const t = themes[ID];

const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 6 };
const btn: React.CSSProperties = { background: t.accent, color: "#FFF", border: "none", padding: "8px 18px", borderRadius: 4, fontWeight: 600, fontSize: 13, cursor: "pointer" };
const btnO: React.CSSProperties = { background: "transparent", color: t.accent, border: `1px solid ${t.accent}`, padding: "8px 18px", borderRadius: 4, fontWeight: 600, fontSize: 13, cursor: "pointer" };
const heading: React.CSSProperties = { color: t.text, fontWeight: 700 };
const badge = (level: string) => {
  const c = t.risk[level as keyof typeof t.risk] ?? t.risk.low;
  return { display: "inline-block" as const, padding: "2px 8px", borderRadius: 3, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text };
};
const th: React.CSSProperties = { padding: "8px 12px", textAlign: "left" as const, fontWeight: 600, color: t.textSecondary, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 0.5, background: "#F3F4F6", borderBottom: `1px solid ${t.cardBorder}` };
const td: React.CSSProperties = { padding: "8px 12px", fontSize: 13, borderBottom: `1px solid ${t.cardBorder}` };

export function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#FFF", marginBottom: 10 }}>EduInsight AI</h1>
        <p style={{ fontSize: 15, color: "#9CA3AF", marginBottom: 36, lineHeight: 1.7 }}>Professional-grade classroom analytics. Enterprise-ready insights for educators.</p>
        <div style={{ background: "#1F2937", borderRadius: 8, padding: "32px 28px", border: "1px solid #374151" }}>
          <Link href={r.onboarding()}><button style={{ ...btn, width: "100%", fontSize: 14, padding: "12px 24px" }}>Sign in with Google</button></Link>
          <p style={{ fontSize: 11, color: "#6B7280", marginTop: 14 }}>Read-only access to Classroom and Forms.</p>
        </div>
        <p style={{ fontSize: 11, color: "#4B5563", marginTop: 28 }}>SDG 4 · Quality Education · KitaHack 2026</p>
      </div>
    </div>
  );
}

export function Onboarding() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <h1 style={{ ...heading, fontSize: 22, marginBottom: 8 }}>Integration Status</h1>
        <p style={{ color: t.textSecondary, fontSize: 13, marginBottom: 24 }}>All services operational.</p>
        <div style={{ ...card, overflow: "hidden", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Service</th><th style={{ ...th, textAlign: "right" }}>Status</th></tr></thead>
            <tbody>
              {["Google Classroom", "Google Forms"].map((s) => (<tr key={s}><td style={td}>{s}</td><td style={{ ...td, textAlign: "right" }}><span style={badge("low")}>Connected</span></td></tr>))}
            </tbody>
          </table>
        </div>
        <Link href={r.dashboard()}><button style={btn}>Continue</button></Link>
      </div>
    </div>
  );
}

export function Dashboard() {
  const analyzedCount = mockQuizzes.filter((q) => q.analysisStatus === "completed").length;
  const totalStudents = mockCourses.reduce((s, c) => s + c.studentCount, 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ ...heading, fontSize: 20, margin: 0 }}>Dashboard</h1>
        <Link href={r.courses()}><button style={btn}>All Courses</button></Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
        {[{ l: "Courses", v: mockCourses.length }, { l: "Quizzes", v: mockQuizzes.length }, { l: "Analyzed", v: analyzedCount }, { l: "Students", v: totalStudents }, { l: "Rate", v: "94%" }].map((s) => (
          <div key={s.l} style={{ ...card, padding: "12px 14px" }}>
            <p style={{ fontSize: 10, color: t.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{s.l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: t.accent, margin: 0 }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Course</th><th style={th}>Section</th><th style={{ ...th, textAlign: "center" }}>Students</th><th style={{ ...th, textAlign: "right" }}>Status</th></tr></thead>
            <tbody>
              {mockCourses.map((c) => (
                <tr key={c.id}><td style={td}><Link href={r.course(c.id)} style={{ color: t.accent, textDecoration: "none", fontWeight: 500 }}>{c.name}</Link></td><td style={td}>{c.section}</td><td style={{ ...td, textAlign: "center" }}>{c.studentCount}</td><td style={{ ...td, textAlign: "right" }}><span style={badge(c.lastSynced ? "low" : "high")}>{c.lastSynced ? "Synced" : "Pending"}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...card, padding: 16 }}>
          <h3 style={{ ...heading, fontSize: 13, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, color: t.textSecondary }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Link href={r.courses()}><button style={{ ...btn, width: "100%", fontSize: 12 }}>Courses</button></Link>
            <Link href={r.course("course-1")}><button style={{ ...btnO, width: "100%", fontSize: 12 }}>Resume</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Courses() {
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 20, marginBottom: 16 }}>Courses</h1>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Name</th><th style={th}>Section</th><th style={{ ...th, textAlign: "center" }}>Students</th><th style={{ ...th, textAlign: "center" }}>Last Synced</th><th style={{ ...th, textAlign: "right" }}>Action</th></tr></thead>
          <tbody>
            {mockCourses.map((c) => (
              <tr key={c.id}><td style={td}><span style={{ fontWeight: 500 }}>{c.name}</span></td><td style={td}>{c.section}</td><td style={{ ...td, textAlign: "center" }}>{c.studentCount}</td><td style={{ ...td, textAlign: "center", fontSize: 12 }}>{c.lastSynced ? new Date(c.lastSynced).toLocaleDateString() : "—"}</td><td style={{ ...td, textAlign: "right" }}><Link href={r.course(c.id)}><button style={{ ...btn, padding: "4px 12px", fontSize: 11 }}>Open</button></Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CourseDetail({ courseId }: { courseId: string }) {
  const course = getCourseById(courseId) ?? mockCourses[0];
  const quizzes = getQuizzesForCourse(courseId);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ ...heading, fontSize: 20, margin: 0 }}>{course.name}</h1>
          <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{course.section} · {course.studentCount} students</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Link href={r.quizzes(courseId)}><button style={btn}>Quizzes</button></Link>
          <Link href={r.history(courseId)}><button style={btnO}>History</button></Link>
        </div>
      </div>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Quiz</th><th style={{ ...th, textAlign: "center" }}>Responses</th><th style={{ ...th, textAlign: "center" }}>Due</th><th style={{ ...th, textAlign: "center" }}>Status</th><th style={{ ...th, textAlign: "right" }}>Action</th></tr></thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q.id}><td style={td}><span style={{ fontWeight: 500 }}>{q.title}</span></td><td style={{ ...td, textAlign: "center" }}>{q.responseCount}/{q.totalStudents}</td><td style={{ ...td, textAlign: "center", fontSize: 12 }}>{q.dueDate}</td><td style={{ ...td, textAlign: "center" }}><span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Done" : "Pending"}</span></td><td style={{ ...td, textAlign: "right" }}><Link href={q.analysisStatus === "completed" ? r.insights(courseId, q.id) : r.sync(courseId, q.id)}><button style={{ ...btn, padding: "4px 12px", fontSize: 11 }}>Open</button></Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Quizzes({ courseId }: { courseId: string }) {
  const quizzes = getQuizzesForCourse(courseId);
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 20, marginBottom: 16 }}>Quizzes</h1>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Title</th><th style={{ ...th, textAlign: "center" }}>Responses</th><th style={{ ...th, textAlign: "center" }}>Sync</th><th style={{ ...th, textAlign: "center" }}>Analysis</th><th style={{ ...th, textAlign: "right" }}></th></tr></thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q.id}><td style={td}>{q.title}</td><td style={{ ...td, textAlign: "center" }}>{q.responseCount}/{q.totalStudents}</td><td style={{ ...td, textAlign: "center" }}><span style={badge(q.syncStatus === "synced" ? "low" : "high")}>{q.syncStatus}</span></td><td style={{ ...td, textAlign: "center" }}><span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus}</span></td><td style={{ ...td, textAlign: "right" }}><Link href={q.analysisStatus === "completed" ? r.insights(courseId, q.id) : r.sync(courseId, q.id)}><button style={{ ...btn, padding: "4px 10px", fontSize: 11 }}>Open</button></Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Sync({ courseId, quizId }: { courseId: string; quizId: string }) {
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 20, marginBottom: 16 }}>Sync Pipeline</h1>
      <div style={{ ...card, overflow: "hidden", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={{ ...th, width: 40 }}>#</th><th style={th}>Step</th><th style={th}>Detail</th><th style={{ ...th, textAlign: "right" }}>Status</th></tr></thead>
          <tbody>
            {mockSyncSteps.map((s, i) => (
              <tr key={s.id}><td style={{ ...td, fontWeight: 600, color: t.accent }}>{i + 1}</td><td style={td}>{s.label}</td><td style={{ ...td, color: t.textSecondary, fontSize: 12 }}>{s.detail}</td><td style={{ ...td, textAlign: "right" }}><span style={badge("low")}>{s.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href={r.analysis(courseId, quizId)}><button style={btn}>Proceed to Analysis</button></Link>
    </div>
  );
}

export function Analysis({ courseId, quizId }: { courseId: string; quizId: string }) {
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 20, marginBottom: 16 }}>Analysis Pipeline</h1>
      <div style={{ ...card, padding: 28, textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 8, background: t.risk.low.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.risk.low.text} strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 style={{ ...heading, fontSize: 16, marginBottom: 6 }}>Analysis Complete</h3>
        <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 16 }}>All responses processed.</p>
        <Link href={r.insights(courseId, quizId)}><button style={btn}>View Insights</button></Link>
      </div>
    </div>
  );
}

export function Insights({ courseId, quizId }: { courseId: string; quizId: string }) {
  const a = mockAnalysisResult;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h1 style={{ ...heading, fontSize: 20, margin: 0 }}>Class Insights</h1>
        <Link href={r.students(courseId, quizId)}><button style={btn}>Students</button></Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
        {[{ l: "Avg", v: a.averageScore }, { l: "Med", v: a.medianScore }, { l: "Rate", v: `${a.completionRate}%` }, { l: "Critical", v: a.riskDistribution.find(x => x.level === "critical")?.count ?? 0 }, { l: "High", v: a.riskDistribution.find(x => x.level === "high")?.count ?? 0 }].map((s) => (
          <div key={s.l} style={{ ...card, padding: "10px 12px", textAlign: "center" }}><p style={{ fontSize: 10, color: t.textSecondary, textTransform: "uppercase", marginBottom: 2 }}>{s.l}</p><p style={{ fontSize: 18, fontWeight: 700, color: t.accent, margin: 0 }}>{s.v}</p></div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 12, marginBottom: 12 }}>
        <div style={{ ...card, padding: 16 }}><h3 style={{ ...heading, fontSize: 13, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5, color: t.textSecondary }}>Concept Mastery</h3><ConceptHeatmap data={a.conceptHeatmap} accentColor="#6366F1" dangerColor="#DC2626" height={230} /></div>
        <div style={{ ...card, padding: 16 }}><h3 style={{ ...heading, fontSize: 13, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5, color: t.textSecondary }}>Risk Distribution</h3><RiskDistribution data={a.riskDistribution} height={230} /></div>
      </div>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Concept</th><th style={{ ...th, textAlign: "center" }}>Correct %</th><th style={{ ...th, textAlign: "center" }}>Struggling</th><th style={{ ...th, textAlign: "center" }}>Error Type</th></tr></thead>
          <tbody>
            {a.conceptHeatmap.map((c) => (
              <tr key={c.concept}><td style={td}>{c.concept}</td><td style={{ ...td, textAlign: "center", fontWeight: 600, color: c.correctRate < 0.6 ? t.risk.critical.text : t.risk.low.text }}>{Math.round(c.correctRate * 100)}%</td><td style={{ ...td, textAlign: "center" }}>{c.studentsStruggling}</td><td style={{ ...td, textAlign: "center" }}><span style={badge(c.dominantErrorType === "conceptual" ? "critical" : c.dominantErrorType === "procedural" ? "medium" : "low")}>{c.dominantErrorType}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Students({ courseId, quizId }: { courseId: string; quizId: string }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? mockStudents : mockStudents.filter((s) => s.riskLevel === filter);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h1 style={{ ...heading, fontSize: 20, margin: 0 }}>Students ({filtered.length})</h1>
        <div style={{ display: "flex", gap: 4 }}>
          {["all", "critical", "high", "medium", "low"].map((lv) => (
            <button key={lv} onClick={() => setFilter(lv)} style={{ ...(filter === lv ? btn : btnO), padding: "4px 10px", fontSize: 11, textTransform: "capitalize" }}>{lv}</button>
          ))}
        </div>
      </div>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Name</th><th style={{ ...th, textAlign: "center" }}>Score</th><th style={{ ...th, textAlign: "center" }}>Gaps</th><th style={{ ...th, textAlign: "center" }}>Risk</th><th style={{ ...th, textAlign: "right" }}></th></tr></thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}><td style={td}><Link href={r.studentDetail(courseId, quizId, s.id)} style={{ color: t.accent, textDecoration: "none", fontWeight: 500 }}>{s.name}</Link><br /><span style={{ fontSize: 11, color: t.textSecondary }}>{s.email}</span></td><td style={{ ...td, textAlign: "center", fontFamily: "monospace" }}>{s.score}/{s.totalScore}</td><td style={{ ...td, textAlign: "center" }}>{s.knowledgeGaps.length}</td><td style={{ ...td, textAlign: "center" }}><span style={badge(s.riskLevel)}>{s.riskLevel}</span></td><td style={{ ...td, textAlign: "right" }}><Link href={r.studentDetail(courseId, quizId, s.id)}><button style={{ ...btn, padding: "3px 10px", fontSize: 11 }}>View</button></Link></td></tr>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ ...heading, fontSize: 20, margin: 0 }}>{student.name}</h1>
          <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{student.email} · Score: <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{student.score}/{student.totalScore}</span></p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={badge(student.riskLevel)}>{student.riskLevel}</span>
          <Link href={r.insights(courseId, quizId)}><button style={btnO}>Back</button></Link>
          {next && <Link href={r.studentDetail(courseId, quizId, next.id)}><button style={btn}>Next: {next.name}</button></Link>}
        </div>
      </div>
      {student.knowledgeGaps.length > 0 && (
        <div style={{ ...card, overflow: "hidden", marginBottom: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Concept</th><th style={{ ...th, textAlign: "center" }}>Severity</th><th style={{ ...th, textAlign: "center" }}>Error Type</th><th style={th}>Questions</th></tr></thead>
            <tbody>
              {student.knowledgeGaps.map((g, i) => (
                <tr key={i}><td style={{ ...td, fontWeight: 500 }}>{g.concept}</td><td style={{ ...td, textAlign: "center" }}><span style={badge(g.severity === "severe" ? "critical" : g.severity === "moderate" ? "medium" : "low")}>{g.severity}</span></td><td style={{ ...td, textAlign: "center" }}>{g.errorType}</td><td style={{ ...td, fontFamily: "monospace", fontSize: 12 }}>{g.affectedQuestions.join(", ")}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {student.interventions.length > 0 && (
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Intervention</th><th style={th}>Focus</th><th style={{ ...th, textAlign: "center" }}>Type</th><th style={{ ...th, textAlign: "center" }}>Status</th></tr></thead>
            <tbody>
              {student.interventions.map((iv, i) => (
                <tr key={i}><td style={td}>{iv.description}</td><td style={td}>{iv.focusArea}</td><td style={{ ...td, textAlign: "center" }}>{iv.type}</td><td style={{ ...td, textAlign: "center" }}><span style={badge(iv.planned ? "low" : "medium")}>{iv.planned ? "Planned" : "Pending"}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function History({ courseId: _courseId }: { courseId: string }) {
  void _courseId;
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 20, marginBottom: 16 }}>History</h1>
      <div style={{ ...card, padding: 16, marginBottom: 12 }}><TrendChart data={mockHistorySnapshots} lineColor="#6366F1" height={240} /></div>
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Quiz</th><th style={{ ...th, textAlign: "center" }}>Date</th><th style={{ ...th, textAlign: "center" }}>Avg Score</th><th style={th}>Weak Concepts</th></tr></thead>
          <tbody>
            {mockHistorySnapshots.map((s) => (
              <tr key={s.quizId}><td style={td}>{s.quizTitle}</td><td style={{ ...td, textAlign: "center", fontSize: 12 }}>{s.date}</td><td style={{ ...td, textAlign: "center", fontWeight: 600, fontFamily: "monospace", color: t.accent }}>{s.averageScore.toFixed(1)}</td><td style={{ ...td, fontSize: 12 }}>{s.topWeakConcepts.join(", ")}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div style={{ minHeight: "100vh", padding: 24, maxWidth: 520, margin: "0 auto", background: t.bg }}>
      <h1 style={{ ...heading, fontSize: 20, marginBottom: 16 }}>Settings</h1>
      <div style={{ ...card, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 6, background: t.accent, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{mockUser.avatar}</div>
          <div><p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{mockUser.name}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>{mockUser.email}</p></div>
        </div>
      </div>
      <div style={{ ...card, overflow: "hidden", marginBottom: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Service</th><th style={{ ...th, textAlign: "right" }}>Status</th></tr></thead>
          <tbody>
            {["Google Classroom", "Google Forms"].map((s) => (<tr key={s}><td style={td}>{s}</td><td style={{ ...td, textAlign: "right" }}><span style={badge("low")}>Connected</span></td></tr>))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Link href={r.dashboard()}><button style={btnO}>Dashboard</button></Link>
        <Link href={r.landing()}><button style={{ ...btn, background: "#DC2626" }}>Sign Out</button></Link>
      </div>
    </div>
  );
}

export function ErrorPage() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...card, padding: 32, textAlign: "center", maxWidth: 380 }}>
        <h1 style={{ ...heading, fontSize: 18, marginBottom: 6 }}>Error</h1>
        <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 16 }}>An error occurred. Please retry.</p>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          <button style={btn} onClick={() => window.location.reload()}>Retry</button>
          <Link href={r.dashboard()}><button style={btnO}>Dashboard</button></Link>
        </div>
      </div>
    </div>
  );
}
