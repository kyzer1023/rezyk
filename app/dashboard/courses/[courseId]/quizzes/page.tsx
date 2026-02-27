"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, use } from "react";
import { useDashboardBootstrapContext } from "@/components/layout/dashboard-bootstrap-context";
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
  const { bootstrap } = useDashboardBootstrapContext();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const lastAppliedSyncAtRef = useRef(0);

  const loadQuizzes = useCallback(async () => {
    const res = await fetch(`/api/dashboard/quizzes?courseId=${courseId}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as { quizzes?: Quiz[] };
    setQuizzes(data.quizzes ?? []);
  }, [courseId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await loadQuizzes();
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
  }, [loadQuizzes]);

  useEffect(() => {
    if (!bootstrap?.lastAutoSyncAt || loading) return;
    if (lastAppliedSyncAtRef.current === 0) {
      lastAppliedSyncAtRef.current = bootstrap.lastAutoSyncAt;
      return;
    }
    if (bootstrap.lastAutoSyncAt <= lastAppliedSyncAtRef.current) {
      return;
    }
    lastAppliedSyncAtRef.current = bootstrap.lastAutoSyncAt;
    async function refreshFromBootstrap() {
      try {
        await loadQuizzes();
      } catch {
        // silent
      }
    }
    void refreshFromBootstrap();
  }, [bootstrap?.lastAutoSyncAt, loadQuizzes, loading]);

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 0 }}>
          Quiz Assignments
        </h1>
      </div>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {loading
          ? "Loading quizzes..."
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
              No quiz assignments found for this course yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
