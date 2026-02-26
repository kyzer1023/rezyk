"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { routes } from "@/lib/routes";
import {
  ChartSkeleton,
  MetricCardsSkeleton,
  PanelStateBlock,
  RefreshingOverlay,
  SkeletonBox,
  TableRowsSkeleton,
} from "@/components/ui/loading-states";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";
import RiskDistribution from "@/lib/charts/RiskDistribution";

interface SyncStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
  detail: string;
}

const INITIAL_STEPS: SyncStep[] = [
  { id: "s1", label: "Syncing courses", status: "pending", detail: "" },
  { id: "s2", label: "Syncing quiz structure", status: "pending", detail: "" },
  { id: "s3", label: "Syncing quiz responses", status: "pending", detail: "" },
  { id: "s4", label: "Ready for analysis", status: "pending", detail: "" },
];

interface AnalysisErrorPayload {
  error?: string;
  errorClass?: string;
  diagnostics?: Array<{
    path?: string;
    message?: string;
  }>;
}

interface AnalysisSummary {
  studentsAnalyzed: number;
  riskDistribution: { riskLevel: string; count: number; percentage: number }[];
  scoreMetrics: { averageScore: number; medianScore: number; averageCompletionRate: number };
}

interface RiskEntry {
  riskLevel: string;
  count: number;
  percentage: number;
}

interface ConceptEntry {
  concept: string;
  affectedStudentCount: number;
  questionIds: string[];
  dominantErrorType: string;
}

interface ScoreMetrics {
  averageScore: number;
  medianScore: number;
  averageCompletionRate: number;
}

interface ErrorBreakdown {
  errorType: string;
  count: number;
  percentage: number;
}

interface AnalysisData {
  derivedAnalysis: {
    riskDistribution: RiskEntry[];
    scoreMetrics: ScoreMetrics;
    conceptHeatmap: ConceptEntry[];
    errorTypeBreakdown: ErrorBreakdown[];
  };
  modelOutput: {
    students: StudentAnalysis[];
  };
}

type StudentRiskLevel = "low" | "medium" | "high" | "critical";

interface Misconception {
  concept: string;
  errorType: string;
  affectedQuestions: string[];
  evidence: string;
}

interface Intervention {
  type: string;
  focusArea: string;
  action: string;
}

interface StudentAnalysis {
  studentId: string;
  riskLevel: StudentRiskLevel;
  misconceptions: Misconception[];
  interventions: Intervention[];
  rationale: string;
}

const RISK_COLORS: Record<StudentRiskLevel, { bg: string; color: string }> = {
  critical: { bg: "#FDECEA", color: "#A63D2E" },
  high: { bg: "#FEF4E5", color: "#A25E1A" },
  medium: { bg: "#FEF8E7", color: "#8B6914" },
  low: { bg: "#E9F3E5", color: "#3D7A2E" },
};

const ERROR_TYPE_COLORS: Record<string, string> = {
  conceptual: "#A63D2E",
  procedural: "#A25E1A",
  careless: "#A96842",
};

const ERROR_TYPE_BG: Record<string, string> = {
  conceptual: "#FDECEA",
  procedural: "#FEF4E5",
  careless: "#F4E3DA",
};

const SCORE_MAX = 40;
function deriveScore(riskLevel: StudentRiskLevel, misconceptionCount: number): number {
  const base = riskLevel === "critical" ? 12 : riskLevel === "high" ? 20 : riskLevel === "medium" ? 28 : 36;
  return Math.max(0, Math.min(SCORE_MAX, base - misconceptionCount));
}

function getPerformanceColor(value: number): string {
  if (value >= 75) return "#2E7D4B";
  if (value >= 55) return "#A25E1A";
  return "#A63D2E";
}

function getInversePerformanceColor(value: number): string {
  if (value <= 25) return "#2E7D4B";
  if (value <= 45) return "#A25E1A";
  return "#A63D2E";
}

function toAnalysisErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Analysis failed";
  }

  const result = payload as AnalysisErrorPayload;
  const base =
    typeof result.error === "string" && result.error.trim().length > 0
      ? result.error
      : "Analysis failed";
  const errorClass =
    typeof result.errorClass === "string" && result.errorClass.trim().length > 0
      ? ` (${result.errorClass})`
      : "";

  const firstDiagnostic = Array.isArray(result.diagnostics) ? result.diagnostics[0] : undefined;
  if (!firstDiagnostic || typeof firstDiagnostic !== "object") {
    return `${base}${errorClass}`;
  }

  const message =
    typeof firstDiagnostic.message === "string" && firstDiagnostic.message.trim().length > 0
      ? firstDiagnostic.message
      : "";
  const path =
    typeof firstDiagnostic.path === "string" && firstDiagnostic.path.trim().length > 0
      ? `${firstDiagnostic.path}: `
      : "";

  if (!message) {
    return `${base}${errorClass}`;
  }

  return `${base}${errorClass} - ${path}${message}`;
}

function toApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const data = payload as { error?: unknown };
  if (typeof data.error === "string" && data.error.trim().length > 0) {
    return data.error;
  }

  return fallback;
}

