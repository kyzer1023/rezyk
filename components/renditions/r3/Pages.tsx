"use client";

import Link from "next/link";
import { useState } from "react";
import { renditionRoutes, themes } from "@/lib/renditions";
import { mockUser, mockCourses, mockQuizzes, mockStudents, mockAnalysisResult, mockHistorySnapshots, mockSyncSteps, getCourseById, getQuizzesForCourse, getStudentById, getNextAtRiskStudent } from "@/lib/mock-data";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import TrendChart from "@/lib/charts/TrendChart";

const ID = "3";
const r = renditionRoutes(ID);
const t = themes[ID];

const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 10 };
const btn: React.CSSProperties = { background: t.accent, color: "#FFF", border: "none", padding: "10px 22px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" };
const btnO: React.CSSProperties = { background: "transparent", color: t.accent, border: `1.5px solid ${t.accent}`, padding: "10px 22px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" };
const heading: React.CSSProperties = { color: t.text, fontWeight: 700 };
const badge = (level: string) => {
  const c = t.risk[level as keyof typeof t.risk] ?? t.risk.low;
  return { display: "inline-block" as const, padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text };
};

export function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1B3830 0%, #2D6A4F 50%, #52B788 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, maxWidth: 800, width: "100%", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: "#FFF", marginBottom: 16, lineHeight: 1.2 }}>EduInsight AI</h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 32 }}>Calm, focused analytics for your classroom. Identify gaps, plan interventions, track progress.</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>SDG 4 · Quality Education · KitaHack 2026</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 16, padding: "40px 32px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
          </div>
          <Link href={r.onboarding()}><button style={{ ...btn, width: "100%", fontSize: 16, padding: "14px 28px" }}>Sign in with Google</button></Link>
          <p style={{ fontSize: 12, color: t.textSecondary, marginTop: 14 }}>Read-only access to Classroom and Forms.</p>
        </div>
      </div>
    </div>
  );
}

export function Onboarding() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
        <h1 style={{ ...heading, fontSize: 24, marginBottom: 8 }}>Integrations</h1>
        <p style={{ color: t.textSecondary, fontSize: 14, marginBottom: 24 }}>Your Google services are connected.</p>
        <div style={{ ...card, padding: 20, marginBottom: 20 }}>
          {["Google Classroom", "Google Forms"].map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${t.cardBorder}` }}><span style={{ fontSize: 14 }}>{s}</span><span style={badge("low")}>Connected</span></div>
          ))}
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
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>Overview</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[{ l: "Courses", v: mockCourses.length }, { l: "Analyzed", v: analyzedCount }, { l: "Students", v: totalStudents }, { l: "Completion", v: "94%" }].map((s) => (
              <div key={s.l} style={{ ...card, padding: 16 }}>
                <p style={{ fontSize: 11, color: t.textSecondary, textTransform: "uppercase", marginBottom: 6 }}>{s.l}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: t.accent, margin: 0 }}>{s.v}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href={r.courses()} style={{ flex: 1 }}><button style={{ ...btn, width: "100%" }}>Courses</button></Link>
            <Link href={r.course("course-1")} style={{ flex: 1 }}><button style={{ ...btnO, width: "100%" }}>Resume</button></Link>
          </div>
        </div>
        <div style={{ ...card, padding: 20 }}>
          <h3 style={{ ...heading, fontSize: 15, marginBottom: 12 }}>Recent Quizzes</h3>
          {mockQuizzes.filter(q => q.analysisStatus === "completed").slice(0, 4).map((q) => (
            <div key={q.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.cardBorder}`, fontSize: 13 }}>
              <span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.title}</span>
              <span style={badge("low")}>Done</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Courses() {
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>Courses</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {mockCourses.map((c) => (
          <Link key={c.id} href={r.course(c.id)} style={{ textDecoration: "none" }}>
            <div style={{ ...card, padding: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: t.accentLight, color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontWeight: 700 }}>{c.name.charAt(0)}</div>
              <h3 style={{ ...heading, fontSize: 15, marginBottom: 4 }}>{c.name}</h3>
              <p style={{ fontSize: 12, color: t.textSecondary, marginBottom: 10 }}>{c.section}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: t.accent, fontWeight: 600 }}>{c.studentCount} students</span>
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
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
      <div>
        <div style={{ ...card, padding: 20, marginBottom: 14 }}>
          <h2 style={{ ...heading, fontSize: 18, marginBottom: 8 }}>{course.name}</h2>
          <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 4 }}>{course.section}</p>
          <p style={{ fontSize: 13, color: t.accent, fontWeight: 600 }}>{course.studentCount} students</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href={r.quizzes(courseId)}><button style={{ ...btn, width: "100%" }}>Quiz List</button></Link>
          <Link href={r.history(courseId)}><button style={{ ...btnO, width: "100%" }}>History</button></Link>
          <Link href={r.courses()}><button style={{ ...btnO, width: "100%" }}>Back</button></Link>
        </div>
      </div>
      <div style={{ ...card, padding: 20 }}>
        <h3 style={{ ...heading, fontSize: 16, marginBottom: 14 }}>Quizzes</h3>
        {quizzes.map((q) => (
          <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
            <div><p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{q.title}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{q.responseCount}/{q.totalStudents} responses</p></div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Done" : "Pending"}</span>
              <Link href={q.analysisStatus === "completed" ? r.insights(courseId, q.id) : r.sync(courseId, q.id)}><button style={{ ...btnO, padding: "5px 12px", fontSize: 12 }}>Open</button></Link>
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
          <div style={{ ...card, padding: "16px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: t.text }}>{q.title}</p><p style={{ fontSize: 13, color: t.textSecondary, margin: "4px 0 0" }}>{q.responseCount}/{q.totalStudents} · Due {q.dueDate}</p></div>
            <span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Done" : "Pending"}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Sync({ courseId, quizId }: { courseId: string; quizId: string }) {
  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>Data Sync</h1>
      <div style={{ ...card, padding: 20, marginBottom: 20 }}>
        {mockSyncSteps.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < mockSyncSteps.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.status === "completed" ? t.accent : t.cardBorder }} />
            <div style={{ flex: 1 }}><p style={{ fontSize: 14, margin: 0 }}>{s.label}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>{s.detail}</p></div>
          </div>
        ))}
      </div>
      <Link href={r.analysis(courseId, quizId)}><button style={btn}>Proceed to Analysis</button></Link>
    </div>
  );
}

