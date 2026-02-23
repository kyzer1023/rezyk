"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getCourseById, getQuizzesForCourse } from "@/lib/mock-data";

export default function R3CourseOverview() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = getCourseById(courseId);
  if (!course) return <p>Course not found.</p>;
  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <div className="r3-fade-in" style={{ marginBottom: 20 }}>
        <h1 className="r3-heading" style={{ fontSize: 22, marginBottom: 4 }}>{course.name}</h1>
        <p className="r3-muted" style={{ fontSize: 14 }}>{course.section} &mdash; {course.studentCount} students</p>
      </div>

      <div className="r3-fade-in r3-fd1" style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <Link href={`/3/dashboard/courses/${courseId}/quizzes`}><button className="r3-btn">Open Quiz List</button></Link>
        <Link href={`/3/dashboard/courses/${courseId}/history`}><button className="r3-btn-outline">View History</button></Link>
        <Link href="/3/dashboard"><button className="r3-btn-outline">Back</button></Link>
      </div>

      <h3 className="r3-heading r3-fade-in r3-fd2" style={{ fontSize: 17, marginBottom: 14 }}>Recent Quizzes</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="r3-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{quiz.title}</p>
                <p className="r3-muted" style={{ fontSize: 13 }}>Due: {quiz.dueDate} &mdash; {quiz.responseCount}/{quiz.totalStudents}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span className={`r3-badge r3-badge-${quiz.syncStatus}`}>{quiz.syncStatus === "synced" ? "Synced" : "Not Synced"}</span>
                <span className={`r3-badge r3-badge-${quiz.analysisStatus}`}>{quiz.analysisStatus === "completed" ? "Analyzed" : "Pending"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
