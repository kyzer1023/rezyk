"use client";

import Link from "next/link";
import { mockCourses, mockQuizzes } from "@/lib/mock-data";

export default function R2Dashboard() {
  const lastCourse = mockCourses[0];
  const recentQuiz = mockQuizzes.find(
    (q) => q.courseId === lastCourse.id && q.analysisStatus === "completed"
  );
  const analyzedCount = mockQuizzes.filter((q) => q.analysisStatus === "completed").length;
  const totalStudents = mockCourses.reduce((a, c) => a + c.studentCount, 0);

  return (
    <div>
      <h1 className="r2-heading r2-chalk-write" style={{ fontSize: 26, marginBottom: 4, fontWeight: 500 }}>
        Good afternoon, Sarah
      </h1>
      <p className="r2-fade-in r2-fade-in-d1" style={{ color: "rgba(232,229,216,0.5)", fontSize: 14, marginBottom: 28 }}>
        Here is your teaching overview.
      </p>

      <div
        className="r2-fade-in r2-fade-in-d1"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}
      >
        {[
          { label: "Courses", value: mockCourses.length, accent: "#8BA878" },
          { label: "Quizzes Analyzed", value: analyzedCount, accent: "#90CAF9" },
          { label: "Students", value: totalStudents, accent: "#FFCC80" },
        ].map((s) => (
          <div key={s.label} className="r2-card" style={{ padding: 22 }}>
            <p style={{ fontSize: 12, color: "rgba(232,229,216,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              {s.label}
            </p>
            <p style={{ fontSize: 32, fontWeight: 700, color: s.accent, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="r2-fade-in r2-fade-in-d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="r2-card" style={{ padding: 24 }}>
          <h3 className="r2-heading" style={{ fontSize: 16, marginBottom: 16, fontWeight: 500 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/2/dashboard/courses">
              <button className="r2-btn" style={{ width: "100%" }}>Browse Courses</button>
            </Link>
            {lastCourse && (
              <Link href={`/2/dashboard/courses/${lastCourse.id}`}>
                <button className="r2-btn-outline" style={{ width: "100%" }}>
                  Resume: {lastCourse.name}
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="r2-card" style={{ padding: 24 }}>
          <h3 className="r2-heading" style={{ fontSize: 16, marginBottom: 16, fontWeight: 500 }}>System Status</h3>
          {["Google Classroom", "Google Forms", "Gemini AI"].map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid rgba(139,168,120,0.1)",
              }}
            >
              <span style={{ fontSize: 14 }}>{s}</span>
              <span className="r2-badge r2-badge-low">Connected</span>
            </div>
          ))}
        </div>
      </div>

      {recentQuiz && (
        <div className="r2-card r2-fade-in r2-fade-in-d3" style={{ padding: 24, marginTop: 14 }}>
          <h3 className="r2-heading" style={{ fontSize: 16, marginBottom: 8, fontWeight: 500 }}>Latest Analysis</h3>
          <p style={{ color: "rgba(232,229,216,0.5)", fontSize: 14, marginBottom: 14 }}>
            {recentQuiz.title} &mdash; {recentQuiz.responseCount}/{recentQuiz.totalStudents} responses
          </p>
          <Link href={`/2/dashboard/courses/${recentQuiz.courseId}/quizzes/${recentQuiz.id}/insights`}>
            <button className="r2-btn-outline">View Insights</button>
          </Link>
        </div>
      )}
    </div>
  );
}
