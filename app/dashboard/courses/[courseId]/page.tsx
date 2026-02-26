"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
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
  responseCount: number;
  totalStudents: number;
  syncStatus: string;
  analysisStatus: string;
  lastSynced: string | null;
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [cRes, qRes] = await Promise.all([
          fetch("/api/dashboard/courses"),
          fetch(`/api/dashboard/quizzes?courseId=${courseId}`),
        ]);
        const cData = await cRes.json();
        const qData = await qRes.json();
        if (!cancelled) {
          const found = (cData.courses ?? []).find((c: Course) => c.id === courseId);
          setCourse(found ?? null);
          setQuizzes(qData.quizzes ?? []);
        }
      } catch {
        // silent
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courseId]);

  async function syncQuizzes() {
    setSyncing(true);
    try {
      await fetch("/api/sync/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const [cRes, qRes] = await Promise.all([
        fetch("/api/dashboard/courses"),
        fetch(`/api/dashboard/quizzes?courseId=${courseId}`),
      ]);
      const cData = await cRes.json();
      const qData = await qRes.json();
      const found = (cData.courses ?? []).find((c: Course) => c.id === courseId);
      setCourse(found ?? null);
      setQuizzes(qData.quizzes ?? []);
    } catch {
      // silent
    }
    setSyncing(false);
  }

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        {course?.name ?? "Course"}
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {course?.section ? `${course.section} — ` : ""}{course?.studentCount ?? 0} students
      </p>

      <div className="edu-fade-in edu-fd1" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Link href={routes.quizzes(courseId)}>
          <button className="edu-btn">Open Quiz List</button>
        </Link>
        <Link href={routes.history(courseId)}>
          <button className="edu-btn-outline">View History</button>
        </Link>
        <button className="edu-btn-outline" onClick={syncQuizzes} disabled={syncing}>
          {syncing ? "Syncing…" : "Sync Quizzes"}
        </button>
        <Link href={routes.courses()}>
          <button className="edu-btn-outline">Back</button>
        </Link>
      </div>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24 }}>
        <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 14 }}>
          Quizzes
        </h3>
        {quizzes.length === 0 ? (
          <div>
            <p className="edu-muted" style={{ fontSize: 13, marginBottom: 12 }}>
              {syncing
                ? "Preparing quizzes from Google Classroom..."
                : "No quizzes found. Sync to import from Google Classroom."}
            </p>
            <button className="edu-btn-outline" onClick={syncQuizzes} disabled={syncing}>
              {syncing ? "Syncing..." : "Sync Quizzes"}
            </button>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz.id}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F0ECE5" }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{quiz.title}</p>
                <p className="edu-muted" style={{ fontSize: 12, margin: "4px 0 0" }}>
                  {quiz.responseCount} responses &middot; {quiz.syncStatus === "synced" ? "Synced" : "Not synced"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  className={`edu-badge edu-badge-${
                    quiz.analysisStatus === "completed" ? "low" : quiz.analysisStatus === "running" ? "medium" : "high"
                  }`}
                >
                  {quiz.analysisStatus === "completed" ? "Analyzed" : quiz.analysisStatus === "running" ? "Running" : "Pending"}
                </span>
                <Link href={routes.quizWorkspace(courseId, quiz.id, { view: "analysis" })}>
                  <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 12 }}>
                    Open
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
