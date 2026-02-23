"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizzesForCourse } from "@/lib/mock-data";

export default function R3Quizzes() {
  const { courseId } = useParams<{ courseId: string }>();
  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <h1 className="r3-heading r3-fade-in" style={{ fontSize: 22, marginBottom: 20 }}>Quizzes</h1>
      <div style={{ display: "grid", gap: 12 }}>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="r3-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
              <div>
                <h3 className="r3-heading" style={{ fontSize: 16, marginBottom: 4 }}>{quiz.title}</h3>
                <p className="r3-muted" style={{ fontSize: 13 }}>Due: {quiz.dueDate} &mdash; {quiz.responseCount}/{quiz.totalStudents} responses</p>
              </div>
              <span className={`r3-badge r3-badge-${quiz.syncStatus}`}>{quiz.syncStatus === "synced" ? "Synced" : "Not Synced"}</span>
            </div>
            <Link href={`/3/dashboard/courses/${courseId}/quizzes/${quiz.id}/sync`}>
              <button className="r3-btn">Start Workflow</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
