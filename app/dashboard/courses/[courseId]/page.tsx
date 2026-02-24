"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getCourseById, getQuizzesForCourse } from "@/lib/mock-data";
import { routes } from "@/lib/routes";

export default function CourseOverviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = getCourseById(courseId);
  if (!course) {
    return <p>Course not found.</p>;
  }
  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <div className="edu-fade-in" style={{ marginBottom: 20 }}>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 4 }}>
          {course.name}
        </h1>
        <p className="edu-muted" style={{ fontSize: 14 }}>
          {course.section} &mdash; {course.studentCount} students
        </p>
      </div>

      <div className="edu-fade-in edu-fd1" style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <Link href={routes.quizzes(courseId)}>
          <button className="edu-btn">Open Quiz List</button>
        </Link>
        <Link href={routes.history(courseId)}>
          <button className="edu-btn-outline">View History</button>
        </Link>
        <Link href={routes.dashboard()}>
          <button className="edu-btn-outline">Back</button>
        </Link>
      </div>

      <h3 className="edu-heading edu-fade-in edu-fd2" style={{ fontSize: 17, marginBottom: 14 }}>
        Recent Quizzes
      </h3>
      <div style={{ display: "grid", gap: 10 }}>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="edu-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{quiz.title}</p>
                <p className="edu-muted" style={{ fontSize: 13 }}>
                  Due: {quiz.dueDate} &mdash; {quiz.responseCount}/{quiz.totalStudents}
                </p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span className={`edu-badge edu-badge-${quiz.syncStatus}`}>{quiz.syncStatus === "synced" ? "Synced" : "Not Synced"}</span>
                <span className={`edu-badge edu-badge-${quiz.analysisStatus}`}>{quiz.analysisStatus === "completed" ? "Analyzed" : "Pending"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
