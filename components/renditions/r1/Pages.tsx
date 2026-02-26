"use client";

import Link from "next/link";
import { useState } from "react";
import { renditionRoutes, themes } from "@/lib/renditions";
import { mockUser, mockCourses, mockQuizzes, mockStudents, mockAnalysisResult, mockHistorySnapshots, mockSyncSteps, getCourseById, getQuizzesForCourse, getQuizById, getStudentById, getNextAtRiskStudent } from "@/lib/mock-data";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import TrendChart from "@/lib/charts/TrendChart";

const ID = "1";
const r = renditionRoutes(ID);
const t = themes[ID];

const card: React.CSSProperties = { background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8, boxShadow: "0 1px 4px rgba(61,50,41,0.05)" };
const btn: React.CSSProperties = { background: t.accent, color: "#FFF", border: "none", padding: "10px 24px", borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: "pointer" };
const btnO: React.CSSProperties = { background: "transparent", color: t.accent, border: `1.5px solid ${t.accent}`, padding: "10px 24px", borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: "pointer" };
const heading: React.CSSProperties = { fontFamily: t.headingFont, color: t.text };
const badge = (level: string) => {
  const c = t.risk[level as keyof typeof t.risk] ?? t.risk.low;
  return { display: "inline-block" as const, padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text };
};

export function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        </div>
        <h1 style={{ ...heading, fontSize: 36, marginBottom: 10 }}>EduInsight AI</h1>
        <p style={{ fontSize: 16, color: t.textSecondary, marginBottom: 36, lineHeight: 1.7 }}>Understand your classroom, one quiz at a time. Data-driven insights for thoughtful teaching.</p>
        <div style={{ ...card, padding: "36px 32px" }}>
          <Link href={r.onboarding()}><button style={{ ...btn, width: "100%", fontSize: 16, padding: "14px 32px" }}>Sign in with Google</button></Link>
          <p style={{ fontSize: 12, color: t.muted, marginTop: 16 }}>Grants read access to Google Classroom and Forms responses.</p>
        </div>
        <p style={{ fontSize: 12, color: t.muted, marginTop: 28 }}>SDG 4 · Quality Education · KitaHack 2026</p>
      </div>
    </div>
  );
}

export function Onboarding() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <h1 style={{ ...heading, fontSize: 24, marginBottom: 8 }}>Integration Status</h1>
        <p style={{ color: t.textSecondary, fontSize: 14, marginBottom: 28 }}>EduInsight needs access to your Google services.</p>
        <div style={{ ...card, padding: 24, marginBottom: 20 }}>
          {["Google Classroom", "Google Forms"].map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
              <span style={{ fontSize: 14, color: t.text }}>{s}</span>
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
      <h1 style={{ ...heading, fontSize: 26, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 28 }}>Your classroom overview at a glance.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[{ label: "Active Courses", value: mockCourses.length, c: t.accent }, { label: "Quizzes Analyzed", value: analyzedCount, c: "#6B8E5C" }, { label: "Total Students", value: totalStudents, c: "#2B5E9E" }].map((s) => (
          <div key={s.label} style={{ ...card, padding: 22 }}>
            <p style={{ fontSize: 12, color: t.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</p>
            <p style={{ fontSize: 30, fontWeight: 700, color: s.c, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ ...heading, fontSize: 17, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={r.courses()}><button style={{ ...btn, width: "100%" }}>Open Courses</button></Link>
            <Link href={r.course("course-1")}><button style={{ ...btnO, width: "100%" }}>Resume: {mockCourses[0].name}</button></Link>
          </div>
        </div>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ ...heading, fontSize: 17, marginBottom: 16 }}>Recent Quizzes</h3>
          {mockQuizzes.slice(0, 3).map((q) => (
            <div key={q.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
              <span style={{ fontSize: 13, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.title}</span>
              <span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Analyzed" : "Pending"}</span>
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
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 4 }}>Courses</h1>
      <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24 }}>{mockCourses.length} course(s) from Google Classroom</p>
      {mockCourses.map((c) => (
        <Link key={c.id} href={r.course(c.id)} style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: "18px 24px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: t.text, margin: 0 }}>{c.name}</p>
              <p style={{ fontSize: 13, color: t.textSecondary, margin: "4px 0 0" }}>{c.section} · {c.studentCount} students</p>
            </div>
            <span style={badge(c.lastSynced ? "low" : "high")}>{c.lastSynced ? "Synced" : "Not synced"}</span>
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
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 4 }}>{course.name}</h1>
      <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 20 }}>{course.section} · {course.studentCount} students</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <Link href={r.quizzes(courseId)}><button style={btn}>Open Quiz List</button></Link>
        <Link href={r.history(courseId)}><button style={btnO}>View History</button></Link>
        <Link href={r.courses()}><button style={btnO}>Back</button></Link>
      </div>
      {quizzes.length > 0 && (
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ ...heading, fontSize: 17, marginBottom: 16 }}>Quizzes</h3>
          {quizzes.map((q) => (
            <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{q.title}</p>
                <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{q.responseCount} responses · {q.syncStatus}</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={badge(q.analysisStatus === "completed" ? "low" : q.analysisStatus === "running" ? "medium" : "high")}>{q.analysisStatus === "completed" ? "Analyzed" : "Pending"}</span>
                <Link href={q.analysisStatus === "completed" ? r.insights(courseId, q.id) : r.sync(courseId, q.id)}><button style={{ ...btnO, padding: "5px 14px", fontSize: 12 }}>Open</button></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Quizzes({ courseId }: { courseId: string }) {
  const course = getCourseById(courseId) ?? mockCourses[0];
  const quizzes = getQuizzesForCourse(courseId);
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 4 }}>Quizzes — {course.name}</h1>
      <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24 }}>{quizzes.length} quiz(es) found</p>
      {quizzes.map((q) => (
        <Link key={q.id} href={q.analysisStatus === "completed" ? r.insights(courseId, q.id) : r.sync(courseId, q.id)} style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: "18px 24px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: t.text }}>{q.title}</p>
              <p style={{ fontSize: 13, color: t.textSecondary, margin: "4px 0 0" }}>Due {q.dueDate} · {q.responseCount}/{q.totalStudents} responses</p>
            </div>
            <span style={badge(q.analysisStatus === "completed" ? "low" : "high")}>{q.analysisStatus === "completed" ? "Analyzed" : q.syncStatus === "synced" ? "Ready" : "Not synced"}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Sync({ courseId, quizId }: { courseId: string; quizId: string }) {
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 4 }}>Data Sync</h1>
      <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24 }}>Sync quiz data from Google Classroom and Forms</p>
      <div style={{ ...card, padding: 24, marginBottom: 20 }}>
        {mockSyncSteps.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < mockSyncSteps.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.status === "completed" ? t.risk.low.bg : t.cardBorder, color: s.status === "completed" ? t.risk.low.text : t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{s.detail}</p>
            </div>
            <span style={badge(s.status === "completed" ? "low" : "medium")}>{s.status}</span>
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
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 4 }}>AI Analysis</h1>
      <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24 }}>Run Gemini misconception analysis on {quiz?.title ?? "quiz"}</p>
      <div style={{ ...card, padding: 32, textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: t.risk.low.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={t.risk.low.text} strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 style={{ ...heading, fontSize: 18, marginBottom: 8 }}>Analysis Complete</h3>
        <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 20 }}>{quiz?.responseCount ?? 30} responses analyzed · {mockAnalysisResult.conceptHeatmap.length} concepts identified</p>
        <Link href={r.insights(courseId, quizId)}><button style={btn}>View Class Insights</button></Link>
      </div>
    </div>
  );
}

