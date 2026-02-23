"use client";

import Link from "next/link";
import { mockCourses, getQuizzesForCourse } from "@/lib/mock-data";

export default function R4Courses() {
  return (
    <div>
      <h1 className="r4-heading r4-fade-in" style={{ fontSize: 22, marginBottom: 20 }}>Your Courses</h1>
      <div style={{ display: "grid", gap: 12 }}>
        {mockCourses.map((course, i) => {
          const quizzes = getQuizzesForCourse(course.id);
          return (
            <Link key={course.id} href={`/4/dashboard/courses/${course.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className={`r4-card r4-fade-in ${i > 0 ? `r4-fd${i}` : ""}`} style={{ padding: 22, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 className="r4-heading" style={{ fontSize: 17, marginBottom: 4 }}>{course.name}</h3>
                    <p className="r4-muted" style={{ fontSize: 13, marginBottom: 12 }}>{course.section}</p>
                  </div>
                  <span className={`r4-badge r4-badge-${course.lastSynced ? "synced" : "not_synced"}`}>
                    {course.lastSynced ? "Synced" : "Not Synced"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#7A8A98" }}>
                  <span><strong style={{ color: "#5C7D99" }}>{course.studentCount}</strong> students</span>
                  <span><strong style={{ color: "#3A7D5E" }}>{quizzes.length}</strong> quizzes</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
