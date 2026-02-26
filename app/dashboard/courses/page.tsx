"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { routes } from "@/lib/routes";

interface Course {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  lastSynced: string | null;
}

interface BootstrapStatusResponse {
  hasInitialSync: boolean;
  bootstrapStatus: "pending" | "syncing" | "completed" | "error";
  lastAutoSyncAt: number;
  lastBootstrapError: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [bootstrap, setBootstrap] = useState<BootstrapStatusResponse | null>(null);

  const loadCourses = useCallback(async () => {
    const res = await fetch("/api/dashboard/courses", { cache: "no-store" });
    const data = (await res.json()) as { courses?: Course[] };
    setCourses(data.courses ?? []);
  }, []);

  const loadBootstrapStatus = useCallback(async () => {
    const res = await fetch("/api/bootstrap/status", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as BootstrapStatusResponse;
    setBootstrap(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await Promise.all([loadCourses(), loadBootstrapStatus()]);
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
  }, [loadBootstrapStatus, loadCourses]);

  useEffect(() => {
    if (bootstrap?.bootstrapStatus !== "syncing") return;
    const interval = window.setInterval(() => {
      void Promise.all([loadCourses(), loadBootstrapStatus()]);
    }, 2500);
    return () => {
      window.clearInterval(interval);
    };
  }, [bootstrap, loadBootstrapStatus, loadCourses]);

  async function syncCourses() {
    setSyncing(true);
    try {
      await fetch("/api/bootstrap/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "refresh", analyzeLimit: 0 }),
      });
      await Promise.all([loadCourses(), loadBootstrapStatus()]);
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
          {syncing ? "Refreshing..." : "Refresh from Classroom"}
        </button>
      </div>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {loading
          ? "Loading..."
          : courses.length > 0
            ? `${courses.length} course(s) from Google Classroom`
            : bootstrap?.bootstrapStatus === "syncing" || syncing
              ? "Preparing courses from Google Classroom..."
              : bootstrap?.bootstrapStatus === "error"
                ? "Could not refresh courses. Retry to continue."
                : "No courses available yet."}
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
            <p className="edu-muted" style={{ marginBottom: 14 }}>
              {bootstrap?.bootstrapStatus === "syncing" || syncing
                ? "Preparing your courses. This usually takes less than a minute."
                : "No courses found. Refresh from Classroom to get started."}
            </p>
            <button className="edu-btn" onClick={syncCourses} disabled={syncing}>
              {syncing ? "Refreshing..." : "Retry Sync"}
            </button>
            {bootstrap?.lastBootstrapError && (
              <p style={{ fontSize: 12, color: "#A63D2E", marginTop: 10 }}>
                {bootstrap.lastBootstrapError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
