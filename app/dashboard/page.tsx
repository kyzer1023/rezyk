"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { routes } from "@/lib/routes";

interface Course {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  lastSynced: string | null;
}

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  analysisStatus: string;
  responseCount: number;
  totalStudents: number;
}

interface BootstrapStatusResponse {
  hasInitialSync: boolean;
  bootstrapStatus: "pending" | "syncing" | "completed" | "error";
  lastAutoSyncAt: number;
  lastBootstrapError: string;
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [bootstrap, setBootstrap] = useState<BootstrapStatusResponse | null>(null);

  const loadDashboardData = useCallback(async () => {
    const [cRes, qRes] = await Promise.all([
      fetch("/api/dashboard/courses", { cache: "no-store" }),
      fetch("/api/dashboard/quizzes", { cache: "no-store" }),
    ]);
    const cData = (await cRes.json()) as { courses?: Course[] };
    const qData = (await qRes.json()) as { quizzes?: Quiz[] };
    setCourses(cData.courses ?? []);
    setQuizzes(qData.quizzes ?? []);
  }, []);

  const loadBootstrapStatus = useCallback(async () => {
    const res = await fetch("/api/bootstrap/status", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as BootstrapStatusResponse;
    setBootstrap(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await Promise.all([loadDashboardData(), loadBootstrapStatus()]);
      } catch {
        // silent
      }
      if (!cancelled) {
        setLoaded(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [loadBootstrapStatus, loadDashboardData]);

  useEffect(() => {
    if (bootstrap?.bootstrapStatus !== "syncing") return;
    const interval = window.setInterval(() => {
      void Promise.all([loadDashboardData(), loadBootstrapStatus()]);
    }, 2500);
    return () => {
      window.clearInterval(interval);
    };
  }, [bootstrap, loadBootstrapStatus, loadDashboardData]);

  async function syncCourses() {
    setSyncing(true);
    try {
      await fetch("/api/bootstrap/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "refresh", analyzeLimit: 0 }),
      });
      await Promise.all([loadDashboardData(), loadBootstrapStatus()]);
    } catch {
      // silent
    }
    setSyncing(false);
  }

  const analyzedCount = quizzes.filter((q) => q.analysisStatus === "completed").length;
  const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
  const lastCourse = courses[0];
  const recentQuiz = quizzes.find((q) => q.analysisStatus === "completed");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <h1 className="edu-heading edu-fade-in" style={{ fontSize: 26 }}>
          Dashboard
        </h1>
        <button
          className="edu-btn-outline"
          style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={syncCourses}
          disabled={syncing}
        >
          {syncing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 28 }}>
        {loaded
          ? courses.length > 0
            ? "Your classroom overview at a glance."
            : bootstrap?.bootstrapStatus === "syncing" || syncing
              ? "Preparing your classroom data in the background..."
              : bootstrap?.bootstrapStatus === "error"
                ? "Data sync needs attention. Retry refresh to continue."
                : "Setting up your classroom data..."
          : "Loading..."}
      </p>

      <div
        className="edu-fade-in edu-fd1"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}
      >
        {[
          { label: "Active Courses", value: courses.length, accent: "#C17A56" },
          { label: "Quizzes Analyzed", value: analyzedCount, accent: "#6B8E5C" },
          { label: "Total Students", value: totalStudents, accent: "#2B5E9E" },
        ].map((stat) => (
          <div key={stat.label} className="edu-card" style={{ padding: 22 }}>
            <p className="edu-muted" style={{ fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 30, fontWeight: 700, color: stat.accent, margin: 0 }}>
              {stat.value}
            </p>
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
            Quizzes
          </h3>
          {quizzes.length === 0 ? (
            <div>
              <p className="edu-muted" style={{ fontSize: 13, marginBottom: 12 }}>
                {bootstrap?.bootstrapStatus === "syncing" || syncing
                  ? "Quiz data is being prepared."
                  : "No quizzes synced yet."}
              </p>
              {bootstrap?.bootstrapStatus !== "syncing" && (
                <button
                  className="edu-btn-outline"
                  style={{ fontSize: 12 }}
                  onClick={syncCourses}
                  disabled={syncing}
                >
                  {syncing ? "Refreshing..." : "Retry Sync"}
                </button>
              )}
            </div>
          ) : (
            quizzes.slice(0, 3).map((quiz) => (
              <div
                key={quiz.id}
                style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F0ECE5" }}
              >
                <span style={{ fontSize: 13, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {quiz.title}
                </span>
                <span
                  className={`edu-badge edu-badge-${quiz.analysisStatus === "completed" ? "low" : quiz.analysisStatus === "running" ? "medium" : "high"}`}
                >
                  {quiz.analysisStatus === "completed" ? "Analyzed" : quiz.analysisStatus === "running" ? "Running" : "Pending"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {recentQuiz && (
        <div className="edu-card edu-fade-in edu-fd3" style={{ padding: 24, marginTop: 14 }}>
          <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 8 }}>
            Latest Analysis
          </h3>
          <p className="edu-muted" style={{ fontSize: 14, marginBottom: 12 }}>
            {recentQuiz.title} &mdash; {recentQuiz.responseCount} responses
          </p>
          <Link href={routes.quizWorkspace(recentQuiz.courseId, recentQuiz.id, { view: "insights" })}>
            <button className="edu-btn-outline">View Insights</button>
          </Link>
        </div>
      )}
    </div>
  );
}
