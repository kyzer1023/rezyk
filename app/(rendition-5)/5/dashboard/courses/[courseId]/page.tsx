"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getCourseById, getQuizzesForCourse } from "@/lib/mock-data";

export default function R5CourseOverview() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = getCourseById(courseId);
  if (!course) return <p style={{ color: "#94A3B8" }}>Course not found.</p>;
  const quizzes = getQuizzesForCourse(courseId);

  return (
    <div>
      <div className="r5-slide-in" style={{ marginBottom: 18 }}>
        <h1 className="r5-heading" style={{ fontSize: 20, marginBottom: 3 }}>{course.name}</h1>
        <p style={{ color: "#64748B", fontSize: 13 }}>{course.section} &mdash; {course.studentCount} students</p>
      </div>
      <div className="r5-slide-in r5-sd1" style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <Link href={`/5/dashboard/courses/${courseId}/quizzes`}><button className="r5-btn">Quiz List</button></Link>
        <Link href={`/5/dashboard/courses/${courseId}/history`}><button className="r5-btn-outline">History</button></Link>
        <Link href="/5/dashboard"><button className="r5-btn-outline">Back</button></Link>
      </div>
      <h3 className="r5-heading r5-slide-in r5-sd2" style={{ fontSize: 15, marginBottom: 10 }}>Recent Quizzes</h3>
      {quizzes.map((q) => (
        <div key={q.id} className="r5-card" style={{ padding: 16, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{q.title}</p>
              <p style={{ fontSize: 12, color: "#64748B" }}>Due: {q.dueDate} &mdash; {q.responseCount}/{q.totalStudents}</p>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <span className={`r5-badge r5-badge-${q.syncStatus}`}>{q.syncStatus === "synced" ? "Synced" : "Not Synced"}</span>
              <span className={`r5-badge r5-badge-${q.analysisStatus}`}>{q.analysisStatus === "completed" ? "Analyzed" : "Pending"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