export function Analysis({ courseId, quizId }: { courseId: string; quizId: string }) {
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center", paddingTop: 40 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: t.risk.low.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <h1 style={{ ...heading, fontSize: 22, marginBottom: 8 }}>Analysis Complete</h1>
      <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24 }}>Misconception analysis ready for review.</p>
      <Link href={r.insights(courseId, quizId)}><button style={btn}>View Insights</button></Link>
    </div>
  );
}

export function Insights({ courseId, quizId }: { courseId: string; quizId: string }) {
  const a = mockAnalysisResult;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ ...heading, fontSize: 24, margin: 0 }}>Insights</h1>
        <Link href={r.students(courseId, quizId)}><button style={btn}>Students</button></Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[{ l: "Avg", v: a.averageScore }, { l: "Median", v: a.medianScore }, { l: "Rate", v: `${a.completionRate}%` }, { l: "At Risk", v: a.riskDistribution.filter(x => x.level === "critical" || x.level === "high").reduce((s, x) => s + x.count, 0) }].map((s) => (
          <div key={s.l} style={{ ...card, padding: 14, textAlign: "center" }}><p style={{ fontSize: 10, color: t.textSecondary, textTransform: "uppercase", marginBottom: 4 }}>{s.l}</p><p style={{ fontSize: 20, fontWeight: 700, color: t.accent, margin: 0 }}>{s.v}</p></div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ ...card, padding: 20 }}><h3 style={{ ...heading, fontSize: 15, marginBottom: 10 }}>Concept Mastery</h3><ConceptHeatmap data={a.conceptHeatmap} accentColor="#2D6A4F" dangerColor="#C62828" height={240} /></div>
        <div style={{ ...card, padding: 20 }}><h3 style={{ ...heading, fontSize: 15, marginBottom: 10 }}>Risk Levels</h3><RiskDistribution data={a.riskDistribution} height={240} /></div>
      </div>
      <div style={{ ...card, padding: 20 }}>
        <h3 style={{ ...heading, fontSize: 15, marginBottom: 12 }}>Error Breakdown</h3>
        <div style={{ display: "flex", gap: 12 }}>
          {a.errorTypeBreakdown.map((e) => (
            <div key={e.type} style={{ flex: 1, background: t.accentLight, borderRadius: 8, padding: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: t.accent, margin: 0 }}>{e.percentage}%</p>
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
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
      <div>
        <h3 style={{ ...heading, fontSize: 15, marginBottom: 12 }}>Filter</h3>
        {["all", "critical", "high", "medium", "low"].map((lv) => (
          <button key={lv} onClick={() => setFilter(lv)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", marginBottom: 4, borderRadius: 6, border: "none", background: filter === lv ? t.accentLight : "transparent", color: filter === lv ? t.accent : t.textSecondary, fontWeight: filter === lv ? 600 : 400, fontSize: 13, cursor: "pointer", textTransform: "capitalize" }}>{lv}</button>
        ))}
      </div>
      <div>
        <h1 style={{ ...heading, fontSize: 22, marginBottom: 14 }}>Students ({filtered.length})</h1>
        {filtered.map((s) => (
          <Link key={s.id} href={r.studentDetail(courseId, quizId, s.id)} style={{ textDecoration: "none" }}>
            <div style={{ ...card, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: t.risk[s.riskLevel].bg, color: t.risk[s.riskLevel].text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>{s.name.split(" ").map(w => w[0]).join("")}</div>
                <div><p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{s.name}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>{s.score}/{s.totalScore}</p></div>
              </div>
              <span style={badge(s.riskLevel)}>{s.riskLevel}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function StudentDetail({ courseId, quizId, studentId }: { courseId: string; quizId: string; studentId: string }) {
  const student = getStudentById(studentId) ?? mockStudents[0];
  const next = getNextAtRiskStudent(studentId);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
      <div style={{ ...card, padding: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: t.risk[student.riskLevel].bg, color: t.risk[student.riskLevel].text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, margin: "0 auto 14px" }}>{student.name.split(" ").map(w => w[0]).join("")}</div>
        <h2 style={{ ...heading, fontSize: 18, textAlign: "center", marginBottom: 4 }}>{student.name}</h2>
        <p style={{ fontSize: 12, color: t.textSecondary, textAlign: "center", marginBottom: 10 }}>{student.email}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ textAlign: "center" }}><p style={{ fontSize: 18, fontWeight: 700, color: t.accent, margin: 0 }}>{student.score}/{student.totalScore}</p><p style={{ fontSize: 11, color: t.textSecondary }}>Score</p></div>
          <div style={{ textAlign: "center" }}><span style={badge(student.riskLevel)}>{student.riskLevel}</span><p style={{ fontSize: 11, color: t.textSecondary, marginTop: 4 }}>Risk</p></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href={r.insights(courseId, quizId)}><button style={{ ...btnO, width: "100%", fontSize: 13 }}>Insights</button></Link>
          {next && <Link href={r.studentDetail(courseId, quizId, next.id)}><button style={{ ...btn, width: "100%", fontSize: 13 }}>Next: {next.name}</button></Link>}
        </div>
      </div>
      <div>
        {student.knowledgeGaps.length > 0 && (
          <div style={{ ...card, padding: 20, marginBottom: 14 }}>
            <h3 style={{ ...heading, fontSize: 15, marginBottom: 12 }}>Knowledge Gaps</h3>
            {student.knowledgeGaps.map((g, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < student.knowledgeGaps.length - 1 ? `1px solid ${t.cardBorder}` : "none", display: "flex", justifyContent: "space-between" }}>
                <div><p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{g.concept}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>Qs: {g.affectedQuestions.join(", ")}</p></div>
                <span style={badge(g.severity === "severe" ? "critical" : g.severity === "moderate" ? "medium" : "low")}>{g.errorType}</span>
              </div>
            ))}
          </div>
        )}
        {student.interventions.length > 0 && (
          <div style={{ ...card, padding: 20 }}>
            <h3 style={{ ...heading, fontSize: 15, marginBottom: 12 }}>Interventions</h3>
            {student.interventions.map((iv, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < student.interventions.length - 1 ? `1px solid ${t.cardBorder}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><p style={{ fontSize: 14, margin: 0 }}>{iv.description}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>{iv.focusArea} · {iv.type}</p></div>
                <span style={badge(iv.planned ? "low" : "medium")}>{iv.planned ? "Planned" : "Pending"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function History({ courseId: _courseId }: { courseId: string }) {
  void _courseId;
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>History</h1>
      <div style={{ ...card, padding: 20, marginBottom: 14 }}><h3 style={{ ...heading, fontSize: 15, marginBottom: 10 }}>Trend</h3><TrendChart data={mockHistorySnapshots} lineColor="#2D6A4F" height={260} /></div>
      {mockHistorySnapshots.map((s) => (
        <div key={s.quizId} style={{ ...card, padding: 16, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{s.quizTitle}</p><p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>{s.date}</p></div>
          <p style={{ fontSize: 18, fontWeight: 700, color: t.accent, margin: 0 }}>{s.averageScore.toFixed(1)}</p>
        </div>
      ))}
    </div>
  );
}

export function Settings() {
  return (
    <div style={{ minHeight: "100vh", padding: 40, maxWidth: 500, margin: "0 auto", background: t.bg }}>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 20 }}>Settings</h1>
      <div style={{ ...card, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: t.accent, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{mockUser.avatar}</div>
          <div><p style={{ fontWeight: 600, margin: 0 }}>{mockUser.name}</p><p style={{ fontSize: 13, color: t.textSecondary, margin: 0 }}>{mockUser.email}</p></div>
        </div>
      </div>
      <div style={{ ...card, padding: 20, marginBottom: 14 }}>
        {["Google Classroom", "Google Forms"].map((s) => (<div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${t.cardBorder}` }}><span>{s}</span><span style={badge("low")}>Connected</span></div>))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={r.dashboard()}><button style={btnO}>Dashboard</button></Link>
        <Link href={r.landing()}><button style={{ ...btn, background: t.risk.critical.text }}>Sign Out</button></Link>
      </div>
    </div>
  );
}

export function ErrorPage() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ ...heading, fontSize: 22, marginBottom: 8 }}>Error</h1>
        <p style={{ color: t.textSecondary, marginBottom: 20 }}>Something went wrong.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={btn} onClick={() => window.location.reload()}>Retry</button>
          <Link href={r.dashboard()}><button style={btnO}>Dashboard</button></Link>
        </div>
      </div>
    </div>
  );
}
