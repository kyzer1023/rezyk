"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { routes } from "@/lib/routes";

interface Course {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  lastSynced: string | null;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/dashboard/courses");
        const data = await res.json();
        if (!cancelled) setCourses(data.courses ?? []);
      } catch {
        // silent
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function syncCourses() {
    setSyncing(true);
    try {
      await fetch("/api/sync/courses", { method: "POST" });
      const res = await fetch("/api/dashboard/courses");
      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch {
      // silent
    }
    setSyncing(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22 }}>
          Courses
        </h1>
        <button
          className="edu-btn-outline"
          style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={syncCourses}
          disabled={syncing}
        >
          {syncing ? "Syncing…" : "Refresh from Classroom"}
        </button>
      </div>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {loading ? "Loading…" : `${courses.length} course(s) from Google Classroom`}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {courses.map((course) => (
          <Link key={course.id} href={routes.course(course.id)} style={{ textDecoration: "none" }}>
            <div className="edu-card edu-fade-in" style={{ padding: 20, cursor: "pointer", transition: "box-shadow 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{course.name}</p>
                  {course.section && (
                    <p className="edu-muted" style={{ fontSize: 13, margin: "4px 0 0" }}>{course.section}</p>
                  )}
                  <p className="edu-muted" style={{ fontSize: 12, margin: "6px 0 0" }}>
                    {course.studentCount} students &middot;{" "}
                    {course.lastSynced
                      ? `Synced ${new Date(course.lastSynced).toLocaleDateString()}`
                      : "Not synced"}
                  </p>
                </div>
                <span className={`edu-badge ${course.lastSynced ? "edu-badge-low" : "edu-badge-high"}`}>
                  {course.lastSynced ? "Synced" : "Not Synced"}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {!loading && courses.length === 0 && (
          <div className="edu-card" style={{ padding: 32, textAlign: "center" }}>
            <p className="edu-muted" style={{ marginBottom: 14 }}>No courses found. Sync from Google Classroom to get started.</p>
            <button className="edu-btn" onClick={syncCourses} disabled={syncing}>
              {syncing ? "Syncing…" : "Sync Courses"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
