"use client";

import Link from "next/link";
import { mockCourses, getQuizzesForCourse } from "@/lib/mock-data";

export default function R3Courses() {
  return (
    <div>
      <h1 className="r3-heading r3-fade-in" style={{ fontSize: 22, marginBottom: 20 }}>Your Courses</h1>
      <div style={{ display: "grid", gap: 12 }}>
        {mockCourses.map((course, i) => {
          const quizzes = getQuizzesForCourse(course.id);
          return (
            <Link key={course.id} href={`/3/dashboard/courses/${course.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className={`r3-card r3-fade-in ${i > 0 ? `r3-fd${i}` : ""}`} style={{ padding: 22, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 className="r3-heading" style={{ fontSize: 17, marginBottom: 4 }}>{course.name}</h3>
                    <p className="r3-muted" style={{ fontSize: 13, marginBottom: 12 }}>{course.section}</p>
                  </div>
                  <span className={`r3-badge r3-badge-${course.lastSynced ? "synced" : "not_synced"}`}>
                    {course.lastSynced ? "Synced" : "Not Synced"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#8A7D6F" }}>
                  <span><strong style={{ color: "#C17A56" }}>{course.studentCount}</strong> students</span>
                  <span><strong style={{ color: "#6B8E5C" }}>{quizzes.length}</strong> quizzes</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
