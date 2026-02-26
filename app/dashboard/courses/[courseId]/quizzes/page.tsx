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

  useEffect(() => {
    fetch(`/api/dashboard/quizzes?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => setQuizzes(data.quizzes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Quiz Assignments
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {loading ? "Loading…" : `${quizzes.length} quiz(es) with linked Google Forms`}
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
                  <Link href={routes.insights(courseId, quiz.id)}>
                    <button className="edu-btn" style={{ padding: "6px 16px", fontSize: 13 }}>
                      View Insights
                    </button>
                  </Link>
                ) : (
                  <Link href={routes.sync(courseId, quiz.id)}>
                    <button className="edu-btn" style={{ padding: "6px 16px", fontSize: 13 }}>
                      Start Workflow
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && quizzes.length === 0 && (
          <div className="edu-card" style={{ padding: 32, textAlign: "center" }}>
            <p className="edu-muted">No quiz assignments found for this course.</p>
          </div>
        )}
      </div>
    </div>
  );
}
