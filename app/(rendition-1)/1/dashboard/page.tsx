"use client";

import Link from "next/link";
import { mockCourses, mockQuizzes } from "@/lib/mock-data";

export default function R1Dashboard() {
  const lastCourse = mockCourses[0];
  const recentQuiz = mockQuizzes.find((q) => q.courseId === lastCourse.id && q.analysisStatus === "completed");

  return (
    <div>
      <h1 className="r1-heading r1-fade-in" style={{ fontSize: 26, marginBottom: 4 }}>
        Welcome back, Sarah
      </h1>
      <p className="r1-fade-in r1-fade-in-delay-1" style={{ color: "#8B7E7E", fontSize: 16, marginBottom: 32 }}>
        Here&apos;s a quick overview of your recent activity.
      </p>

      <div
        className="r1-fade-in r1-fade-in-delay-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}
      >
        {[
          { label: "Active Courses", value: mockCourses.length, color: "#C1694F" },
          { label: "Quizzes Analyzed", value: mockQuizzes.filter((q) => q.analysisStatus === "completed").length, color: "#16a34a" },
          { label: "Students Tracked", value: mockCourses.reduce((acc, c) => acc + c.studentCount, 0), color: "#4A90D9" },
        ].map((stat) => (
          <div key={stat.label} className="r1-card" style={{ padding: 24 }}>
            <p style={{ fontSize: 13, color: "#8B7E7E", marginBottom: 8 }}>{stat.label}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="r1-fade-in r1-fade-in-delay-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="r1-card" style={{ padding: 24 }}>
          <h3 className="r1-heading" style={{ fontSize: 18, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/1/dashboard/courses">
              <button className="r1-btn" style={{ width: "100%" }}>Open Courses</button>
            </Link>
            {lastCourse && (
              <Link href={`/1/dashboard/courses/${lastCourse.id}`}>
                <button className="r1-btn-outline" style={{ width: "100%" }}>Resume: {lastCourse.name}</button>
              </Link>
            )}
          </div>
        </div>

        <div className="r1-card" style={{ padding: 24 }}>
          <h3 className="r1-heading" style={{ fontSize: 18, marginBottom: 16 }}>System Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Google Classroom", status: "Connected" },
              { label: "Google Forms", status: "Connected" },
              { label: "Gemini AI", status: "Ready" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15 }}>{s.label}</span>
                <span className="r1-badge r1-badge-low">{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recentQuiz && (
        <div className="r1-card r1-fade-in r1-fade-in-delay-4" style={{ padding: 24, marginTop: 20 }}>
          <h3 className="r1-heading" style={{ fontSize: 18, marginBottom: 8 }}>Latest Analysis</h3>
          <p style={{ color: "#8B7E7E", fontSize: 14, marginBottom: 12 }}>
            {recentQuiz.title} &mdash; {recentQuiz.responseCount}/{recentQuiz.totalStudents} responses
          </p>
          <Link href={`/1/dashboard/courses/${recentQuiz.courseId}/quizzes/${recentQuiz.id}/insights`}>
            <button className="r1-btn-outline">View Insights</button>
          </Link>
        </div>
      )}
    </div>
  );
}
