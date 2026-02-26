"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, use } from "react";
import { useDashboardBootstrapContext } from "@/components/layout/dashboard-bootstrap-context";
import { RefreshingOverlay, SkeletonBox } from "@/components/ui/loading-states";
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
  responseCount: number;
  totalStudents: number;
  syncStatus: string;
  analysisStatus: string;
  lastSynced: string | null;
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { bootstrap } = useDashboardBootstrapContext();
  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastAppliedSyncAtRef = useRef(0);

  const loadCourseData = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "refresh") {
      setRefreshing(true);
    }
    try {
      const [cRes, qRes] = await Promise.all([
        fetch("/api/dashboard/courses", { cache: "no-store" }),
        fetch(`/api/dashboard/quizzes?courseId=${courseId}`, { cache: "no-store" }),
      ]);
      const cData = (await cRes.json()) as { courses?: Course[] };
      const qData = (await qRes.json()) as { quizzes?: Quiz[] };
      const found = (cData.courses ?? []).find((item) => item.id === courseId);
      setCourse(found ?? null);
      setQuizzes(qData.quizzes ?? []);
    } finally {
      if (mode === "refresh") {
        setRefreshing(false);
      }
    }
  }, [courseId]);

  useEffect(() => {
    async function load() {
      try {
        await loadCourseData("initial");
      } catch {
        // silent
      } finally {
        setInitialLoading(false);
      }
    }
    void load();
  }, [loadCourseData]);

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
        await loadCourseData("refresh");
      } catch {
        // silent
      }
    }
    void refreshFromBootstrap();
  }, [bootstrap?.lastAutoSyncAt, initialLoading, loadCourseData]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
            {initialLoading ? "Loading course..." : course?.name ?? "Course"}
          </h1>
          <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14 }}>
            {initialLoading
              ? "Loading class details..."
              : `${course?.section ? `${course.section} · ` : ""}${course?.studentCount ?? 0} students`}
          </p>
        </div>
        <div className="edu-fade-in" style={{ display: "flex", gap: 8 }}>
          <Link href={routes.quizzes(courseId)}>
            <button className="edu-btn" style={{ fontSize: 13, padding: "8px 18px" }}>
              Quiz List
            </button>
          </Link>
          <Link href={routes.history(courseId)}>
            <button className="edu-btn-outline" style={{ fontSize: 13, padding: "8px 18px" }}>
              History
            </button>
          </Link>
        </div>
      </div>

      {initialLoading ? (
        <div
          className="edu-fade-in edu-fd2"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`course-quiz-skeleton-${index}`} className="edu-card" style={{ padding: 20 }}>
              <SkeletonBox width="72%" height={16} style={{ marginBottom: 10 }} />
              <SkeletonBox width="56%" style={{ marginBottom: 18 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SkeletonBox width="24%" />
                <SkeletonBox width="20%" height={30} radius={6} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="edu-refresh-layer edu-fade-in edu-fd2"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="edu-card"
              style={{
                padding: "20px 20px 20px 24px",
                borderLeft: "4px solid #6E4836",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>{quiz.title}</p>
              <p className="edu-muted" style={{ fontSize: 12, margin: "0 0 4px" }}>
                {quiz.lastSynced
                  ? `Due ${new Date(quiz.lastSynced).toISOString().slice(0, 10)}`
                  : "No due date"}
                {" · "}
                {quiz.responseCount}/{quiz.totalStudents} responses
              </p>
              <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  className={`edu-badge edu-badge-${
                    quiz.analysisStatus === "completed" ? "low" : quiz.analysisStatus === "running" ? "medium" : "high"
                  }`}
                >
                  {quiz.analysisStatus === "completed" ? "Analyzed" : quiz.analysisStatus === "running" ? "Running" : "Pending"}
                </span>
                <Link href={routes.quizWorkspace(courseId, quiz.id, { view: "analysis" })}>
                  <button className="edu-btn-outline" style={{ padding: "4px 14px", fontSize: 12 }}>
                    Open
                  </button>
                </Link>
              </div>
            </div>
          ))}
          <RefreshingOverlay show={refreshing} label="Refreshing quiz cards..." />
        </div>
      )}

      {!initialLoading && quizzes.length === 0 && (
        <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 32, textAlign: "center" }}>
          <p className="edu-muted" style={{ fontSize: 13 }}>
            No quizzes found. Sync to import from Google Classroom.
          </p>
        </div>
      )}
    </div>
  );
}
