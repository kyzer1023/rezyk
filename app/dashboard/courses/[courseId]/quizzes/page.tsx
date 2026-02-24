"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizzesForCourse } from "@/lib/mock-data";
import { routes } from "@/lib/routes";

export default function QuizzesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 20 }}>
        Quizzes
      </h1>
      <div style={{ display: "grid", gap: 12 }}>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="edu-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
              <div>
                <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 4 }}>
                  {quiz.title}
                </h3>
                <p className="edu-muted" style={{ fontSize: 13 }}>
                  Due: {quiz.dueDate} &mdash; {quiz.responseCount}/{quiz.totalStudents} responses
                </p>
              </div>
              <span className={`edu-badge edu-badge-${quiz.syncStatus}`}>{quiz.syncStatus === "synced" ? "Synced" : "Not Synced"}</span>
            </div>
            <Link href={routes.sync(courseId, quiz.id)}>
              <button className="edu-btn">Start Workflow</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
