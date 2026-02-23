"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizzesForCourse } from "@/lib/mock-data";

export default function R5Quizzes() {
  const { courseId } = useParams<{ courseId: string }>();
  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <h1 className="r5-heading r5-slide-in" style={{ fontSize: 20, marginBottom: 18 }}>Quizzes</h1>
      {quizzes.map((q) => (
        <div key={q.id} className="r5-card" style={{ padding: 20, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
            <div>
              <h3 className="r5-heading" style={{ fontSize: 15, marginBottom: 3 }}>{q.title}</h3>
              <p style={{ color: "#64748B", fontSize: 12 }}>Due: {q.dueDate} &mdash; {q.responseCount}/{q.totalStudents}</p>
            </div>
            <span className={`r5-badge r5-badge-${q.syncStatus}`}>{q.syncStatus === "synced" ? "Synced" : "Not Synced"}</span>
          </div>
          <Link href={`/5/dashboard/courses/${courseId}/quizzes/${q.id}/sync`}><button className="r5-btn">Start Workflow</button></Link>
        </div>
      ))}
    </div>
  );
}
