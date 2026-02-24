"use client";

import Link from "next/link";
import { mockCourses, getQuizzesForCourse } from "@/lib/mock-data";
import { routes } from "@/lib/routes";

export default function CoursesPage() {
  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 20 }}>
        Your Courses
      </h1>
      <div style={{ display: "grid", gap: 12 }}>
        {mockCourses.map((course, index) => {
          const quizzes = getQuizzesForCourse(course.id);
          return (
            <Link key={course.id} href={routes.course(course.id)} style={{ textDecoration: "none", color: "inherit" }}>
              <div className={`edu-card edu-fade-in ${index > 0 ? `edu-fd${index}` : ""}`} style={{ padding: 22, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 4 }}>
                      {course.name}
                    </h3>
                    <p className="edu-muted" style={{ fontSize: 13, marginBottom: 12 }}>
                      {course.section}
                    </p>
                  </div>
                  <span className={`edu-badge edu-badge-${course.lastSynced ? "synced" : "not_synced"}`}>
                    {course.lastSynced ? "Synced" : "Not Synced"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#8A7D6F" }}>
                  <span>
                    <strong style={{ color: "#C17A56" }}>{course.studentCount}</strong> students
                  </span>
                  <span>
                    <strong style={{ color: "#6B8E5C" }}>{quizzes.length}</strong> quizzes
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
