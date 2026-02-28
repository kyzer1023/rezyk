"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { routes, type QuizWorkspaceView } from "@/lib/routes";
import {
  QuizAnalysisPanel,
  QuizInsightsPanel,
  QuizStudentDetailPanel,
  QuizStudentsPanel,
} from "./quiz-workspace-panels";

const VIEW_TABS: Array<{ id: QuizWorkspaceView; label: string }> = [
  { id: "analysis", label: "Sync & Analyze" },
  { id: "insights", label: "Insights" },
  { id: "students", label: "Students" },
];

function getViewFromQuery(rawView: string | null): QuizWorkspaceView {
  if (rawView === "insights") return "insights";
  if (rawView === "students") return "students";
  return "analysis";
}

export default function QuizWorkspacePage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId, quizId } = use(params);
  const searchParams = useSearchParams();
  const view = getViewFromQuery(searchParams.get("view"));
  const [quizTitle, setQuizTitle] = useState<string>(quizId);
  const rawStudentId = searchParams.get("studentId");
  const studentId = rawStudentId && rawStudentId.trim().length > 0 ? rawStudentId : null;

  useEffect(() => {
    let cancelled = false;

    async function loadQuizTitle() {
      try {
        const response = await fetch(`/api/dashboard/quizzes?courseId=${courseId}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          quizzes?: Array<{ id: string; title: string }>;
        };
        const match = (payload.quizzes ?? []).find((quiz) => quiz.id === quizId);
        if (!cancelled && match?.title) {
          setQuizTitle(match.title);
        }
      } catch {
        // keep fallback title from quiz id
      }
    }

    void loadQuizTitle();
    return () => {
      cancelled = true;
    };
  }, [courseId, quizId]);

  return (
    <div>
      <div className="edu-fade-in" style={{ marginBottom: 12 }}>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 4 }}>
          {quizTitle}
        </h1>
      </div>

      <div className="edu-fade-in" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {VIEW_TABS.map((tab) => (
          <Link key={tab.id} href={routes.quizWorkspace(courseId, quizId, { view: tab.id })}>
            <button
              className={view === tab.id ? "edu-btn" : "edu-btn-outline"}
              style={{ fontSize: 12, padding: "6px 14px" }}
            >
              {tab.label}
            </button>
          </Link>
        ))}
        {view === "students" && studentId && (
          <Link href={routes.quizWorkspace(courseId, quizId, { view: "students" })}>
            <button className="edu-btn-outline" style={{ fontSize: 12, padding: "6px 14px" }}>
              Back to Student List
            </button>
          </Link>
        )}
      </div>

      {view === "analysis" && (
        <QuizAnalysisPanel courseId={courseId} quizId={quizId} />
      )}
      {view === "insights" && (
        <QuizInsightsPanel courseId={courseId} quizId={quizId} />
      )}
      {view === "students" && (
        !studentId ? (
          <QuizStudentsPanel courseId={courseId} quizId={quizId} />
        ) : (
          <QuizStudentDetailPanel courseId={courseId} quizId={quizId} studentId={studentId} />
        )
      )}
    </div>
  );
}
