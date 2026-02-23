"use client";

import Link from "next/link";
import { mockCourses, getQuizzesForCourse } from "@/lib/mock-data";

export default function R2Courses() {
  return (
    <div>
      <h1 className="r2-heading r2-chalk-write" style={{ fontSize: 22, marginBottom: 20, fontWeight: 500 }}>
        Your Courses
      </h1>
      <div style={{ display: "grid", gap: 12 }}>
        {mockCourses.map((course, i) => {
          const quizzes = getQuizzesForCourse(course.id);
          return (
            <Link
              key={course.id}
              href={`/2/dashboard/courses/${course.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className={`r2-card r2-fade-in ${i > 0 ? `r2-fade-in-d${i}` : ""}`}
                style={{ padding: 22, cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3
                      className="r2-heading"
                      style={{ fontSize: 17, marginBottom: 4, fontWeight: 500 }}
                    >
                      {course.name}
                    </h3>
                    <p style={{ color: "rgba(232,229,216,0.5)", fontSize: 13, marginBottom: 12 }}>
                      {course.section}
                    </p>
                  </div>
                  <span
                    className={`r2-badge r2-badge-${course.lastSynced ? "synced" : "not_synced"}`}
                  >
                    {course.lastSynced ? "Synced" : "Not Synced"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 20, fontSize: 13, color: "rgba(232,229,216,0.6)" }}>
                  <span>
                    <strong style={{ color: "#8BA878" }}>{course.studentCount}</strong> students
                  </span>
                  <span>
                    <strong style={{ color: "#90CAF9" }}>{quizzes.length}</strong> quizzes
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
