"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getCourseById, getQuizzesForCourse } from "@/lib/mock-data";

export default function R2CourseOverview() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = getCourseById(courseId);
  if (!course) return <p className="r2-chalk">Course not found.</p>;
  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <div className="r2-fade-in" style={{ marginBottom: 20 }}>
        <h1 className="r2-heading" style={{ fontSize: 22, marginBottom: 4, fontWeight: 500 }}>
          {course.name}
        </h1>
        <p style={{ color: "rgba(232,229,216,0.5)", fontSize: 14 }}>
          {course.section} &mdash; {course.studentCount} students
        </p>
      </div>

      <div className="r2-fade-in r2-fade-in-d1" style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <Link href={`/2/dashboard/courses/${courseId}/quizzes`}>
          <button className="r2-btn">Open Quiz List</button>
        </Link>
        <Link href={`/2/dashboard/courses/${courseId}/history`}>
          <button className="r2-btn-outline">View History</button>
        </Link>
        <Link href="/2/dashboard">
          <button className="r2-btn-outline">Back</button>
        </Link>
      </div>

      <h3
        className="r2-heading r2-fade-in r2-fade-in-d2"
        style={{ fontSize: 17, marginBottom: 14, fontWeight: 500 }}
      >
        Recent Quizzes
      </h3>
      <div style={{ display: "grid", gap: 10 }}>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="r2-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p className="r2-chalk" style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                  {quiz.title}
                </p>
                <p style={{ fontSize: 13, color: "rgba(232,229,216,0.5)" }}>
                  Due: {quiz.dueDate} &mdash; {quiz.responseCount}/{quiz.totalStudents}
                </p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span className={`r2-badge r2-badge-${quiz.syncStatus}`}>
                  {quiz.syncStatus === "synced" ? "Synced" : "Not Synced"}
                </span>
                <span className={`r2-badge r2-badge-${quiz.analysisStatus}`}>
                  {quiz.analysisStatus === "completed" ? "Analyzed" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
