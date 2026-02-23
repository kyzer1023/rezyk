"use client";

import Link from "next/link";
import { mockCourses, mockQuizzes } from "@/lib/mock-data";

export default function R4Dashboard() {
  const lastCourse = mockCourses[0];
  const recentQuiz = mockQuizzes.find((q) => q.courseId === lastCourse.id && q.analysisStatus === "completed");
  const analyzedCount = mockQuizzes.filter((q) => q.analysisStatus === "completed").length;
  const totalStudents = mockCourses.reduce((a, c) => a + c.studentCount, 0);

  return (
    <div>
      <h1 className="r4-heading r4-fade-in" style={{ fontSize: 26, marginBottom: 4 }}>
        Welcome back, Sarah
      </h1>
      <p className="r4-fade-in r4-fd1 r4-muted" style={{ fontSize: 14, marginBottom: 28 }}>
        Your teaching overview.
      </p>

      <div className="r4-fade-in r4-fd1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Courses", value: mockCourses.length, accent: "#5C7D99" },
          { label: "Analyzed", value: analyzedCount, accent: "#3A7D5E" },
          { label: "Students", value: totalStudents, accent: "#B8762A" },
        ].map((s) => (
          <div key={s.label} className="r4-card" style={{ padding: 22 }}>
            <p className="r4-muted" style={{ fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</p>
            <p style={{ fontSize: 30, fontWeight: 700, color: s.accent, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="r4-fade-in r4-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="r4-card" style={{ padding: 24 }}>
          <h3 className="r4-heading" style={{ fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/4/dashboard/courses"><button className="r4-btn" style={{ width: "100%" }}>Open Courses</button></Link>
            {lastCourse && (
              <Link href={`/4/dashboard/courses/${lastCourse.id}`}>
                <button className="r4-btn-outline" style={{ width: "100%" }}>Resume: {lastCourse.name}</button>
              </Link>
            )}
          </div>
        </div>

        <div className="r4-card" style={{ padding: 24 }}>
          <h3 className="r4-heading" style={{ fontSize: 16, marginBottom: 16 }}>System Status</h3>
          {["Google Classroom", "Google Forms", "Gemini AI"].map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(160,178,196,0.1)" }}>
              <span style={{ fontSize: 14 }}>{s}</span>
              <span className="r4-badge r4-badge-low">Connected</span>
            </div>
          ))}
        </div>
      </div>

      {recentQuiz && (
        <div className="r4-card r4-fade-in r4-fd3" style={{ padding: 24, marginTop: 14 }}>
          <h3 className="r4-heading" style={{ fontSize: 16, marginBottom: 8 }}>Latest Analysis</h3>
          <p className="r4-muted" style={{ fontSize: 14, marginBottom: 14 }}>
            {recentQuiz.title} &mdash; {recentQuiz.responseCount}/{recentQuiz.totalStudents} responses
          </p>
          <Link href={`/4/dashboard/courses/${recentQuiz.courseId}/quizzes/${recentQuiz.id}/insights`}>
            <button className="r4-btn-outline">View Insights</button>
          </Link>
        </div>
      )}
    </div>
  );
}
