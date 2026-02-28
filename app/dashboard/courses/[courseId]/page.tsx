"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { useDashboardBootstrapContext } from "@/components/layout/dashboard-bootstrap-context";
import { RefreshingOverlay, SkeletonBox } from "@/components/ui/loading-states";
import { routes, type CourseDetailView } from "@/lib/routes";
import CourseMaterialPanel from "@/components/analysis/CourseMaterialPanel";
import HistoryAnalysisPanel from "@/components/analysis/HistoryAnalysisPanel";
import TrendChart from "@/lib/charts/TrendChart";

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

interface QuizAnalysisSnapshot {
  quizId: string;
  title: string;
  createdAt: number;
  averageScore: number;
  riskDistribution: { riskLevel: string; count: number; percentage: number }[];
  topWeakConcepts: string[];
}

interface CourseListResponse {
  courses?: Course[];
  error?: string;
}

interface CourseQuizListResponse {
  quizzes?: Quiz[];
  error?: string;
}

interface CourseDetailSnapshot {
  course: Course | null;
  quizzes: Quiz[];
}

const courseDetailCache = new Map<string, CourseDetailSnapshot>();

const COURSE_VIEW_TABS: Array<{ id: CourseDetailView; label: string }> = [
  { id: "quizzes", label: "List of Quizzes" },
  { id: "course-analysis", label: "Course Analyze" },
  { id: "quiz-analysis", label: "Quiz Analyze" },
];

function getCourseViewFromQuery(rawView: string | null): CourseDetailView {
  if (rawView === "course-analysis") return "course-analysis";
  if (rawView === "quiz-analysis") return "quiz-analysis";
  return "quizzes";
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#2E7D4B";
  if (score >= 55) return "#A25E1A";
  return "#A63D2E";
}

function toCourseDetailErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  const data = payload as { error?: unknown };
  return typeof data.error === "string" && data.error.trim().length > 0
    ? data.error
    : fallback;
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const searchParams = useSearchParams();
  const view = getCourseViewFromQuery(searchParams.get("view"));
  const { bootstrap } = useDashboardBootstrapContext();
  const cachedSnapshot = courseDetailCache.get(courseId);
  const [course, setCourse] = useState<Course | null>(() => cachedSnapshot?.course ?? null);
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => cachedSnapshot?.quizzes ?? []);
  const [initialLoading, setInitialLoading] = useState(cachedSnapshot === undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [historySnapshots, setHistorySnapshots] = useState<QuizAnalysisSnapshot[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
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
      const cData = (await cRes.json().catch(() => ({}))) as CourseListResponse;
      const qData = (await qRes.json().catch(() => ({}))) as CourseQuizListResponse;
      if (!cRes.ok || !qRes.ok) {
        const message = !cRes.ok
          ? toCourseDetailErrorMessage(cData, "Failed to load course.")
          : toCourseDetailErrorMessage(qData, "Failed to load quizzes.");
        throw new Error(message);
      }
      const found = (cData.courses ?? []).find((item) => item.id === courseId) ?? null;
      const nextQuizzes = qData.quizzes ?? [];
      setCourse(found);
      setQuizzes(nextQuizzes);
      courseDetailCache.set(courseId, {
        course: found,
        quizzes: nextQuizzes,
      });
      setLoadError(null);
    } catch (error) {
      const fallback = mode === "refresh"
        ? "Could not refresh course data. Showing latest saved values."
        : "Could not load course data right now.";
      const message = error instanceof Error && error.message.trim().length > 0
        ? error.message
        : fallback;
      setLoadError(message);
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
    const hasNoCourseData = !course && quizzes.length === 0;
    async function refreshFromBootstrap() {
      try {
        await loadCourseData("refresh");
      } catch {
        // silent
      }
    }
    if (lastAppliedSyncAtRef.current === 0) {
      lastAppliedSyncAtRef.current = bootstrap.lastAutoSyncAt;
      if (hasNoCourseData) {
        void refreshFromBootstrap();
      }
      return;
    }
    if (bootstrap.lastAutoSyncAt <= lastAppliedSyncAtRef.current) {
      return;
    }
    lastAppliedSyncAtRef.current = bootstrap.lastAutoSyncAt;
    void refreshFromBootstrap();
  }, [bootstrap?.lastAutoSyncAt, course, initialLoading, loadCourseData, quizzes.length]);

  const loadHistorySnapshots = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const completedQuizzes = quizzes.filter((quiz) => quiz.analysisStatus === "completed");
      if (completedQuizzes.length === 0) {
        setHistorySnapshots([]);
        return;
      }

      const snapshotResults = await Promise.all(
        completedQuizzes.map(async (quiz): Promise<QuizAnalysisSnapshot | null> => {
          const response = await fetch(
            `/api/dashboard/analysis?courseId=${courseId}&quizId=${quiz.id}`,
            { cache: "no-store" },
          );
          if (!response.ok) return null;

          const payload = (await response.json()) as {
            found?: boolean;
            createdAt?: number;
            derivedAnalysis?: {
              scoreMetrics?: { averageScore?: number };
              riskDistribution?: { riskLevel: string; count: number; percentage: number }[];
              conceptHeatmap?: Array<{ concept: string }>;
            };
          };
          if (!payload.found) return null;

          return {
            quizId: quiz.id,
            title: quiz.title,
            createdAt: payload.createdAt ?? Date.now(),
            averageScore: payload.derivedAnalysis?.scoreMetrics?.averageScore ?? 0,
            riskDistribution: payload.derivedAnalysis?.riskDistribution ?? [],
            topWeakConcepts: (payload.derivedAnalysis?.conceptHeatmap ?? [])
              .slice(0, 3)
              .map((entry) => entry.concept),
          };
        }),
      );

      const snapshots = snapshotResults
        .filter((entry): entry is QuizAnalysisSnapshot => entry !== null)
        .sort((first, second) => second.createdAt - first.createdAt);
      setHistorySnapshots(snapshots);
    } catch {
      setHistorySnapshots([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [courseId, quizzes]);

  useEffect(() => {
    if (view !== "quiz-analysis" || initialLoading) return;
    void loadHistorySnapshots();
  }, [initialLoading, loadHistorySnapshots, view]);

  const trendData = historySnapshots
    .slice()
    .reverse()
    .map((entry) => ({
      quizId: entry.quizId,
      quizTitle: entry.title,
      date: new Date(entry.createdAt).toISOString().slice(0, 10),
      averageScore: entry.averageScore,
      riskDistribution: entry.riskDistribution.map((risk) => ({
        level: risk.riskLevel as "low" | "medium" | "high" | "critical",
        count: risk.count,
        percentage: risk.percentage,
      })),
      topWeakConcepts: entry.topWeakConcepts,
    }));

  return (
    <div>
      <div className="edu-fade-in" style={{ marginBottom: 10 }}>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 4 }}>
          {initialLoading ? "Loading course..." : course?.name ?? "Course"}
        </h1>
        <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14 }}>
          {initialLoading
            ? "Loading class details..."
            : `${course?.section ? `${course.section} · ` : ""}${course?.studentCount ?? 0} students`}
        </p>
      </div>

      {loadError && (
        <p className="edu-fade-in edu-fd1" style={{ fontSize: 12, color: "#A25E1A", marginBottom: 12 }}>
          {loadError}
        </p>
      )}

      <div className="edu-fade-in" style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {COURSE_VIEW_TABS.map((tab) => (
          <Link key={tab.id} href={routes.course(courseId, { view: tab.id })}>
            <button
              className={view === tab.id ? "edu-btn" : "edu-btn-outline"}
              style={{ fontSize: 12, padding: "6px 14px" }}
            >
              {tab.label}
            </button>
          </Link>
        ))}
      </div>

      <div style={{ display: view === "quizzes" ? "block" : "none" }}>
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
                    {quiz.analysisStatus === "completed" ? "Analyzed" : quiz.analysisStatus === "running" ? "Analyzing..." : "Not analyzed"}
                  </span>
                  <Link href={routes.quizWorkspace(courseId, quiz.id, { view: "analysis" })}>
                    <button className="edu-btn-outline" style={{ padding: "4px 14px", fontSize: 12 }}>
                      View Analysis
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

      <div style={{ display: view === "course-analysis" ? "block" : "none" }}>
        {!initialLoading && <CourseMaterialPanel courseId={courseId} />}
      </div>

      <div style={{ display: view === "quiz-analysis" ? "block" : "none" }}>
        {!initialLoading && (
          <div>
            <HistoryAnalysisPanel courseId={courseId} />

            {historyLoading ? (
              <p className="edu-muted" style={{ marginBottom: 14, fontSize: 13 }}>
                Loading quiz trend snapshots...
              </p>
            ) : null}

            {!historyLoading && historySnapshots.length > 0 ? (
              <div>
                <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24, marginBottom: 20 }}>
                  <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>Score Trend</h3>
                  <TrendChart data={trendData} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {historySnapshots.map((snapshot) => (
                    <div key={snapshot.quizId} className="edu-card edu-fade-in" style={{ padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{snapshot.title}</p>
                          <p className="edu-muted" style={{ fontSize: 12, margin: "4px 0 0" }}>
                            Avg:{" "}
                            <span style={{ color: getScoreColor(snapshot.averageScore), fontWeight: 700 }}>
                              {snapshot.averageScore.toFixed(1)}%
                            </span>{" "}
                            &middot; {new Date(snapshot.createdAt).toLocaleDateString()} &middot; Top gaps:{" "}
                            {snapshot.topWeakConcepts.join(", ") || "None"}
                          </p>
                        </div>
                        <Link href={routes.quizWorkspace(courseId, snapshot.quizId, { view: "insights" })}>
                          <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 12 }}>
                            View Analysis
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {!historyLoading && historySnapshots.length === 0 ? (
              <div className="edu-card" style={{ padding: 32, textAlign: "center" }}>
                <p className="edu-muted" style={{ marginBottom: 12 }}>
                  No analyzed quizzes yet. Analyze a quiz to populate trend insights.
                </p>
                <Link href={routes.course(courseId, { view: "quizzes" })}>
                  <button className="edu-btn">Open Quiz List</button>
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
