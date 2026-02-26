"use client";

import Link from "next/link";
import { use } from "react";
import { useSearchParams } from "next/navigation";
import { routes, type QuizWorkspaceView } from "@/lib/routes";
import {
  QuizAnalysisPanel,
  QuizInsightsPanel,
  QuizStudentDetailPanel,
  QuizStudentsPanel,
  QuizSyncPanel,
} from "./quiz-workspace-panels";

const VIEW_TABS: Array<{ id: QuizWorkspaceView; label: string }> = [
  { id: "sync", label: "Sync" },
  { id: "analysis", label: "Analysis" },
  { id: "insights", label: "Insights" },
  { id: "students", label: "Students" },
];

function getViewFromQuery(rawView: string | null): QuizWorkspaceView {
  if (rawView === "analysis") return "analysis";
  if (rawView === "insights") return "insights";
  if (rawView === "students") return "students";
  return "sync";
}

export default function QuizWorkspacePage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId, quizId } = use(params);
  const searchParams = useSearchParams();
  const view = getViewFromQuery(searchParams.get("view"));
  const rawStudentId = searchParams.get("studentId");
  const studentId = rawStudentId && rawStudentId.trim().length > 0 ? rawStudentId : null;

  return (
    <div>
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

      {view === "sync" && <QuizSyncPanel courseId={courseId} quizId={quizId} />}
      {view === "analysis" && <QuizAnalysisPanel courseId={courseId} quizId={quizId} />}
      {view === "insights" && <QuizInsightsPanel courseId={courseId} quizId={quizId} />}
      {view === "students" && !studentId && <QuizStudentsPanel courseId={courseId} quizId={quizId} />}
      {view === "students" && studentId && (
        <QuizStudentDetailPanel courseId={courseId} quizId={quizId} studentId={studentId} />
      )}
    </div>
  );
}
