"use client";

import Link from "next/link";
import { mockCourses, mockQuizzes } from "@/lib/mock-data";

export default function R3Dashboard() {
  const lastCourse = mockCourses[0];
  const recentQuiz = mockQuizzes.find((q) => q.courseId === lastCourse.id && q.analysisStatus === "completed");
  const analyzedCount = mockQuizzes.filter((q) => q.analysisStatus === "completed").length;
  const totalStudents = mockCourses.reduce((a, c) => a + c.studentCount, 0);

  return (
    <div>
      <h1 className="r3-heading r3-fade-in" style={{ fontSize: 26, marginBottom: 4 }}>
        Welcome back, Sarah
      </h1>
      <p className="r3-fade-in r3-fd1 r3-muted" style={{ fontSize: 14, marginBottom: 28 }}>
        Your classroom overview at a glance.
      </p>

      <div className="r3-fade-in r3-fd1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Active Courses", value: mockCourses.length, accent: "#C17A56" },
          { label: "Quizzes Analyzed", value: analyzedCount, accent: "#6B8E5C" },
          { label: "Total Students", value: totalStudents, accent: "#2B5E9E" },
        ].map((s) => (
          <div key={s.label} className="r3-card" style={{ padding: 22 }}>
            <p className="r3-muted" style={{ fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</p>
            <p style={{ fontSize: 30, fontWeight: 700, color: s.accent, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="r3-fade-in r3-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="r3-card" style={{ padding: 24 }}>
          <h3 className="r3-heading" style={{ fontSize: 17, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/3/dashboard/courses">
              <button className="r3-btn" style={{ width: "100%" }}>Open Courses</button>
            </Link>
            {lastCourse && (
              <Link href={`/3/dashboard/courses/${lastCourse.id}`}>
                <button className="r3-btn-outline" style={{ width: "100%" }}>Resume: {lastCourse.name}</button>
              </Link>
            )}
          </div>
        </div>

        <div className="r3-card" style={{ padding: 24 }}>
          <h3 className="r3-heading" style={{ fontSize: 17, marginBottom: 16 }}>System Status</h3>
          {["Google Classroom", "Google Forms", "Gemini AI"].map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F0ECE5" }}>
              <span style={{ fontSize: 14 }}>{s}</span>
              <span className="r3-badge r3-badge-low">Connected</span>
            </div>
          ))}
        </div>
      </div>

      {recentQuiz && (
        <div className="r3-card r3-fade-in r3-fd3" style={{ padding: 24, marginTop: 14 }}>
          <h3 className="r3-heading" style={{ fontSize: 17, marginBottom: 8 }}>Latest Analysis</h3>
          <p className="r3-muted" style={{ fontSize: 14, marginBottom: 12 }}>
            {recentQuiz.title} &mdash; {recentQuiz.responseCount}/{recentQuiz.totalStudents} responses
          </p>
          <Link href={`/3/dashboard/courses/${recentQuiz.courseId}/quizzes/${recentQuiz.id}/insights`}>
            <button className="r3-btn-outline">View Insights</button>
          </Link>
        </div>
      )}
    </div>
  );
}