export function QuizSyncPanel({ courseId, quizId }: { courseId: string; quizId: string }) {
  const [steps, setSteps] = useState<SyncStep[]>(INITIAL_STEPS);
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAutoStarted = useRef(false);

  const updateStep = useCallback((id: string, update: Partial<SyncStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...update } : s)));
  }, []);

  const startSync = useCallback(async () => {
    setSyncing(true);
    setDone(false);
    setError(null);
    setSteps(INITIAL_STEPS);

    try {
      updateStep("s1", { status: "in_progress" });
      const coursesRes = await fetch("/api/sync/courses", { method: "POST" });
      const coursesData = await coursesRes.json();
      if (!coursesRes.ok) throw new Error(coursesData.error ?? "Course sync failed");
      const courseCount = coursesData.courses?.length ?? 0;
      updateStep("s1", { status: "completed", detail: `${courseCount} course(s) connected` });

      updateStep("s2", { status: "in_progress" });
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateStep("s2", { status: "completed", detail: "Quiz form structure ready" });

      updateStep("s3", { status: "in_progress" });
      const quizRes = await fetch("/api/sync/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const quizData = await quizRes.json();
      if (!quizRes.ok) throw new Error(quizData.error ?? "Quiz sync failed");
      const quizCount = quizData.quizzes?.length ?? 0;
      const totalResponses = (quizData.quizzes ?? []).reduce(
        (sum: number, q: { responseCount: number }) => sum + q.responseCount,
        0,
      );
      updateStep("s3", {
        status: "completed",
        detail: `${totalResponses} responses from ${quizCount} quiz(es)`,
      });

      updateStep("s4", { status: "in_progress" });
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateStep("s4", { status: "completed", detail: "Sync complete. You can run analysis." });

      setDone(true);
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : "Sync failed";
      setError(message);
      setSteps((prev) =>
        prev.map((step) =>
          step.status === "in_progress" ? { ...step, status: "error", detail: message } : step,
        ),
      );
    }
    setSyncing(false);
  }, [courseId, updateStep]);

  useEffect(() => {
    if (hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    void startSync();
  }, [startSync]);

  const completedStepCount = steps.filter((step) => step.status === "completed").length;
  const inProgressStep = steps.find((step) => step.status === "in_progress");
  const progressPercent = Math.round(
    ((completedStepCount + (inProgressStep ? 0.5 : 0)) / steps.length) * 100,
  );
  const progressLabel = done
    ? "Sync complete"
    : syncing
      ? `Syncing... ${inProgressStep?.label ?? "Preparing data"}`
      : error
        ? "Sync paused"
        : "Ready to sync";

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Data Sync
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        Sync class data from Google Classroom and Forms (starts automatically)
      </p>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#6D6154" }}>{progressLabel}</p>
            <span style={{ fontSize: 12, color: "#8A7D6F", fontWeight: 600 }}>
              {done ? "100%" : `${progressPercent}%`}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 8,
              borderRadius: 999,
              background: "#EFE7DD",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${done ? 100 : progressPercent}%`,
                height: "100%",
                borderRadius: 999,
                background: done ? "#6E9E76" : "#C17A56",
                transition: "width 0.28s ease",
              }}
            />
          </div>
        </div>
        {steps.map((step, index) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 0",
              borderBottom: index < steps.length - 1 ? "1px solid #F0ECE5" : "none",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                background:
                  step.status === "completed"
                    ? "#E9F3E5"
                    : step.status === "in_progress"
                      ? "#FEF8E7"
                      : step.status === "error"
                        ? "#FDECEA"
                        : "#F0ECE5",
                color:
                  step.status === "completed"
                    ? "#3D7A2E"
                    : step.status === "in_progress"
                      ? "#8B6914"
                      : step.status === "error"
                        ? "#A63D2E"
                        : "#B5AA9C",
                transition: "all 0.3s",
              }}
            >
              {step.status === "completed"
                ? "\u2713"
                : step.status === "error"
                  ? "\u2717"
                  : step.status === "in_progress"
                    ? "\u2022"
                    : index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: step.status === "in_progress" ? 600 : 400,
                  color:
                    step.status === "completed"
                      ? "#3D7A2E"
                      : step.status === "in_progress"
                        ? "#8B6914"
                        : step.status === "error"
                          ? "#A63D2E"
                          : "#8A7D6F",
                }}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="edu-muted" style={{ fontSize: 12 }}>
                  {step.detail}
                </p>
              )}
            </div>
            {step.status === "in_progress" && (
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid #E8DFD4",
                  borderTopColor: "#C17A56",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            )}
          </div>
        ))}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {error && (
        <PanelStateBlock
          title="Sync could not finish"
          description={error}
          tone="error"
        />
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {!done && error && (
          <button className="edu-btn" onClick={startSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Try Sync Again"}
          </button>
        )}
        {done && (
          <Link href={routes.quizWorkspace(courseId, quizId, { view: "analysis" })}>
            <button className="edu-btn">Proceed to Analysis</button>
          </Link>
        )}
        {done && (
          <button className="edu-btn-outline" onClick={startSync}>
            Re-sync
          </button>
        )}
      </div>
    </div>
  );
}

export function QuizAnalysisPanel({ courseId, quizId }: { courseId: string; quizId: string }) {
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showingPreviousResult, setShowingPreviousResult] = useState(false);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [statusText, setStatusText] = useState("Ready to sync class data and run analysis");

  useEffect(() => {
    fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.found) {
          setComplete(true);
          setShowingPreviousResult(false);
          setSummary({
            studentsAnalyzed: data.modelOutput?.students?.length ?? 0,
            riskDistribution: data.derivedAnalysis?.riskDistribution ?? [],
            scoreMetrics: data.derivedAnalysis?.scoreMetrics ?? {
              averageScore: 0,
              medianScore: 0,
              averageCompletionRate: 0,
            },
          });
        }
      })
      .catch(() => {});
  }, [courseId, quizId]);

  useEffect(() => {
    if (!running) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [running]);

  async function runAnalysis() {
    const hasPreviousCompletedResult = complete && summary !== null;
    setRunning(true);
    setError(null);
    setShowingPreviousResult(false);
    setStatusText("Syncing courses...");

    try {
      const coursesResponse = await fetch("/api/sync/courses", { method: "POST" });
      const coursesPayload = await coursesResponse.json().catch(() => ({}));
      if (!coursesResponse.ok) {
        throw new Error(toApiErrorMessage(coursesPayload, "Course sync failed"));
      }

      setStatusText("Syncing quiz responses...");
      const quizSyncResponse = await fetch("/api/sync/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const quizSyncPayload = await quizSyncResponse.json().catch(() => ({}));
      if (!quizSyncResponse.ok) {
        throw new Error(toApiErrorMessage(quizSyncPayload, "Quiz sync failed"));
      }

      setStatusText("Running misconception analysis...");

      const response = await fetch("/api/analyze/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(toAnalysisErrorMessage(data));
      }

      const payload = data as { summary?: AnalysisSummary };
      setSummary(payload.summary ?? null);
      setComplete(true);
      setShowingPreviousResult(false);
      setStatusText("Sync and analysis complete");
    } catch (analysisError) {
      const message = analysisError instanceof Error ? analysisError.message : "Sync and analysis failed";
      setShowingPreviousResult(hasPreviousCompletedResult);
      setError(message);
      setStatusText("Sync and analysis needs attention");
    }
    setRunning(false);
  }

  const errorTypes = summary
    ? [
        {
          pct: `${summary.riskDistribution.find((risk) => risk.riskLevel === "critical")?.percentage ?? 0}%`,
          label: "Critical",
          color: "#A63D2E",
        },
        {
          pct: `${summary.riskDistribution.find((risk) => risk.riskLevel === "high")?.percentage ?? 0}%`,
          label: "High Risk",
          color: "#A25E1A",
        },
        {
          pct: `${summary.riskDistribution.find((risk) => risk.riskLevel === "medium")?.percentage ?? 0}%`,
          label: "Medium",
          color: "#8B6914",
        },
        {
          pct: `${summary.riskDistribution.find((risk) => risk.riskLevel === "low")?.percentage ?? 0}%`,
          label: "Low Risk",
          color: "#3D7A2E",
        },
      ]
    : [];
  const summaryAverageColor = summary
    ? getPerformanceColor(summary.scoreMetrics.averageScore)
    : "#3D3229";
  const summaryMedianColor = summary
    ? getPerformanceColor(summary.scoreMetrics.medianScore)
    : "#3D3229";
  const summaryCompletionColor = summary
    ? getPerformanceColor(summary.scoreMetrics.averageCompletionRate)
    : "#3D3229";

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Sync & Analyze
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        Sync data and run analysis in one section
      </p>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 36, textAlign: "center", marginBottom: 20 }}>
        {running && (
          <>
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid #E8DFD4",
                borderTopColor: "#C17A56",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ fontSize: 14, color: "#8B6914", fontWeight: 500 }}>
              {statusText}
            </p>
            <p className="edu-muted" style={{ fontSize: 12, marginTop: 6 }}>
              This may take 30-60 seconds
            </p>
            <p style={{ fontSize: 12, marginTop: 8, color: "#A63D2E", fontWeight: 600 }}>
              Please do not leave or reload this page while analysis is running.
            </p>
            {summary && (
              <div className="edu-refresh-layer" style={{ marginTop: 16, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                <p className="edu-muted" style={{ fontSize: 12, marginBottom: 10 }}>
                  Showing your previous completed result while new analysis runs
                </p>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${errorTypes.length}, 1fr)`, gap: 12 }}>
                  {errorTypes.map((item) => (
                    <div key={`running-${item.label}`}>
                      <p style={{ fontSize: 19, fontWeight: 700, color: item.color, margin: 0 }}>{item.pct}</p>
                      <p className="edu-muted" style={{ fontSize: 10, margin: "2px 0 0" }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                <RefreshingOverlay show label="Updating with newest results..." />
              </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {!running && !complete && (
          <>
            <p style={{ fontSize: 15, marginBottom: 6 }}>{statusText}</p>
            <p className="edu-muted" style={{ fontSize: 13, marginBottom: 16 }}>
              This runs sync first, then analysis automatically.
            </p>
          </>
        )}

        {!running && complete && summary && (
          <>
            {showingPreviousResult ? (
              <>
                <p style={{ fontSize: 15, color: "#A63D2E", fontWeight: 600, marginBottom: 6 }}>
                  Sync and analysis failed - showing previous completed result
                </p>
                {error && (
                  <p className="edu-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                    {error}
                  </p>
                )}
                <p style={{ fontSize: 14, color: "#8A7D6F", fontWeight: 600, marginBottom: 16 }}>
                  Previous result - {summary.studentsAnalyzed} student(s) analyzed
                </p>
              </>
            ) : (
              <p style={{ fontSize: 15, color: "#3D7A2E", fontWeight: 600, marginBottom: 16 }}>
                {"\u2713"} Sync and analysis complete - {summary.studentsAnalyzed} student(s) analyzed
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${errorTypes.length}, 1fr)`,
                gap: 12,
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              {errorTypes.map((item) => (
                <div key={item.label}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.pct}</p>
                  <p className="edu-muted" style={{ fontSize: 11 }}>{item.label}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center", fontSize: 13 }}>
              <span>Avg: <strong style={{ color: summaryAverageColor }}>{summary.scoreMetrics.averageScore.toFixed(1)}%</strong></span>
              <span>Median: <strong style={{ color: summaryMedianColor }}>{summary.scoreMetrics.medianScore.toFixed(1)}%</strong></span>
              <span>Completion: <strong style={{ color: summaryCompletionColor }}>{summary.scoreMetrics.averageCompletionRate.toFixed(0)}%</strong></span>
            </div>
          </>
        )}

        {error && !showingPreviousResult && (
          <div style={{ marginTop: 12 }}>
            <PanelStateBlock
              title="Analysis could not finish"
              description={error}
              tone="error"
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!running && !complete && (
          <button className="edu-btn" onClick={runAnalysis} disabled={running}>
            {running ? "Running..." : "Run Sync & Analyze"}
          </button>
        )}
        {!running && complete && (
          <>
            <Link href={routes.quizWorkspace(courseId, quizId, { view: "insights" })}>
              <button className="edu-btn">Open Insights</button>
            </Link>
            <button className="edu-btn-outline" onClick={runAnalysis} disabled={running}>
              Run Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function QuizInsightsPanel({ courseId, quizId }: { courseId: string; quizId: string }) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") {
      setRefreshing(true);
    }
    setLoadError(null);
    try {
      const response = await fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to load insights.");
      }
      const payload = (await response.json()) as AnalysisData & { found?: boolean };
      if (payload.found) {
        setData(payload);
      } else {
        setData(null);
      }
    } catch {
      setLoadError("Could not load insights right now.");
    } finally {
      if (mode === "refresh") {
        setRefreshing(false);
      }
    }
  }, [courseId, quizId]);

  useEffect(() => {
    let cancelled = false;
    async function runInitialLoad() {
      await loadAnalysis("initial");
      if (!cancelled) {
        setLoading(false);
      }
    }
    void runInitialLoad();
    return () => {
      cancelled = true;
    };
  }, [loadAnalysis]);

  if (loading) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 12 }}>Class Insights</h1>
        <p className="edu-muted" style={{ marginBottom: 16, fontSize: 13 }}>Loading class insights...</p>
        <div className="edu-fade-in edu-fd1" style={{ marginBottom: 16 }}>
          <MetricCardsSkeleton />
        </div>
        <div className="edu-fade-in edu-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 12 }}>Class Insights</h1>
        <PanelStateBlock
          title={loadError ? "Could not load insights" : "No class insights yet"}
          description={
            loadError
              ? "Please try again in a moment, or open Sync & Analyze to check the latest run."
              : "Run Sync & Analyze first, then return here for class-level trends."
          }
          tone={loadError ? "error" : "empty"}
          action={(
            <Link href={routes.quizWorkspace(courseId, quizId, { view: "analysis" })}>
              <button className="edu-btn">Open Sync & Analyze</button>
            </Link>
          )}
        />
      </div>
    );
  }

  const { riskDistribution, scoreMetrics, conceptHeatmap, errorTypeBreakdown } = data.derivedAnalysis;
  const atRiskCount = riskDistribution
    .filter((risk) => risk.riskLevel === "critical" || risk.riskLevel === "high")
    .reduce((sum, risk) => sum + risk.count, 0);

  const riskChartData = riskDistribution.map((risk) => ({
    level: risk.riskLevel as "low" | "medium" | "high" | "critical",
    count: risk.count,
    percentage: risk.percentage,
  }));

  const heatmapData = conceptHeatmap.map((concept) => ({
    concept: concept.concept,
    questionIds: concept.questionIds,
    correctRate: 1 - concept.affectedStudentCount / (data.modelOutput.students.length || 1),
    studentsMastered: (data.modelOutput.students.length || 0) - concept.affectedStudentCount,
    studentsStruggling: concept.affectedStudentCount,
    dominantErrorType: concept.dominantErrorType as "conceptual" | "procedural" | "careless",
  }));
  const errorTypeColumns = Math.max(errorTypeBreakdown.length, 1);
  const totalStudents = data.modelOutput.students.length;
  const atRiskRate = totalStudents > 0 ? (atRiskCount / totalStudents) * 100 : 0;
  const insightStats = [
    {
      label: "Average",
      value: scoreMetrics.averageScore.toFixed(1),
      color: getPerformanceColor(scoreMetrics.averageScore),
    },
    {
      label: "Median",
      value: String(Math.round(scoreMetrics.medianScore)),
      color: getPerformanceColor(scoreMetrics.medianScore),
    },
    {
      label: "Completion",
      value: `${scoreMetrics.averageCompletionRate.toFixed(2)}%`,
      color: getPerformanceColor(scoreMetrics.averageCompletionRate),
    },
    {
      label: "At Risk",
      value: String(atRiskCount),
      color: getInversePerformanceColor(atRiskRate),
    },
  ];

  return (
    <div>
      <div className="edu-fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <h1 className="edu-heading" style={{ fontSize: 22, margin: 0 }}>
          Class Insights
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="edu-btn-outline"
            style={{ fontSize: 13, padding: "8px 18px" }}
            onClick={() => {
              void loadAnalysis("refresh");
            }}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh Insights"}
          </button>
          <Link href={routes.quizWorkspace(courseId, quizId, { view: "students" })}>
            <button className="edu-btn" style={{ fontSize: 13, padding: "8px 18px" }}>
              View Students
            </button>
          </Link>
        </div>
      </div>

      {loadError && (
        <p style={{ marginBottom: 12, fontSize: 12, color: "#A25E1A" }}>
          Showing the last saved insights. Could not refresh right now.
        </p>
      )}

      <div className="edu-refresh-layer edu-fade-in edu-fd1" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {insightStats.map((stat) => (
            <div key={stat.label} className="edu-card" style={{ padding: 18, textAlign: "center" }}>
              <p className="edu-muted" style={{ fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 26, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>
        <RefreshingOverlay show={refreshing} label="Updating insight summary..." />
      </div>

      <div className="edu-refresh-layer edu-fade-in edu-fd2" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="edu-card" style={{ padding: 24 }}>
            <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>Concept Mastery</h3>
            <ConceptHeatmap data={heatmapData} />
          </div>
          <div className="edu-card" style={{ padding: 24 }}>
            <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>Risk Levels</h3>
            <RiskDistribution data={riskChartData} />
          </div>
        </div>
        <RefreshingOverlay show={refreshing} label="Refreshing charts..." />
      </div>

      <div className="edu-card edu-fade-in edu-fd3" style={{ padding: 24 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 16 }}>Error Types</h3>
        {errorTypeBreakdown.length === 0 ? (
          <p className="edu-muted" style={{ fontSize: 13, margin: 0 }}>
            No error breakdown is available yet.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${errorTypeColumns}, 1fr)`, gap: 14 }}>
            {errorTypeBreakdown.map((errorType) => (
              <div
                key={errorType.errorType}
                style={{
                  padding: 20,
                  background: "#FAF6F0",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <p style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: ERROR_TYPE_COLORS[errorType.errorType] ?? "#3D3229",
                  margin: "0 0 4px",
                }}>
                  {errorType.percentage}%
                </p>
                <p className="edu-muted" style={{ fontSize: 13, textTransform: "capitalize", margin: 0 }}>
                  {errorType.errorType}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function QuizStudentsPanel({ courseId, quizId }: { courseId: string; quizId: string }) {
  const [students, setStudents] = useState<StudentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("all");
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchFilter, setBatchFilter] = useState<string>("critical+high");
  const [batchResult, setBatchResult] = useState<{
    generated: number;
    failed: number;
    results: Array<{ studentId: string; status: string; error?: string }>;
  } | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  const loadStudents = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") {
      setRefreshing(true);
    }
    setLoadError(null);
    try {
      const response = await fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to load students.");
      }
      const data = (await response.json()) as {
        found?: boolean;
        modelOutput?: { students?: StudentAnalysis[] };
        emailMapping?: Record<string, string>;
      };
      if (data.found) {
        setStudents(data.modelOutput?.students ?? []);
        setEmailMap(data.emailMapping ?? {});
      } else {
        setStudents([]);
        setEmailMap({});
      }
    } catch {
      setLoadError("Could not load student insights right now.");
    } finally {
      if (mode === "refresh") {
        setRefreshing(false);
      }
    }
  }, [courseId, quizId]);

  useEffect(() => {
    let cancelled = false;
    async function runInitialLoad() {
      await loadStudents("initial");
      if (!cancelled) {
        setLoading(false);
      }
    }
    void runInitialLoad();
    return () => {
      cancelled = true;
    };
  }, [loadStudents]);

  const filtered = students
    .filter((student) => riskFilter === "all" || student.riskLevel === riskFilter);

  const riskOrder: StudentRiskLevel[] = ["critical", "high", "medium", "low"];
  const sorted = [...filtered].sort((studentA, studentB) => riskOrder.indexOf(studentA.riskLevel) - riskOrder.indexOf(studentB.riskLevel));

  const filterOptions: Array<{ value: string; label: string }> = [
    { value: "all", label: "All" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  if (loading) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 12 }}>Students</h1>
        <p className="edu-muted" style={{ marginBottom: 14, fontSize: 13 }}>Loading student insights...</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <SkeletonBox width={64} />
          <SkeletonBox width={86} />
          <SkeletonBox width={70} />
          <SkeletonBox width={74} />
          <SkeletonBox width={56} />
        </div>
        <TableRowsSkeleton />
      </div>
    );
  }

  if (loadError && students.length === 0) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 12 }}>Students</h1>
        <PanelStateBlock
          title="Could not load students"
          description="Please try again soon, or open Sync & Analyze to run a new analysis."
          tone="error"
          action={(
            <Link href={routes.quizWorkspace(courseId, quizId, { view: "analysis" })}>
              <button className="edu-btn">Open Sync & Analyze</button>
            </Link>
          )}
        />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 12 }}>Students</h1>
        <PanelStateBlock
          title="No student insights yet"
          description="Run Sync & Analyze first, then return here to review each learner."
          tone="empty"
          action={(
            <Link href={routes.quizWorkspace(courseId, quizId, { view: "analysis" })}>
              <button className="edu-btn">Open Sync & Analyze</button>
            </Link>
          )}
        />
      </div>
    );
  }

  async function runBatchGenerate() {
    setBatchGenerating(true);
    setBatchResult(null);
    setBatchError(null);
    try {
      const res = await fetch("/api/notes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId, filter: batchFilter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Batch generation failed");
      setBatchResult({ generated: data.generated, failed: data.failed, results: data.results });
    } catch (e) {
      setBatchError(e instanceof Error ? e.message : "Batch generation failed");
    }
    setBatchGenerating(false);
    setShowBatchDialog(false);
  }

  return (
    <div>
      <div className="edu-fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 className="edu-heading" style={{ fontSize: 22, margin: 0 }}>Students</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="edu-btn"
            style={{ fontSize: 13, padding: "8px 16px" }}
            onClick={() => setShowBatchDialog(true)}
            disabled={batchGenerating}
          >
            {batchGenerating ? "Generating Notes..." : "Batch Generate Notes"}
          </button>
          <button
            className="edu-btn-outline"
            style={{ fontSize: 13, padding: "8px 16px" }}
            onClick={() => {
              void loadStudents("refresh");
            }}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh Students"}
          </button>
        </div>
      </div>

      {showBatchDialog && (
        <div className="edu-card edu-fade-in" style={{ padding: 20, marginBottom: 16, background: "#FCF8F3" }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Batch Generate Asset Notes</p>
          <p style={{ fontSize: 12, color: "#6D6154", marginBottom: 12 }}>
            Select which students to generate notes for:
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { value: "critical+high", label: "Critical + High (recommended)" },
              { value: "critical", label: "Critical only" },
              { value: "high", label: "High only" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
              { value: "all", label: "All students" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBatchFilter(opt.value)}
                style={{
                  padding: "5px 12px", borderRadius: 16, fontSize: 11, fontWeight: 600,
                  cursor: "pointer",
                  border: batchFilter === opt.value ? "1.5px solid #6E4836" : "1.5px solid #E8DFD4",
                  background: batchFilter === opt.value ? "#6E4836" : "#FFF",
                  color: batchFilter === opt.value ? "#FFF" : "#6D6154",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="edu-btn" style={{ fontSize: 12 }} onClick={runBatchGenerate} disabled={batchGenerating}>
              {batchGenerating ? "Generating..." : "Generate"}
            </button>
            <button className="edu-btn-outline" style={{ fontSize: 12 }} onClick={() => setShowBatchDialog(false)}>
              Cancel
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#8A7D6F", marginTop: 8, fontStyle: "italic" }}>
            AI-generated drafts — review before sharing with students or parents
          </p>
        </div>
      )}

      {batchResult && (
        <div className="edu-card edu-fade-in" style={{ padding: 16, marginBottom: 16, background: batchResult.failed > 0 ? "#FEF8E7" : "#E9F3E5" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: batchResult.failed > 0 ? "#8B6914" : "#3D7A2E", marginBottom: 4 }}>
            Batch Complete: {batchResult.generated} generated, {batchResult.failed} failed
          </p>
          {batchResult.failed > 0 && (
            <div style={{ marginTop: 8 }}>
              {batchResult.results.filter((r) => r.status === "error").map((r) => (
                <p key={r.studentId} style={{ fontSize: 11, color: "#A63D2E", margin: "2px 0" }}>
                  {r.studentId}: {r.error}
                </p>
              ))}
            </div>
          )}
          <button
            className="edu-btn-outline"
            style={{ fontSize: 11, padding: "3px 10px", marginTop: 8 }}
            onClick={() => setBatchResult(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {batchError && (
        <p style={{ marginBottom: 12, fontSize: 12, color: "#A63D2E" }}>{batchError}</p>
      )}

      {loadError && (
        <p style={{ marginBottom: 12, fontSize: 12, color: "#A25E1A" }}>
          Showing the last saved student data. Could not refresh right now.
        </p>
      )}

      <div className="edu-fade-in edu-fd1" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRiskFilter(opt.value)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: riskFilter === opt.value ? "1.5px solid #6E4836" : "1.5px solid #E8DFD4",
              background: riskFilter === opt.value ? "#6E4836" : "#FFF",
              color: riskFilter === opt.value ? "#FFF" : "#6D6154",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="edu-refresh-layer edu-fade-in edu-fd2">
        <div className="edu-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #F0ECE5" }}>
                <th style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Student
                </th>
                <th style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Score
                </th>
                <th style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Gaps
                </th>
                <th style={{ textAlign: "right", padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Risk
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((student, index) => {
                const risk = RISK_COLORS[student.riskLevel] ?? RISK_COLORS.low;
                const email = emailMap[student.studentId] ?? student.studentId;
                const displayName = email.split("@")[0].replace(/[._]/g, " ");
                const score = deriveScore(student.riskLevel, student.misconceptions.length);
                return (
                  <tr
                    key={student.studentId}
                    style={{
                      borderBottom: index < sorted.length - 1 ? "1px solid #F0ECE5" : "none",
                    }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <Link
                        href={routes.quizWorkspace(courseId, quizId, { view: "students", studentId: student.studentId })}
                        style={{ color: "#A96842", textDecoration: "none", fontSize: 14, fontWeight: 500, textTransform: "capitalize" }}
                      >
                        {displayName}
                      </Link>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 14 }}>
                      <span style={{ color: getPerformanceColor((score / SCORE_MAX) * 100), fontWeight: 600 }}>
                        {score}/{SCORE_MAX}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 14 }}>
                      {student.misconceptions.length}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 4,
                          background: risk.bg,
                          color: risk.color,
                          textTransform: "lowercase",
                        }}
                      >
                        {student.riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <RefreshingOverlay show={refreshing} label="Refreshing student insights..." />
      </div>
    </div>
  );
}

interface StudentNoteData {
  studentDisplayName: string;
  topWeaknesses: Array<{
    concept: string;
    errorType: string;
    likelyRootIssue: string;
  }>;
  improvementTips: string[];
  suggestedFollowUp: string;
}

function StudentNoteCard({
  note,
  onRegenerate,
  regenerating,
}: {
  note: StudentNoteData;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  return (
    <div className="edu-card edu-fade-in" style={{ padding: 24, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>
          Asset Note
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="edu-btn-outline"
            style={{ fontSize: 11, padding: "4px 10px" }}
            onClick={() => {
              const text = [
                `Student: ${note.studentDisplayName}`,
                "",
                "Weaknesses:",
                ...note.topWeaknesses.map((w) => `- ${w.concept} (${w.errorType}): ${w.likelyRootIssue}`),
                "",
                "Improvement Tips:",
                ...note.improvementTips.map((t, i) => `${i + 1}. ${t}`),
                "",
                `Follow-up: ${note.suggestedFollowUp}`,
              ].join("\n");
              navigator.clipboard.writeText(text).catch(() => {});
            }}
          >
            Copy
          </button>
          <button
            className="edu-btn-outline"
            style={{ fontSize: 11, padding: "4px 10px" }}
            onClick={() => window.print()}
          >
            Print
          </button>
          <button
            className="edu-btn-outline"
            style={{ fontSize: 11, padding: "4px 10px" }}
            onClick={onRegenerate}
            disabled={regenerating}
          >
            {regenerating ? "Regenerating..." : "Regenerate"}
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#8A7D6F", margin: "0 0 4px", fontStyle: "italic" }}>
        AI-generated draft — review before sharing
      </p>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6D6154", margin: "12px 0 8px" }}>Weaknesses</p>
        {note.topWeaknesses.map((w, i) => (
          <div key={i} style={{ padding: "8px 0", borderBottom: i < note.topWeaknesses.length - 1 ? "1px solid #F0ECE5" : "none" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{w.concept}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                color: ERROR_TYPE_COLORS[w.errorType] ?? "#8A7D6F",
                background: ERROR_TYPE_BG[w.errorType] ?? "#F5F0E9",
              }}>
                {w.errorType}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#6D6154", margin: 0 }}>{w.likelyRootIssue}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6D6154", margin: "0 0 8px" }}>Improvement Tips</p>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {note.improvementTips.map((tip, i) => (
            <li key={i} style={{ fontSize: 12, color: "#3D3229", marginBottom: 6, lineHeight: 1.5 }}>{tip}</li>
          ))}
        </ol>
      </div>

      <div style={{ background: "#F8F5F0", borderRadius: 8, padding: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6D6154", margin: "0 0 4px" }}>Suggested Follow-up</p>
        <p style={{ fontSize: 12, color: "#3D3229", margin: 0, lineHeight: 1.5 }}>{note.suggestedFollowUp}</p>
      </div>
    </div>
  );
}

export function QuizStudentDetailPanel({
  courseId,
  quizId,
  studentId,
}: {
  courseId: string;
  quizId: string;
  studentId: string;
}) {
  const [student, setStudent] = useState<StudentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [allStudents, setAllStudents] = useState<StudentAnalysis[]>([]);
  const [generatingNote, setGeneratingNote] = useState(false);
  const [noteData, setNoteData] = useState<StudentNoteData | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.found) {
          const students: StudentAnalysis[] = data.modelOutput?.students ?? [];
          setAllStudents(students);
          setEmailMap(data.emailMapping ?? {});
          const found = students.find((entry) => entry.studentId === studentId);
          setStudent(found ?? null);
        } else {
          setStudent(null);
          setAllStudents([]);
          setEmailMap({});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId, quizId, studentId]);

  useEffect(() => {
    fetch(`/api/notes/list?courseId=${courseId}&quizId=${quizId}&studentId=${studentId}`)
      .then((r) => r.json())
      .then((d) => {
        const notes = d.notes ?? [];
        const successNote = notes.find((n: { status: string; note?: StudentNoteData }) => n.status === "success" && n.note);
        if (successNote?.note) setNoteData(successNote.note);
      })
      .catch(() => {});
  }, [courseId, quizId, studentId]);

  async function generateNote() {
    setGeneratingNote(true);
    setNoteError(null);
    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId, studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate note");
      setNoteData(data.note);
    } catch (e) {
      setNoteError(e instanceof Error ? e.message : "Failed to generate note");
    }
    setGeneratingNote(false);
  }

  if (loading) return <p className="edu-muted">Loading student details...</p>;
  if (!student) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22 }}>Student Not Found</h1>
        <Link href={routes.quizWorkspace(courseId, quizId, { view: "students" })}>
          <button className="edu-btn-outline" style={{ marginTop: 12 }}>Back to Students</button>
        </Link>
      </div>
    );
  }

  const risk = RISK_COLORS[student.riskLevel] ?? RISK_COLORS.low;
  const email = emailMap[student.studentId] ?? student.studentId;
  const displayName = email.split("@")[0].replace(/[._]/g, " ");
  const score = deriveScore(student.riskLevel, student.misconceptions.length);
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const riskOrder: StudentRiskLevel[] = ["critical", "high", "medium", "low"];
  const atRisk = allStudents
    .filter((entry) => entry.riskLevel === "critical" || entry.riskLevel === "high")
    .sort((entryA, entryB) => riskOrder.indexOf(entryA.riskLevel) - riskOrder.indexOf(entryB.riskLevel));
  const currentIndex = atRisk.findIndex((entry) => entry.studentId === studentId);
  const nextStudent = currentIndex >= 0 && currentIndex < atRisk.length - 1 ? atRisk[currentIndex + 1] : atRisk[0];

  return (
    <div>
      <div
        className="edu-card edu-fade-in"
        style={{
          padding: "24px 28px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#FCF8F3",
          borderColor: "#E8DFD4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#6E4836",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <h1
              className="edu-heading"
              style={{ fontSize: 20, margin: "0 0 2px", textTransform: "capitalize" }}
            >
              {displayName}
            </h1>
            <p className="edu-muted" style={{ fontSize: 13, margin: 0 }}>
              {email} &middot; Score:{" "}
              <span style={{ color: getPerformanceColor((score / SCORE_MAX) * 100), fontWeight: 700 }}>
                {score}/{SCORE_MAX}
              </span>
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "5px 14px",
            borderRadius: 6,
            background: risk.bg,
            color: risk.color,
            textTransform: "lowercase",
          }}
        >
          {student.riskLevel} risk
        </span>
      </div>

      <div className="edu-card edu-fade-in edu-fd1" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14, fontWeight: 700 }}>
          Knowledge Gaps
        </h3>
        {student.misconceptions.map((misconception, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: index < student.misconceptions.length - 1 ? "1px solid #F0ECE5" : "none",
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{misconception.concept}</p>
              <p style={{ fontSize: 12, color: "#B5AA9C", margin: 0 }}>
                Questions: {misconception.affectedQuestions.join(", ")}
              </p>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 4,
                color: ERROR_TYPE_COLORS[misconception.errorType] ?? "#8A7D6F",
                background: ERROR_TYPE_BG[misconception.errorType] ?? "#F5F0E9",
                textTransform: "lowercase",
              }}
            >
              {misconception.errorType}
            </span>
          </div>
        ))}
      </div>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24, marginBottom: 14 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14, fontWeight: 700 }}>
          Interventions
        </h3>
        {student.interventions.map((intervention, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: index < student.interventions.length - 1 ? "1px solid #F0ECE5" : "none",
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px" }}>{intervention.action}</p>
              <p style={{ fontSize: 12, color: "#B5AA9C", margin: 0 }}>
                {intervention.focusArea} &middot; {intervention.type}
              </p>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 4,
                background: "#FEF8E7",
                color: "#8B6914",
              }}
            >
              Pending
            </span>
          </div>
        ))}
      </div>

      {noteData && (
        <StudentNoteCard
          note={noteData}
          onRegenerate={generateNote}
          regenerating={generatingNote}
        />
      )}

      {!noteData && (
        <div className="edu-fade-in edu-fd3" style={{ marginBottom: 14 }}>
          <button
            className="edu-btn"
            onClick={generateNote}
            disabled={generatingNote}
            style={{ fontSize: 13 }}
          >
            {generatingNote ? "Generating Asset Note..." : "Generate Asset Note"}
          </button>
          {noteError && (
            <p style={{ fontSize: 12, color: "#A63D2E", marginTop: 8 }}>{noteError}</p>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        {nextStudent && nextStudent.studentId !== studentId && (
          <Link href={routes.quizWorkspace(courseId, quizId, { view: "students", studentId: nextStudent.studentId })}>
            <button className="edu-btn">Next At-Risk Student</button>
          </Link>
        )}
        <Link href={routes.quizWorkspace(courseId, quizId, { view: "insights" })}>
          <button className="edu-btn-outline">Back to Insights</button>
        </Link>
        <Link href={routes.quizWorkspace(courseId, quizId, { view: "students" })}>
          <button className="edu-btn-outline">All Students</button>
        </Link>
      </div>
    </div>
  );
}
