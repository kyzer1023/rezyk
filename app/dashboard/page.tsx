"use client";

import Link from "next/link";
import { mockCourses, mockQuizzes } from "@/lib/mock-data";
import { routes } from "@/lib/routes";

export default function DashboardPage() {
  const lastCourse = mockCourses[0];
  const recentQuiz = mockQuizzes.find(
    (quiz) => quiz.courseId === lastCourse.id && quiz.analysisStatus === "completed",
  );
  const analyzedCount = mockQuizzes.filter((quiz) => quiz.analysisStatus === "completed").length;
  const totalStudents = mockCourses.reduce((sum, course) => sum + course.studentCount, 0);

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 26, marginBottom: 4 }}>
        Welcome back, Sarah
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 28 }}>
        Your classroom overview at a glance.
      </p>

      <div className="edu-fade-in edu-fd1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Active Courses", value: mockCourses.length, accent: "#C17A56" },
          { label: "Quizzes Analyzed", value: analyzedCount, accent: "#6B8E5C" },
          { label: "Total Students", value: totalStudents, accent: "#2B5E9E" },
        ].map((stat) => (
          <div key={stat.label} className="edu-card" style={{ padding: 22 }}>
            <p className="edu-muted" style={{ fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 30, fontWeight: 700, color: stat.accent, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="edu-fade-in edu-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="edu-card" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 16 }}>
            Quick Actions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={routes.courses()}>
              <button className="edu-btn" style={{ width: "100%" }}>
                Open Courses
              </button>
            </Link>
            {lastCourse && (
              <Link href={routes.course(lastCourse.id)}>
                <button className="edu-btn-outline" style={{ width: "100%" }}>
                  Resume: {lastCourse.name}
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="edu-card" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 16 }}>
            System Status
          </h3>
          {["Google Classroom", "Google Forms", "Gemini AI"].map((statusItem) => (
            <div key={statusItem} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F0ECE5" }}>
              <span style={{ fontSize: 14 }}>{statusItem}</span>
              <span className="edu-badge edu-badge-low">Connected</span>
            </div>
          ))}
        </div>
      </div>

      {recentQuiz && (
        <div className="edu-card edu-fade-in edu-fd3" style={{ padding: 24, marginTop: 14 }}>
          <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 8 }}>
            Latest Analysis
          </h3>
          <p className="edu-muted" style={{ fontSize: 14, marginBottom: 12 }}>
            {recentQuiz.title} &mdash; {recentQuiz.responseCount}/{recentQuiz.totalStudents} responses
          </p>
          <Link href={routes.insights(recentQuiz.courseId, recentQuiz.id)}>
            <button className="edu-btn-outline">View Insights</button>
          </Link>
        </div>
      )}
    </div>
  );
}
