"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboardBootstrapContext } from "@/components/layout/dashboard-bootstrap-context";
import {
  MetricCardsSkeleton,
  RefreshingOverlay,
  SkeletonBox,
} from "@/components/ui/loading-states";
import { routes } from "@/lib/routes";

interface Course {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  lastSynced: string | null;
}

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  analysisStatus: string;
  responseCount: number;
  totalStudents: number;
}

function getPerformanceColor(value: number): string {
  if (value >= 75) return "#2E7D4B";
  if (value >= 55) return "#A25E1A";
  return "#A63D2E";
}

export default function DashboardPage() {
  const { bootstrap, runningBootstrap } = useDashboardBootstrapContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastAppliedSyncAtRef = useRef(0);

  const loadDashboardData = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "refresh") {
      setRefreshing(true);
    }
    try {
      const [cRes, qRes] = await Promise.all([
        fetch("/api/dashboard/courses", { cache: "no-store" }),
        fetch("/api/dashboard/quizzes", { cache: "no-store" }),
      ]);
      const cData = (await cRes.json()) as { courses?: Course[] };
      const qData = (await qRes.json()) as { quizzes?: Quiz[] };
      setCourses(cData.courses ?? []);
      setQuizzes(qData.quizzes ?? []);
    } finally {
      if (mode === "refresh") {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await loadDashboardData("initial");
      } catch {
        // silent
      }
      if (!cancelled) {
        setInitialLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [loadDashboardData]);

  useEffect(() => {
    if (!bootstrap?.lastAutoSyncAt || initialLoading) return;
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
        await loadDashboardData("refresh");
      } catch {
        // silent
      }
    }
    void refreshFromBootstrap();
  }, [bootstrap?.lastAutoSyncAt, initialLoading, loadDashboardData]);

  const analyzedCount = quizzes.filter((q) => q.analysisStatus === "completed").length;
  const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
  const totalResponses = quizzes.reduce((sum, q) => sum + q.responseCount, 0);
  const totalPossible = quizzes.reduce((sum, q) => sum + q.totalStudents, 0);
  const completionRate = totalPossible > 0 ? Math.round((totalResponses / totalPossible) * 100) : 0;
  const lastCourse = courses[0];
  const hasNoDashboardData = courses.length === 0 && quizzes.length === 0;
  const bootstrapPending = !bootstrap || bootstrap.bootstrapStatus === "pending";
  const bootstrapSyncing = bootstrap?.bootstrapStatus === "syncing" || runningBootstrap;
  const showMetricSkeleton =
    initialLoading ||
    (hasNoDashboardData && (bootstrapPending || bootstrapSyncing || refreshing));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <h1 className="edu-heading edu-fade-in" style={{ fontSize: 26 }}>
          Dashboard
        </h1>
      </div>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 28 }}>
        {initialLoading
          ? "Getting your class overview ready..."
          : courses.length > 0
            ? "Your classroom overview at a glance."
            : bootstrapSyncing
              ? "Preparing your classroom data in the background..."
              : bootstrap?.bootstrapStatus === "error"
                ? "Data sync needs attention. Retry refresh to continue."
                : "Setting up your classroom data..."}
      </p>

      {showMetricSkeleton ? (
        <div className="edu-fade-in edu-fd1" style={{ marginBottom: 28 }}>
          <MetricCardsSkeleton />
        </div>
      ) : (
        <div className="edu-refresh-layer edu-fade-in edu-fd1" style={{ marginBottom: 28 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
          >
            {[
              { label: "Courses", value: String(courses.length), accent: "#6E4836" },
              { label: "Analyzed", value: String(analyzedCount), accent: "#3D7A2E" },
              { label: "Students", value: String(totalStudents), accent: "#366C9A" },
              { label: "Completion", value: `${completionRate}%`, accent: getPerformanceColor(completionRate) },
            ].map((stat) => (
              <div key={stat.label} className="edu-card" style={{ padding: 22 }}>
                <p className="edu-muted" style={{ fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: 30, fontWeight: 700, color: stat.accent ?? "#3D3229", margin: 0 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <RefreshingOverlay show={refreshing} label="Updating dashboard numbers..." />
        </div>
      )}

      <div className="edu-fade-in edu-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="edu-card edu-refresh-layer" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 16 }}>
            Courses
          </h3>
          {initialLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SkeletonBox width="70%" />
              <SkeletonBox width="82%" />
              <SkeletonBox width="64%" />
              <SkeletonBox width="78%" />
            </div>
          ) : courses.length === 0 ? (
            <p className="edu-muted" style={{ fontSize: 13 }}>
              {bootstrapSyncing
                ? "Preparing your courses..."
                : "No courses synced yet."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {courses.map((course, index) => (
                <Link key={course.id} href={routes.course(course.id)} style={{ textDecoration: "none", color: "inherit" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: index < courses.length - 1 ? "1px solid #F0ECE5" : "none",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{course.name}</p>
                      <p className="edu-muted" style={{ fontSize: 12, margin: "2px 0 0" }}>
                        {course.section}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, color: "#366C9A", fontWeight: 500 }}>
                      {course.studentCount} students
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <RefreshingOverlay show={refreshing} label="Refreshing courses..." />
        </div>

        <div className="edu-card" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 16 }}>
            Quick Links
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={routes.courses()}>
              <button className="edu-btn" style={{ width: "100%" }}>
                All Courses
              </button>
            </Link>
            {initialLoading ? (
              <SkeletonBox width="100%" height={42} radius={6} />
            ) : (
              lastCourse && (
                <Link href={routes.course(lastCourse.id)}>
                  <button className="edu-btn-outline" style={{ width: "100%" }}>
                    Resume: {lastCourse.name}
                  </button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
