"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizzesForCourse } from "@/lib/mock-data";

export default function R2Quizzes() {
  const { courseId } = useParams<{ courseId: string }>();
  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <h1 className="r2-heading r2-chalk-write" style={{ fontSize: 22, marginBottom: 20, fontWeight: 500 }}>
        Quizzes
      </h1>
      <div style={{ display: "grid", gap: 12 }}>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="r2-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
              <div>
                <h3 className="r2-heading" style={{ fontSize: 16, marginBottom: 4, fontWeight: 500 }}>
                  {quiz.title}
                </h3>
                <p style={{ color: "rgba(232,229,216,0.5)", fontSize: 13 }}>
                  Due: {quiz.dueDate} &mdash; {quiz.responseCount}/{quiz.totalStudents} responses
                </p>
              </div>
              <span className={`r2-badge r2-badge-${quiz.syncStatus}`}>
                {quiz.syncStatus === "synced" ? "Synced" : "Not Synced"}
              </span>
            </div>
            <Link href={`/2/dashboard/courses/${courseId}/quizzes/${quiz.id}/sync`}>
              <button className="r2-btn">Start Workflow</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
