"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, use } from "react";
import { useDashboardBootstrapContext } from "@/components/layout/dashboard-bootstrap-context";
import { RefreshingOverlay, SkeletonBox, PanelStateBlock } from "@/components/ui/loading-states";
import { routes } from "@/lib/routes";

interface CourseAnalysisData {
  status: string;
  analyzedQuizIds: string[];
  generatedAt: number;
  analysis?: {
    topWeakConcepts: Array<{ concept: string; quizzesAffected: number; studentsAffected: number; dominantErrorType: string }>;
    rootCauses: string[];
    trendDirection: string;
    trendConfidence: string;
    contentCoverage: { taughtConcepts: string[]; assessedConcepts: string[]; gaps: string[] };
    alignmentScore: string;
    difficultyProgression: string;
    misconceptionRecurrence: Array<{ concept: string; occurrences: number }>;
    assessmentBalance: { conceptual: number; procedural: number; application: number };
    underCoveredConcepts: string[];
    overWeightedConcepts: string[];
    interventionOpportunities: string[];
    prioritizedActions: string[];
    insufficientDataReasons?: string[];
  };
  error?: string;
}

const TREND_COLORS: Record<string, { bg: string; color: string }> = {
  improving: { bg: "#E9F3E5", color: "#3D7A2E" },
  stable: { bg: "#FEF8E7", color: "#8B6914" },
  declining: { bg: "#FDECEA", color: "#A63D2E" },
  insufficient_data: { bg: "#F0ECE5", color: "#8A7D6F" },
};

function CourseAnalysisPanel({ courseId }: { courseId: string }) {
  const [data, setData] = useState<CourseAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/analyze/course?courseId=${courseId}`)
      .then((r) => r.json())
      .then((d) => { if (d.found) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  async function runAnalysis() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Course analysis failed");
      if (d.status === "insufficient_data") {
        setData({ status: "insufficient_data", analyzedQuizIds: [], generatedAt: Date.now(), error: d.error });
      } else {
        setData({ status: "success", analyzedQuizIds: [], generatedAt: Date.now(), analysis: d.analysis });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Course analysis failed");
    }
    setRunning(false);
  }

  if (loading) return null;

  const a = data?.analysis;
  const trend = TREND_COLORS[a?.trendDirection ?? "insufficient_data"] ?? TREND_COLORS.insufficient_data;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 className="edu-heading edu-fade-in" style={{ fontSize: 18, margin: 0 }}>Course Material Analysis</h2>
        <button
          className="edu-btn-outline"
          style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={runAnalysis}
          disabled={running}
        >
          {running ? "Analyzing..." : data ? "Re-run Analysis" : "Run Analysis"}
        </button>
      </div>

      {error && <p style={{ fontSize: 12, color: "#A63D2E", marginBottom: 12 }}>{error}</p>}

      {data?.status === "insufficient_data" && (
        <PanelStateBlock
          title="Insufficient data"
          description={data.error ?? "Need at least one completed quiz analysis."}
          tone="empty"
        />
      )}

      {a && (
        <div className="edu-fade-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            <div className="edu-card" style={{ padding: 16, textAlign: "center" }}>
              <p className="edu-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Trend</p>
              <span style={{ fontSize: 14, fontWeight: 700, padding: "4px 12px", borderRadius: 6, background: trend.bg, color: trend.color }}>
                {a.trendDirection.replace("_", " ")}
              </span>
            </div>
            <div className="edu-card" style={{ padding: 16, textAlign: "center" }}>
              <p className="edu-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Confidence</p>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#6D6154" }}>{a.trendConfidence}</p>
            </div>
            <div className="edu-card" style={{ padding: 16, textAlign: "center" }}>
              <p className="edu-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Alignment</p>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#6D6154" }}>{a.alignmentScore.replace("_", " ")}</p>
            </div>
            <div className="edu-card" style={{ padding: 16, textAlign: "center" }}>
              <p className="edu-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Progression</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#6D6154" }}>{a.difficultyProgression.replace(/_/g, " ")}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div className="edu-card" style={{ padding: 20 }}>
              <h3 className="edu-heading" style={{ fontSize: 14, marginBottom: 12 }}>Top Weak Concepts</h3>
              {a.topWeakConcepts.slice(0, 5).map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < Math.min(a.topWeakConcepts.length, 5) - 1 ? "1px solid #F0ECE5" : "none" }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{c.concept}</span>
                  <span style={{ fontSize: 11, color: "#8A7D6F" }}>{c.studentsAffected} students, {c.quizzesAffected} quiz(es)</span>
                </div>
              ))}
            </div>
            <div className="edu-card" style={{ padding: 20 }}>
              <h3 className="edu-heading" style={{ fontSize: 14, marginBottom: 12 }}>Prioritized Actions</h3>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {a.prioritizedActions.map((action, i) => (
                  <li key={i} style={{ fontSize: 12, marginBottom: 6, lineHeight: 1.5 }}>{action}</li>
                ))}
              </ol>
            </div>
          </div>

          {a.contentCoverage.gaps.length > 0 && (
            <div className="edu-card" style={{ padding: 20, marginBottom: 16 }}>
              <h3 className="edu-heading" style={{ fontSize: 14, marginBottom: 8 }}>Content Gaps</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {a.contentCoverage.gaps.map((gap, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: "#FDECEA", color: "#A63D2E", fontWeight: 500 }}>
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          )}

          {a.interventionOpportunities.length > 0 && (
            <div className="edu-card" style={{ padding: 20 }}>
              <h3 className="edu-heading" style={{ fontSize: 14, marginBottom: 8 }}>Intervention Opportunities</h3>
              {a.interventionOpportunities.map((opp, i) => (
                <p key={i} style={{ fontSize: 12, margin: "4px 0", color: "#3D3229" }}>• {opp}</p>
              ))}
            </div>
          )}

          <p style={{ fontSize: 11, color: "#B5AA9C", marginTop: 10, fontStyle: "italic" }}>
            AI-generated draft — {data?.generatedAt ? `analyzed ${new Date(data.generatedAt).toLocaleString()}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

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

      {!initialLoading && <CourseAnalysisPanel courseId={courseId} />}
    </div>
  );
}