export function Insights({ courseId, quizId }: { courseId: string; quizId: string }) {
  const quiz = getQuizById(quizId);
  const a = mockAnalysisResult;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ ...heading, fontSize: 24, marginBottom: 4 }}>Class Insights</h1>
          <p style={{ fontSize: 14, color: t.textSecondary }}>{quiz?.title ?? "Quiz"} · {a.completionRate}% completion</p>
        </div>
        <Link href={r.students(courseId, quizId)}><button style={btn}>View Students</button></Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[{ l: "Average", v: `${a.averageScore}/40` }, { l: "Median", v: `${a.medianScore}/40` }, { l: "Completion", v: `${a.completionRate}%` }, { l: "At Risk", v: `${a.riskDistribution.filter(r => r.level === "critical" || r.level === "high").reduce((s, r) => s + r.count, 0)}` }].map((s) => (
          <div key={s.l} style={{ ...card, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: t.textSecondary, textTransform: "uppercase", marginBottom: 6 }}>{s.l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: 0 }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 12 }}>Concept Heatmap</h3>
          <ConceptHeatmap data={a.conceptHeatmap} height={260} />
        </div>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 12 }}>Risk Distribution</h3>
          <RiskDistribution data={a.riskDistribution} height={260} />
        </div>
      </div>
      <div style={{ ...card, padding: 24 }}>
        <h3 style={{ ...heading, fontSize: 16, marginBottom: 12 }}>Error Type Breakdown</h3>
        <div style={{ display: "flex", gap: 16 }}>
          {a.errorTypeBreakdown.map((e) => (
            <div key={e.type} style={{ flex: 1, padding: 16, background: t.bg, borderRadius: 6, textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: t.accent, margin: 0 }}>{e.percentage}%</p>
              <p style={{ fontSize: 13, color: t.textSecondary, margin: "4px 0 0", textTransform: "capitalize" }}>{e.type}</p>
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
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 4 }}>Students</h1>
      <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 16 }}>{mockStudents.length} students · Fractions & Decimals Quiz</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "critical", "high", "medium", "low"].map((lv) => (
          <button key={lv} onClick={() => setFilter(lv)} style={{ ...( filter === lv ? btn : btnO), padding: "6px 14px", fontSize: 12, textTransform: "capitalize" }}>{lv === "all" ? "All" : lv}</button>
        ))}
      </div>
      {filtered.map((s) => (
        <Link key={s.id} href={r.studentDetail(courseId, quizId, s.id)} style={{ textDecoration: "none" }}>
          <div style={{ ...card, padding: "14px 20px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.risk[s.riskLevel].bg, color: t.risk[s.riskLevel].text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>{s.name.split(" ").map(w => w[0]).join("")}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: t.text }}>{s.name}</p>
                <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>{s.score}/{s.totalScore} · {s.knowledgeGaps.length} gap(s)</p>
              </div>
            </div>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: t.risk[student.riskLevel].bg, color: t.risk[student.riskLevel].text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>{student.name.split(" ").map(w => w[0]).join("")}</div>
          <div>
            <h1 style={{ ...heading, fontSize: 22, margin: 0 }}>{student.name}</h1>
            <p style={{ fontSize: 13, color: t.textSecondary, margin: "2px 0 0" }}>{student.email} · Score: {student.score}/{student.totalScore}</p>
          </div>
        </div>
        <span style={badge(student.riskLevel)}>{student.riskLevel} risk</span>
      </div>
      {student.knowledgeGaps.length > 0 && (
        <div style={{ ...card, padding: 24, marginBottom: 14 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 14 }}>Knowledge Gaps</h3>
          {student.knowledgeGaps.map((g, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < student.knowledgeGaps.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{g.concept}</span>
                <span style={badge(g.severity === "severe" ? "critical" : g.severity === "moderate" ? "medium" : "low")}>{g.errorType}</span>
              </div>
              <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>Questions: {g.affectedQuestions.join(", ")} · Severity: {g.severity}</p>
            </div>
          ))}
        </div>
      )}
      {student.interventions.length > 0 && (
        <div style={{ ...card, padding: 24, marginBottom: 14 }}>
          <h3 style={{ ...heading, fontSize: 16, marginBottom: 14 }}>Recommended Interventions</h3>
          {student.interventions.map((iv, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < student.interventions.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{iv.description}</p>
                <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>Focus: {iv.focusArea} · Type: {iv.type}</p>
              </div>
              <span style={badge(iv.planned ? "low" : "medium")}>{iv.planned ? "Planned" : "Not planned"}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={r.insights(courseId, quizId)}><button style={btnO}>Back to Insights</button></Link>
        {next && <Link href={r.studentDetail(courseId, quizId, next.id)}><button style={btn}>Next At-Risk: {next.name}</button></Link>}
      </div>
    </div>
  );
}

export function History({ courseId }: { courseId: string }) {
  const course = getCourseById(courseId) ?? mockCourses[0];
  return (
    <div>
      <h1 style={{ ...heading, fontSize: 24, marginBottom: 4 }}>History — {course.name}</h1>
      <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24 }}>Track trends across quiz cycles</p>
      <div style={{ ...card, padding: 24, marginBottom: 20 }}>
        <h3 style={{ ...heading, fontSize: 16, marginBottom: 12 }}>Average Score Trend</h3>
        <TrendChart data={mockHistorySnapshots} height={280} />
      </div>
      <div style={{ ...card, padding: 24 }}>
        <h3 style={{ ...heading, fontSize: 16, marginBottom: 14 }}>Quiz Snapshots</h3>
        {mockHistorySnapshots.map((s, i) => (
          <div key={s.quizId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < mockHistorySnapshots.length - 1 ? `1px solid ${t.cardBorder}` : "none" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{s.quizTitle}</p>
              <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{s.date} · Weak: {s.topWeakConcepts.join(", ")}</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: t.accent, margin: 0 }}>{s.averageScore.toFixed(1)}</p>
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
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${t.accent}, ${t.accentHover})`, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>{mockUser.avatar}</div>
          <div><p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{mockUser.name}</p><p style={{ fontSize: 13, color: t.textSecondary, margin: 0 }}>{mockUser.email}</p></div>
        </div>
      </div>
      <div style={{ ...card, padding: 24, marginBottom: 14 }}>
        <h3 style={{ ...heading, fontSize: 17, marginBottom: 14 }}>Integrations</h3>
        {["Google Classroom", "Google Forms"].map((s) => (
          <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${t.cardBorder}` }}>
            <span style={{ fontSize: 14 }}>{s}</span><span style={badge("low")}>Connected</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={r.dashboard()}><button style={btnO}>Back to Dashboard</button></Link>
        <Link href={r.landing()}><button style={{ ...btn, background: t.risk.critical.text }}>Sign Out</button></Link>
      </div>
    </div>
  );
}

export function ErrorPage() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: t.risk.critical.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.risk.critical.text} strokeWidth="2"><path d="M12 9v2m0 4h.01M12 2l10 18H2L12 2z" /></svg>
        </div>
        <h1 style={{ ...heading, fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24 }}>An error occurred. Please try again or return to the dashboard.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={btn} onClick={() => window.location.reload()}>Retry</button>
          <Link href={r.dashboard()}><button style={btnO}>Back to Dashboard</button></Link>
        </div>
      </div>
    </div>
  );
}
