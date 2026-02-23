"use client";

import Link from "next/link";
import { mockCourses, getQuizzesForCourse } from "@/lib/mock-data";

export default function R1Courses() {
  return (
    <div>
      <h1 className="r1-heading r1-fade-in" style={{ fontSize: 24, marginBottom: 24 }}>Your Courses</h1>
      <div style={{ display: "grid", gap: 16 }}>
        {mockCourses.map((course, i) => {
          const quizzes = getQuizzesForCourse(course.id);
          const analyzed = quizzes.filter((q) => q.analysisStatus === "completed").length;
          return (
            <Link key={course.id} href={`/1/dashboard/courses/${course.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className={`r1-card r1-fade-in r1-fade-in-delay-${i + 1}`} style={{ padding: 24, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 className="r1-heading" style={{ fontSize: 18, marginBottom: 4 }}>{course.name}</h3>
                    <p style={{ color: "#8B7E7E", fontSize: 14, marginBottom: 12 }}>{course.section}</p>
                  </div>
                  <span className={`r1-badge r1-badge-${course.lastSynced ? "synced" : "not_synced"}`}>
                    {course.lastSynced ? "Synced" : "Not Synced"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
                  <span><strong>{course.studentCount}</strong> students</span>
                  <span><strong>{quizzes.length}</strong> quizzes</span>
                  <span><strong>{analyzed}</strong> analyzed</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
