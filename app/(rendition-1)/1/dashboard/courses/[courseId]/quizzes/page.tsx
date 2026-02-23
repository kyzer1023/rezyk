"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizzesForCourse } from "@/lib/mock-data";

export default function R1Quizzes() {
  const { courseId } = useParams<{ courseId: string }>();
  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <h1 className="r1-heading r1-fade-in" style={{ fontSize: 24, marginBottom: 24 }}>Quizzes</h1>

      <div style={{ display: "grid", gap: 16 }}>
        {quizzes.map((quiz, i) => (
          <div key={quiz.id} className={`r1-card r1-fade-in r1-fade-in-delay-${Math.min(i + 1, 4)}`} style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
              <div>
                <h3 className="r1-heading" style={{ fontSize: 17, marginBottom: 4 }}>{quiz.title}</h3>
                <p style={{ color: "#8B7E7E", fontSize: 14 }}>
                  Due: {quiz.dueDate} &mdash; {quiz.responseCount}/{quiz.totalStudents} responses
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className={`r1-badge r1-badge-${quiz.syncStatus}`}>
                  {quiz.syncStatus === "synced" ? "Synced" : "Not Synced"}
                </span>
              </div>
            </div>
            <Link href={`/1/dashboard/courses/${courseId}/quizzes/${quiz.id}/sync`}>
              <button className="r1-btn">Start Quiz Workflow</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
