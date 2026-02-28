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

interface CoursesResponse {
  courses?: Course[];
  error?: string;
}

let coursesPageCache: Course[] | null = null;

function toCoursesErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  const data = payload as { error?: unknown };
  return typeof data.error === "string" && data.error.trim().length > 0
    ? data.error
    : fallback;
}

export default function CoursesPage() {
  const { bootstrap, runningBootstrap } =
    useDashboardBootstrapContext();
  const [courses, setCourses] = useState<Course[]>(() => coursesPageCache ?? []);
  const [loading, setLoading] = useState(coursesPageCache === null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastAppliedSyncAtRef = useRef(0);

  const loadCourses = useCallback(async () => {
    const res = await fetch("/api/dashboard/courses", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as CoursesResponse;
    if (!res.ok) {
      throw new Error(toCoursesErrorMessage(data, "Failed to load courses."));
    }
    const nextCourses = data.courses ?? [];
    setCourses(nextCourses);
    coursesPageCache = nextCourses;
    setLoadError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await loadCourses();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not load courses right now.";
        setLoadError(message);
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
    const hasNoCourses = courses.length === 0;
    async function refreshFromBootstrap() {
      try {
        await loadCourses();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not refresh courses right now.";
        setLoadError(message);
      }
    }
    if (lastAppliedSyncAtRef.current === 0) {
      lastAppliedSyncAtRef.current = bootstrap.lastAutoSyncAt;
      if (hasNoCourses) {
        void refreshFromBootstrap();
      }
      return;
    }
    if (bootstrap.lastAutoSyncAt <= lastAppliedSyncAtRef.current) {
      return;
    }
    lastAppliedSyncAtRef.current = bootstrap.lastAutoSyncAt;
    void refreshFromBootstrap();
  }, [bootstrap?.lastAutoSyncAt, courses.length, loadCourses, loading]);

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Courses
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {loading
          ? "Loading..."
          : loadError && courses.length === 0
            ? "Could not load courses. Try Refresh from the top bar."
          : courses.length > 0
            ? `${courses.length} course(s) from Google Classroom`
            : bootstrap?.bootstrapStatus === "syncing" || runningBootstrap
              ? "Preparing courses from Google Classroom..."
              : bootstrap?.bootstrapStatus === "error"
                ? "Could not refresh courses. Retry to continue."
                : "No courses available yet."}
      </p>

      {loadError && !loading && (
        <p className="edu-muted" style={{ fontSize: 12, marginBottom: 16, color: "#A25E1A" }}>
          {loadError}
        </p>
      )}

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
              : "No courses found yet. Use the top refresh control to sync from Classroom."}
          </p>
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
