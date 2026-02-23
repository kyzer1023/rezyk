"use client";

import Link from "next/link";
import { mockCourses, getQuizzesForCourse } from "@/lib/mock-data";

export default function R5Courses() {
  return (
    <div>
      <h1 className="r5-heading r5-slide-in" style={{ fontSize: 20, marginBottom: 18 }}>Your Courses</h1>
      <div style={{ display: "grid", gap: 12 }}>
        {mockCourses.map((course) => {
          const quizzes = getQuizzesForCourse(course.id);
          return (
            <Link key={course.id} href={`/5/dashboard/courses/${course.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="r5-card" style={{ padding: 20, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 className="r5-heading" style={{ fontSize: 16, marginBottom: 3 }}>{course.name}</h3>
                    <p style={{ color: "#64748B", fontSize: 13, marginBottom: 10 }}>{course.section}</p>
                  </div>
                  <span className={`r5-badge r5-badge-${course.lastSynced ? "synced" : "not_synced"}`}>{course.lastSynced ? "Synced" : "Not Synced"}</span>
                </div>
                <div style={{ display: "flex", gap: 18, fontSize: 12, color: "#94A3B8" }}>
                  <span><strong>{course.studentCount}</strong> students</span>
                  <span><strong>{quizzes.length}</strong> quizzes</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
