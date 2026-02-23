"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getCourseById, getQuizzesForCourse } from "@/lib/mock-data";

export default function R1CourseOverview() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = getCourseById(courseId);

  if (!course) {
    return <p>Course not found.</p>;
  }

  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <div className="r1-fade-in" style={{ marginBottom: 24 }}>
        <h1 className="r1-heading" style={{ fontSize: 24, marginBottom: 4 }}>{course.name}</h1>
        <p style={{ color: "#8B7E7E", fontSize: 15 }}>{course.section} &mdash; {course.studentCount} students</p>
      </div>

      <div className="r1-fade-in r1-fade-in-delay-1" style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <Link href={`/1/dashboard/courses/${courseId}/quizzes`}>
          <button className="r1-btn">Open Quiz List</button>
        </Link>
        <Link href={`/1/dashboard/courses/${courseId}/history`}>
          <button className="r1-btn-outline">View Course History</button>
        </Link>
        <Link href="/1/dashboard">
          <button className="r1-btn-outline">Back to Dashboard</button>
        </Link>
      </div>

      <h3 className="r1-heading r1-fade-in r1-fade-in-delay-2" style={{ fontSize: 18, marginBottom: 16 }}>Recent Quizzes</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {quizzes.map((quiz, i) => (
          <div key={quiz.id} className={`r1-card r1-fade-in r1-fade-in-delay-${Math.min(i + 2, 4)}`} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{quiz.title}</p>
                <p style={{ fontSize: 13, color: "#8B7E7E" }}>
                  Due: {quiz.dueDate} &mdash; {quiz.responseCount}/{quiz.totalStudents} responses
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className={`r1-badge r1-badge-${quiz.syncStatus}`}>
                  {quiz.syncStatus === "synced" ? "Synced" : quiz.syncStatus === "not_synced" ? "Not Synced" : quiz.syncStatus}
                </span>
                <span className={`r1-badge r1-badge-${quiz.analysisStatus}`}>
                  {quiz.analysisStatus === "completed" ? "Analyzed" : quiz.analysisStatus === "not_started" ? "Pending" : quiz.analysisStatus}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
