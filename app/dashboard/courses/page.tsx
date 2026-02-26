"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboardBootstrapContext } from "@/components/layout/dashboard-bootstrap-context";
import { routes } from "@/lib/routes";

interface Course {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  lastSynced: string | null;
}

export default function CoursesPage() {
  const { bootstrap, runningBootstrap, runBootstrap } =
    useDashboardBootstrapContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const lastAppliedSyncAtRef = useRef(0);

  const loadCourses = useCallback(async () => {
    const res = await fetch("/api/dashboard/courses", { cache: "no-store" });
    const data = (await res.json()) as { courses?: Course[] };
    setCourses(data.courses ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await loadCourses();
      } catch {
        // silent
      }
      if (!cancelled) {
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [loadCourses]);

  useEffect(() => {
    if (!bootstrap?.lastAutoSyncAt || loading) return;
    if (lastAppliedSyncAtRef.current === 0) {
      lastAppliedSyncAtRef.current = bootstrap.lastAutoSyncAt;
      return;
    }
    if (bootstrap.lastAutoSyncAt <= lastAppliedSyncAtRef.current) {
      return;
    }
    lastAppliedSyncAtRef.current = bootstrap.lastAutoSyncAt;
    async function refreshFromBootstrap() {
      try {
        await loadCourses();
      } catch {
        // silent
      }
    }
    void refreshFromBootstrap();
  }, [bootstrap?.lastAutoSyncAt, loadCourses, loading]);

  async function syncCourses() {
    try {
      await runBootstrap("refresh");
    } catch {
      // silent
    }
  }

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Courses
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {loading
          ? "Loading..."
          : courses.length > 0
            ? `${courses.length} course(s) from Google Classroom`
            : bootstrap?.bootstrapStatus === "syncing" || runningBootstrap
              ? "Preparing courses from Google Classroom..."
              : bootstrap?.bootstrapStatus === "error"
                ? "Could not refresh courses. Retry to continue."
                : "No courses available yet."}
      </p>

      <div
        className="edu-fade-in edu-fd1"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
      >
        {courses.map((course) => (
          <Link key={course.id} href={routes.course(course.id)} style={{ textDecoration: "none" }}>
            <div
              className="edu-card"
              style={{
                padding: "20px 20px 20px 24px",
                borderLeft: "4px solid #6E4836",
                cursor: "pointer",
                height: "100%",
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>{course.name}</p>
              {course.section && (
                <p className="edu-muted" style={{ fontSize: 13, margin: "0 0 14px" }}>{course.section}</p>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#A96842", fontWeight: 500 }}>
                  {course.studentCount} students
                </span>
                <span className={`edu-badge ${course.lastSynced ? "edu-badge-low" : "edu-badge-high"}`}>
                  {course.lastSynced ? "Synced" : "Pending"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!loading && courses.length === 0 && (
        <div className="edu-card" style={{ padding: 32, textAlign: "center" }}>
          <p className="edu-muted" style={{ marginBottom: 14 }}>
            {bootstrap?.bootstrapStatus === "syncing" || runningBootstrap
              ? "Preparing your courses. This usually takes less than a minute."
              : "No courses found. Refresh from Classroom to get started."}
          </p>
          <button className="edu-btn" onClick={syncCourses} disabled={runningBootstrap}>
            {runningBootstrap ? "Refreshing..." : "Retry Sync"}
          </button>
          {bootstrap?.lastBootstrapError && (
            <p style={{ fontSize: 12, color: "#A63D2E", marginTop: 10 }}>
              {bootstrap.lastBootstrapError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
