"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { routes } from "@/lib/routes";

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  responseCount: number;
  totalStudents: number;
  syncStatus: string;
  analysisStatus: string;
}

export default function QuizzesPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/dashboard/quizzes?courseId=${courseId}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as { quizzes?: Quiz[] };
        if (!cancelled) {
          setQuizzes(data.quizzes ?? []);
        }
      } catch {
        // silent
      }
      if (!cancelled) {
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  async function syncQuizzes() {
    setSyncing(true);
    try {
      await fetch("/api/sync/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const res = await fetch(`/api/dashboard/quizzes?courseId=${courseId}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as { quizzes?: Quiz[] };
      setQuizzes(data.quizzes ?? []);
    } catch {
      // silent
    }
    setSyncing(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 0 }}>
          Quiz Assignments
        </h1>
        <button
          className="edu-btn-outline"
          style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={syncQuizzes}
          disabled={syncing}
        >
          {syncing ? "Syncing..." : "Refresh Quizzes"}
        </button>
      </div>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {loading
          ? "Loading..."
          : syncing
            ? "Preparing quizzes from Google Classroom..."
            : `${quizzes.length} quiz(es) with linked Google Forms`}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="edu-card edu-fade-in" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{quiz.title}</p>
                <p className="edu-muted" style={{ fontSize: 12, margin: "6px 0 0" }}>
                  {quiz.responseCount} responses &middot;{" "}
                  {quiz.analysisStatus === "completed"
                    ? "Analysis complete"
                    : quiz.analysisStatus === "running"
                      ? "Analysis running"
                      : "Not analyzed"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {quiz.analysisStatus === "completed" ? (
                  <Link href={routes.quizWorkspace(courseId, quiz.id, { view: "insights" })}>
                    <button className="edu-btn" style={{ padding: "6px 16px", fontSize: 13 }}>
                      View Insights
                    </button>
                  </Link>
                ) : (
                  <Link href={routes.quizWorkspace(courseId, quiz.id, { view: "analysis" })}>
                    <button className="edu-btn" style={{ padding: "6px 16px", fontSize: 13 }}>
                      Start Sync & Analyze
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && quizzes.length === 0 && (
          <div className="edu-card" style={{ padding: 32, textAlign: "center" }}>
            <p className="edu-muted" style={{ marginBottom: 12 }}>
              {syncing
                ? "Syncing quizzes..."
                : "No quiz assignments found for this course."}
            </p>
            <button className="edu-btn" onClick={syncQuizzes} disabled={syncing}>
              {syncing ? "Syncing..." : "Sync Quizzes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
