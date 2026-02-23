"use client";

import Link from "next/link";
import { mockCourses, mockQuizzes } from "@/lib/mock-data";

export default function R5Dashboard() {
  const lastCourse = mockCourses[0];
  const recentQuiz = mockQuizzes.find((q) => q.courseId === lastCourse.id && q.analysisStatus === "completed");

  return (
    <div>
      <h1 className="r5-heading r5-slide-in" style={{ fontSize: 22, marginBottom: 4 }}>Welcome back, Sarah</h1>
      <p className="r5-slide-in r5-sd1" style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>Your scholarly dashboard awaits.</p>

      <div className="r5-slide-in r5-sd1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Courses", value: mockCourses.length, color: "#C9A96E" },
          { label: "Analyzed", value: mockQuizzes.filter((q) => q.analysisStatus === "completed").length, color: "#86EFAC" },
          { label: "Students", value: mockCourses.reduce((a, c) => a + c.studentCount, 0), color: "#93C5FD" },
        ].map((s) => (
          <div key={s.label} className="r5-card" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="r5-slide-in r5-sd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="r5-card" style={{ padding: 20 }}>
          <h3 className="r5-heading" style={{ fontSize: 15, marginBottom: 12 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/5/dashboard/courses"><button className="r5-btn" style={{ width: "100%" }}>Open Courses</button></Link>
            {lastCourse && <Link href={`/5/dashboard/courses/${lastCourse.id}`}><button className="r5-btn-outline" style={{ width: "100%" }}>Resume: {lastCourse.name}</button></Link>}
          </div>
        </div>
        <div className="r5-card" style={{ padding: 20 }}>
          <h3 className="r5-heading" style={{ fontSize: 15, marginBottom: 12 }}>System Status</h3>
          {["Google Classroom", "Google Forms", "Gemini AI"].map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
              <span style={{ fontSize: 13 }}>{s}</span>
              <span className="r5-badge r5-badge-low">Connected</span>
            </div>
          ))}
        </div>
      </div>

      {recentQuiz && (
        <div className="r5-card r5-slide-in r5-sd3" style={{ padding: 20, marginTop: 14 }}>
          <h3 className="r5-heading" style={{ fontSize: 15, marginBottom: 6 }}>Latest Analysis</h3>
          <p style={{ color: "#64748B", fontSize: 13, marginBottom: 10 }}>{recentQuiz.title} &mdash; {recentQuiz.responseCount}/{recentQuiz.totalStudents}</p>
          <Link href={`/5/dashboard/courses/${recentQuiz.courseId}/quizzes/${recentQuiz.id}/insights`}><button className="r5-btn-outline">View Insights</button></Link>
        </div>
      )}
    </div>
  );
}
