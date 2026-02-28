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
import StudentNoteCard from "@/components/notes/StudentNoteCard";
import type { BatchCategoryFilter, SavedStudentNote } from "@/lib/analysis/student-notes-schema";

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

interface AnalysisApiPayload {
  found?: boolean;
  derivedAnalysis?: {
    riskDistribution?: RiskEntry[];
    scoreMetrics?: ScoreMetrics;
    conceptHeatmap?: ConceptEntry[];
    errorTypeBreakdown?: ErrorBreakdown[];
  };
  modelOutput?: {
    students?: StudentAnalysis[];
  };
  emailMapping?: Record<string, string>;
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

interface BatchGenerationResult {
  generated: number;
  failed: number;
  total: number;
  results: Array<{ studentId: string; status: "success" | "error"; error?: string }>;
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

function toReadableGenerationError(rawError: string | undefined, fallback: string): string {
  if (!rawError) return fallback;
  const normalized = rawError.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;

  try {
    const parsed = JSON.parse(normalized) as { error?: { message?: string; status?: string } };
    if (parsed?.error) {
      const message =
        typeof parsed.error.message === "string" && parsed.error.message.trim().length > 0
          ? parsed.error.message.trim()
          : "";
      const status =
        typeof parsed.error.status === "string" && parsed.error.status.trim().length > 0
          ? parsed.error.status.trim()
          : "";
      const combined = `${message}${status ? ` (${status})` : ""}`.trim();
      if (combined.length > 0) {
        return combined;
      }
    }
  } catch {
    // Keep best-effort parsing silent and fallback to pattern matching.
  }

  if (/UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|rate limit|quota|429|503/i.test(normalized)) {
    return "Model is temporarily busy. Please retry in about a minute.";
  }

  if (/network|timeout|timed out|ECONNRESET|ETIMEDOUT/i.test(normalized)) {
    return "Temporary network issue during generation. Please retry.";
  }

  return normalized.length > 220 ? `${normalized.slice(0, 217)}...` : normalized;
}

function buildSummaryFromAnalysis(payload: AnalysisApiPayload): AnalysisSummary | null {
  if (!payload.found) return null;
  return {
    studentsAnalyzed: payload.modelOutput?.students?.length ?? 0,
    riskDistribution: payload.derivedAnalysis?.riskDistribution ?? [],
    scoreMetrics: payload.derivedAnalysis?.scoreMetrics ?? {
      averageScore: 0,
      medianScore: 0,
      averageCompletionRate: 0,
    },
  };
}

function buildAnalysisData(payload: AnalysisApiPayload): AnalysisData | null {
  if (!payload.found) return null;
  return {
    derivedAnalysis: {
      riskDistribution: payload.derivedAnalysis?.riskDistribution ?? [],
      scoreMetrics: payload.derivedAnalysis?.scoreMetrics ?? {
        averageScore: 0,
        medianScore: 0,
        averageCompletionRate: 0,
      },
      conceptHeatmap: payload.derivedAnalysis?.conceptHeatmap ?? [],
      errorTypeBreakdown: payload.derivedAnalysis?.errorTypeBreakdown ?? [],
    },
    modelOutput: {
      students: payload.modelOutput?.students ?? [],
    },
  };
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

  const loadPersistedSummary = useCallback(async (): Promise<AnalysisSummary | null> => {
    const response = await fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`, {
      cache: "no-store",
    });
    if (response.status === 404) {
      return null;
    }
    const payload = (await response.json().catch(() => ({}))) as AnalysisApiPayload;
    if (!response.ok) {
      throw new Error(toApiErrorMessage(payload, "Failed to load saved analysis."));
    }
    return buildSummaryFromAnalysis(payload);
  }, [courseId, quizId]);

  useEffect(() => {
    let cancelled = false;
    async function loadExistingSummary() {
      try {
        const existingSummary = await loadPersistedSummary();
        if (!cancelled && existingSummary) {
          setSummary(existingSummary);
          setComplete(true);
          setShowingPreviousResult(false);
        }
      } catch {
        // silent; user can run analysis manually
      }
    }
    void loadExistingSummary();
    return () => {
      cancelled = true;
    };
  }, [loadPersistedSummary]);

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

      setStatusText("Loading saved analysis...");
      const persistedSummary = await loadPersistedSummary();
      if (!persistedSummary) {
        throw new Error(
          "Analysis completed, but saved insights are not available yet. Please try Run Again.",
        );
      }

      setSummary(persistedSummary);
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

function InsightsCollapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        className="edu-collapsible-trigger"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#5A5048" }}>{title}</span>
        <span className="edu-chevron">{"\u25BC"}</span>
      </button>
      <div className="edu-collapsible-body" data-open={open}>
        <div>{children}</div>
      </div>
    </div>
  );
}

function buildTakeaway(
  totalStudents: number,
  atRiskCount: number,
  avgScore: number,
  conceptCount: number,
): string {
  const parts: string[] = [];

  if (atRiskCount > 0) {
    parts.push(
      `${atRiskCount} of ${totalStudents} student${totalStudents !== 1 ? "s" : ""} need${atRiskCount === 1 ? "s" : ""} attention`,
    );
  } else {
    parts.push(`All ${totalStudents} students are on track`);
  }

  if (avgScore < 55) {
    parts.push(`class average is low at ${avgScore.toFixed(0)}%`);
  } else if (avgScore >= 80) {
    parts.push(`class average is strong at ${avgScore.toFixed(0)}%`);
  }

  if (conceptCount > 0) {
    parts.push(
      `${conceptCount} concept${conceptCount !== 1 ? "s" : ""} showing gaps`,
    );
  }

  return parts.join(" \u00b7 ");
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
      if (response.status === 404) {
        setData(null);
        return;
      }
      const payload = (await response.json().catch(() => ({}))) as AnalysisApiPayload;
      if (!response.ok) {
        throw new Error(toApiErrorMessage(payload, "Failed to load insights."));
      }
      setData(buildAnalysisData(payload));
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
          action={
            loadError ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="edu-btn-outline"
                  onClick={() => void loadAnalysis("refresh")}
                  disabled={refreshing}
                >
                  {refreshing ? "Retrying..." : "Retry"}
                </button>
                <Link href={routes.quizWorkspace(courseId, quizId, { view: "analysis" })}>
                  <button className="edu-btn">Open Sync & Analyze</button>
                </Link>
              </div>
            ) : (
              <Link href={routes.quizWorkspace(courseId, quizId, { view: "analysis" })}>
                <button className="edu-btn">Open Sync & Analyze</button>
              </Link>
            )
          }
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
  const totalStudents = data.modelOutput.students.length;
  const atRiskRate = totalStudents > 0 ? (atRiskCount / totalStudents) * 100 : 0;

  const takeaway = buildTakeaway(totalStudents, atRiskCount, scoreMetrics.averageScore, conceptHeatmap.length);

  const insightStats = [
    {
      label: "Average",
      value: scoreMetrics.averageScore.toFixed(1),
      unit: "%",
      color: getPerformanceColor(scoreMetrics.averageScore),
    },
    {
      label: "Median",
      value: String(Math.round(scoreMetrics.medianScore)),
      unit: "%",
      color: getPerformanceColor(scoreMetrics.medianScore),
    },
    {
      label: "Completion",
      value: scoreMetrics.averageCompletionRate.toFixed(0),
      unit: "%",
      color: getPerformanceColor(scoreMetrics.averageCompletionRate),
    },
    {
      label: "At Risk",
      value: String(atRiskCount),
      unit: `/${totalStudents}`,
      color: getInversePerformanceColor(atRiskRate),
    },
  ];

  const maxErrorPct = Math.max(...errorTypeBreakdown.map((e) => e.percentage), 1);

  return (
    <div>
      {/* ── Header ── */}
      <div className="edu-fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <h1 className="edu-heading" style={{ fontSize: 22, margin: "0 0 4px" }}>
            Class Insights
          </h1>
          <p className="edu-muted" style={{ fontSize: 13, margin: 0 }}>
            {totalStudents} student{totalStudents !== 1 ? "s" : ""} analyzed
          </p>
        </div>
        <Link href={routes.quizWorkspace(courseId, quizId, { view: "students" })}>
          <button className="edu-btn" style={{ fontSize: 13, padding: "8px 18px" }}>
            View Students
          </button>
        </Link>
      </div>

      {loadError && (
        <p style={{ marginBottom: 12, fontSize: 12, color: "#A25E1A" }}>
          Showing the last saved insights. Could not refresh right now.
        </p>
      )}

      {/* ── Takeaway strip ── */}
      <div
        className="edu-fade-in edu-fd1"
        style={{
          padding: "10px 16px",
          borderRadius: 6,
          background: atRiskCount > 0 ? "#FEF4E5" : "#E9F3E5",
          borderLeft: `3px solid ${atRiskCount > 0 ? "#C17A56" : "#3D7A2E"}`,
          marginBottom: 20,
          fontSize: 13,
          fontWeight: 600,
          color: atRiskCount > 0 ? "#8B6914" : "#3D7A2E",
        }}
      >
        {takeaway}
      </div>

      {/* ── Metric cards ── */}
      <div className="edu-refresh-layer edu-fade-in edu-fd2" style={{ marginBottom: 24 }}>
        <p className="edu-section-label">Performance Snapshot</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {insightStats.map((stat) => (
            <div key={stat.label} className="edu-card" style={{ padding: "16px 14px", textAlign: "center" }}>
              <p className="edu-muted" style={{ fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 24, fontWeight: 700, color: stat.color, margin: 0, lineHeight: 1.1 }}>
                {stat.value}
                <span style={{ fontSize: 12, fontWeight: 500, color: "#B5AA9C" }}>{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>
        <RefreshingOverlay show={refreshing} label="Updating insight summary..." />
      </div>

      {/* ── Visual Breakdown (collapsible charts) ── */}
      <div className="edu-card edu-fade-in edu-fd3" style={{ padding: 0, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ padding: "4px 8px" }}>
          <InsightsCollapsible title="Visual Breakdown" defaultOpen={true}>
            <div style={{ padding: "4px 16px 20px" }}>
              <div className="edu-refresh-layer">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ background: "#FDFBF7", borderRadius: 8, padding: "18px 16px" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#5A5048", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.4 }}>
                      Concept Mastery
                    </p>
                    <ConceptHeatmap data={heatmapData} />
                  </div>
                  <div style={{ background: "#FDFBF7", borderRadius: 8, padding: "18px 16px" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#5A5048", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.4 }}>
                      Risk Distribution
                    </p>
                    <RiskDistribution data={riskChartData} />
                  </div>
                </div>
                <RefreshingOverlay show={refreshing} label="Refreshing charts..." />
              </div>
            </div>
          </InsightsCollapsible>
        </div>
      </div>

      {/* ── Error Type Breakdown (horizontal bars instead of big numbers) ── */}
      <div className="edu-card edu-fade-in edu-fd4" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "4px 8px" }}>
          <InsightsCollapsible title={`Error Types (${errorTypeBreakdown.length})`} defaultOpen={false}>
            <div style={{ padding: "4px 16px 20px" }}>
              {errorTypeBreakdown.length === 0 ? (
                <p className="edu-muted" style={{ fontSize: 13, margin: 0 }}>
                  No error breakdown is available yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {errorTypeBreakdown.map((entry) => {
                    const barColor = ERROR_TYPE_COLORS[entry.errorType] ?? "#3D3229";
                    const barBg = ERROR_TYPE_BG[entry.errorType] ?? "#F5F0E9";
                    return (
                      <div key={entry.errorType}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: barColor,
                            textTransform: "capitalize",
                          }}>
                            {entry.errorType}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>
                            {entry.percentage}%
                          </span>
                        </div>
                        <div style={{
                          height: 8,
                          borderRadius: 999,
                          background: barBg,
                          overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%",
                            borderRadius: 999,
                            background: barColor,
                            width: `${(entry.percentage / maxErrorPct) * 100}%`,
                            transition: "width 0.4s ease",
                          }} />
                        </div>
                        <p className="edu-muted" style={{ fontSize: 11, margin: "4px 0 0" }}>
                          {entry.count} occurrence{entry.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </InsightsCollapsible>
        </div>
      </div>
    </div>
  );
}

type BatchModalPhase = "select" | "generating" | "results";

function matchesBatchFilter(riskLevel: string, filter: BatchCategoryFilter): boolean {
  if (filter === "all") return true;
  if (filter === "critical+high" || filter === "critical_high") {
    return riskLevel === "critical" || riskLevel === "high";
  }
  return riskLevel === filter;
}

function getBatchCategoryOptions(
  students: StudentAnalysis[],
  getDisplayName: (id: string) => string,
): Array<{
  value: BatchCategoryFilter;
  label: string;
  count: number;
  preview: string[];
}> {
  const byRisk = (levels: string[]) =>
    students.filter((s) => levels.includes(s.riskLevel));

  const previewNames = (list: StudentAnalysis[], max: number) =>
    list.slice(0, max).map((s) => getDisplayName(s.studentId));

  const critHigh = byRisk(["critical", "high"]);
  const critical = byRisk(["critical"]);
  const high = byRisk(["high"]);
  const medium = byRisk(["medium"]);
  const low = byRisk(["low"]);

  return [
    { value: "critical+high", label: "Critical + High", count: critHigh.length, preview: previewNames(critHigh, 4) },
    { value: "critical", label: "Critical only", count: critical.length, preview: previewNames(critical, 4) },
    { value: "high", label: "High only", count: high.length, preview: previewNames(high, 4) },
    { value: "medium", label: "Medium", count: medium.length, preview: previewNames(medium, 4) },
    { value: "low", label: "Low", count: low.length, preview: previewNames(low, 4) },
    { value: "all", label: "All students", count: students.length, preview: previewNames(students, 4) },
  ];
}

export function QuizStudentsPanel({ courseId, quizId }: { courseId: string; quizId: string }) {
  const [students, setStudents] = useState<StudentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("all");
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchFilter, setBatchFilter] = useState<BatchCategoryFilter>("critical+high");
  const [batchResult, setBatchResult] = useState<BatchGenerationResult | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchPhase, setBatchPhase] = useState<BatchModalPhase>("select");

  const loadStudents = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "refresh") {
      setRefreshing(true);
    }
    setLoadError(null);
    try {
      const response = await fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`, {
        cache: "no-store",
      });
      if (response.status === 404) {
        setStudents([]);
        setEmailMap({});
        return;
      }
      const data = (await response.json().catch(() => ({}))) as AnalysisApiPayload;
      if (!response.ok) {
        throw new Error(toApiErrorMessage(data, "Failed to load students."));
      }
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

  const openBatchModal = useCallback(() => {
    setBatchPhase("select");
    setBatchResult(null);
    setBatchError(null);
    setShowBatchModal(true);
  }, []);

  const closeBatchModal = useCallback(() => {
    if (batchGenerating) return;
    setShowBatchModal(false);
    setBatchPhase("select");
  }, [batchGenerating]);

  useEffect(() => {
    if (!showBatchModal) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBatchModal();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showBatchModal, closeBatchModal]);

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

  const getDisplayName = useCallback((id: string): string => {
    const email = emailMap[id] ?? id;
    return email.split("@")[0].replace(/[._]/g, " ");
  }, [emailMap]);

  async function runBatchGenerate() {
    setBatchGenerating(true);
    setBatchResult(null);
    setBatchError(null);
    setBatchPhase("generating");
    try {
      const response = await fetch("/api/notes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId, categoryFilter: batchFilter }),
      });
      const payload = (await response.json()) as {
        error?: string;
        generated?: number;
        failed?: number;
        total?: number;
        results?: BatchGenerationResult["results"];
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Batch generation failed");
      }

      setBatchResult({
        generated: payload.generated ?? 0,
        failed: payload.failed ?? 0,
        total: payload.total ?? 0,
        results: payload.results ?? [],
      });
      setBatchPhase("results");
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : "Batch generation failed";
      setBatchError(toReadableGenerationError(message, "Batch generation failed"));
      setBatchPhase("results");
    } finally {
      setBatchGenerating(false);
    }
  }

  const batchCategoryOptions = getBatchCategoryOptions(students, getDisplayName);
  const selectedCategory = batchCategoryOptions.find((opt) => opt.value === batchFilter);
  const selectedCount = selectedCategory?.count ?? 0;
  const targetStudents = students.filter((s) => matchesBatchFilter(s.riskLevel, batchFilter));

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
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="edu-btn-outline"
                onClick={() => void loadStudents("refresh")}
                disabled={refreshing}
              >
                {refreshing ? "Retrying..." : "Retry"}
              </button>
              <Link href={routes.quizWorkspace(courseId, quizId, { view: "analysis" })}>
                <button className="edu-btn">Open Sync & Analyze</button>
              </Link>
            </div>
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

  return (
    <div>
      <div className="edu-fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 className="edu-heading" style={{ fontSize: 22, margin: 0 }}>Students</h1>
        <button
          className="edu-btn"
          style={{ fontSize: 13, padding: "8px 16px" }}
          onClick={openBatchModal}
          disabled={batchGenerating}
        >
          {batchGenerating ? "Generating Notes..." : "Batch Generate Notes"}
        </button>
      </div>

      {/* ── Batch generation modal ── */}
      {showBatchModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Batch generate asset notes"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(34, 25, 18, 0.38)",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => { if (!batchGenerating) closeBatchModal(); }}
        >
          <div
            className="edu-card edu-fade-in"
            style={{
              width: "min(680px, 100%)",
              maxHeight: "88vh",
              overflow: "hidden",
              background: "#FFFDF9",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* ── Modal header ── */}
            <div style={{
              padding: "18px 22px 14px",
              borderBottom: "1px solid #F0ECE5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <h3 className="edu-heading" style={{ fontSize: 17, margin: 0 }}>
                  Batch Generate Asset Notes
                </h3>
                <p className="edu-muted" style={{ fontSize: 11, margin: "3px 0 0" }}>
                  AI-generated drafts &middot; review before sharing
                </p>
              </div>
              {!batchGenerating && (
                <button
                  className="edu-btn-outline"
                  style={{ fontSize: 12, padding: "4px 12px" }}
                  onClick={closeBatchModal}
                >
                  Close
                </button>
              )}
            </div>

            {/* ── Modal body ── */}
            <div style={{ padding: "16px 22px 20px", overflowY: "auto", flex: 1 }}>

              {/* ── Phase: Select ── */}
              {batchPhase === "select" && (
                <>
                  <p className="edu-section-label">Select Student Group</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    {batchCategoryOptions.map((option) => {
                      const isSelected = batchFilter === option.value;
                      const isEmpty = option.count === 0;
                      return (
                        <button
                          key={option.value}
                          onClick={() => { if (!isEmpty) setBatchFilter(option.value); }}
                          disabled={isEmpty}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 14px",
                            borderRadius: 8,
                            border: isSelected ? "1.5px solid #6E4836" : "1.5px solid #E8DFD4",
                            background: isSelected ? "#FAF4EE" : isEmpty ? "#F8F5EF" : "#FFF",
                            cursor: isEmpty ? "not-allowed" : "pointer",
                            opacity: isEmpty ? 0.5 : 1,
                            fontFamily: "inherit",
                            textAlign: "left",
                            transition: "border-color 0.15s, background 0.15s",
                            width: "100%",
                          }}
                        >
                          <div style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: isSelected ? "4px solid #6E4836" : "2px solid #D0C8BE",
                            background: isSelected ? "#FFF" : "transparent",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: isSelected ? "#3D3229" : "#5A5048",
                              }}>
                                {option.label}
                              </span>
                              <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: isSelected ? "#6E4836" : "#B5AA9C",
                                background: isSelected ? "#EDE4DA" : "#F0ECE5",
                                padding: "1px 7px",
                                borderRadius: 10,
                              }}>
                                {option.count}
                              </span>
                              {option.value === "critical+high" && option.count > 0 && (
                                <span style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: "#C17A56",
                                  textTransform: "uppercase",
                                  letterSpacing: 0.6,
                                }}>
                                  Recommended
                                </span>
                              )}
                            </div>
                            {option.count > 0 && (
                              <p style={{
                                fontSize: 11,
                                color: "#B5AA9C",
                                margin: "3px 0 0",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                textTransform: "capitalize",
                              }}>
                                {option.preview.join(", ")}
                                {option.count > option.preview.length
                                  ? ` +${option.count - option.preview.length} more`
                                  : ""}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Preview of selected students */}
                  {selectedCount > 0 && (
                    <div style={{
                      background: "#F8F5EF",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 16,
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#8A7D6F", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.4 }}>
                        Will generate for {selectedCount} student{selectedCount !== 1 ? "s" : ""}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {targetStudents.slice(0, 8).map((s) => {
                          const riskStyle = RISK_COLORS[s.riskLevel] ?? RISK_COLORS.low;
                          return (
                            <span
                              key={s.studentId}
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "3px 8px",
                                borderRadius: 4,
                                background: riskStyle.bg,
                                color: riskStyle.color,
                                textTransform: "capitalize",
                              }}
                            >
                              {getDisplayName(s.studentId)}
                            </span>
                          );
                        })}
                        {targetStudents.length > 8 && (
                          <span style={{ fontSize: 11, color: "#8A7D6F", padding: "3px 4px" }}>
                            +{targetStudents.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="edu-btn"
                      style={{ fontSize: 13 }}
                      onClick={() => { void runBatchGenerate(); }}
                      disabled={selectedCount === 0}
                    >
                      Generate {selectedCount > 0 ? `${selectedCount} Note${selectedCount !== 1 ? "s" : ""}` : "Notes"}
                    </button>
                    <button className="edu-btn-outline" style={{ fontSize: 13 }} onClick={closeBatchModal}>
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* ── Phase: Generating ── */}
              {batchPhase === "generating" && (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      border: "3px solid #E8DFD4",
                      borderTopColor: "#C17A56",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      margin: "0 auto 18px",
                    }}
                  />
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#5A5048", marginBottom: 6 }}>
                    Generating asset notes...
                  </p>
                  <p className="edu-muted" style={{ fontSize: 13, marginBottom: 4 }}>
                    Creating notes for {selectedCount} student{selectedCount !== 1 ? "s" : ""}
                  </p>
                  <p className="edu-muted" style={{ fontSize: 12, marginBottom: 16 }}>
                    This may take a minute. Please don&apos;t close this window.
                  </p>

                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    justifyContent: "center",
                    maxWidth: 480,
                    margin: "0 auto",
                  }}>
                    {targetStudents.slice(0, 12).map((s) => {
                      const riskStyle = RISK_COLORS[s.riskLevel] ?? RISK_COLORS.low;
                      return (
                        <span
                          key={s.studentId}
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: riskStyle.bg,
                            color: riskStyle.color,
                            textTransform: "capitalize",
                            opacity: 0.7,
                          }}
                        >
                          {getDisplayName(s.studentId)}
                        </span>
                      );
                    })}
                    {targetStudents.length > 12 && (
                      <span style={{ fontSize: 10, color: "#B5AA9C", padding: "2px 4px" }}>
                        +{targetStudents.length - 12} more
                      </span>
                    )}
                  </div>

                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* ── Phase: Results ── */}
              {batchPhase === "results" && (
                <div>
                  {batchResult ? (
                    <>
                      {/* Success/fail summary */}
                      <div style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: 18,
                      }}>
                        <div style={{
                          flex: 1,
                          background: "#E9F3E5",
                          borderRadius: 8,
                          padding: "14px 16px",
                          textAlign: "center",
                        }}>
                          <p style={{ fontSize: 28, fontWeight: 700, color: "#3D7A2E", margin: 0 }}>
                            {batchResult.generated}
                          </p>
                          <p style={{ fontSize: 11, color: "#3D7A2E", margin: "2px 0 0", fontWeight: 600 }}>
                            Generated
                          </p>
                        </div>
                        {batchResult.failed > 0 && (
                          <div style={{
                            flex: 1,
                            background: "#FDECEA",
                            borderRadius: 8,
                            padding: "14px 16px",
                            textAlign: "center",
                          }}>
                            <p style={{ fontSize: 28, fontWeight: 700, color: "#A63D2E", margin: 0 }}>
                              {batchResult.failed}
                            </p>
                            <p style={{ fontSize: 11, color: "#A63D2E", margin: "2px 0 0", fontWeight: 600 }}>
                              Failed
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Per-student results */}
                      <p className="edu-section-label">Student Results</p>
                      <div style={{
                        maxHeight: 280,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        marginBottom: 16,
                      }}>
                        {batchResult.results.map((entry) => {
                          const studentMatch = students.find((s) => s.studentId === entry.studentId);
                          const riskStyle = studentMatch
                            ? RISK_COLORS[studentMatch.riskLevel] ?? RISK_COLORS.low
                            : RISK_COLORS.low;
                          const isSuccess = entry.status === "success";
                          return (
                            <div
                              key={entry.studentId}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "8px 12px",
                                borderRadius: 6,
                                background: isSuccess ? "#F6FBF4" : "#FDF4F2",
                              }}
                            >
                              <span style={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                background: isSuccess ? "#E9F3E5" : "#FDECEA",
                                color: isSuccess ? "#3D7A2E" : "#A63D2E",
                                flexShrink: 0,
                              }}>
                                {isSuccess ? "\u2713" : "\u2717"}
                              </span>
                              <span style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#3D3229",
                                textTransform: "capitalize",
                                flex: 1,
                                minWidth: 0,
                              }}>
                                {getDisplayName(entry.studentId)}
                              </span>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "2px 7px",
                                borderRadius: 3,
                                background: riskStyle.bg,
                                color: riskStyle.color,
                                textTransform: "lowercase",
                                flexShrink: 0,
                              }}>
                                {studentMatch?.riskLevel ?? "—"}
                              </span>
                              {!isSuccess && entry.error && (
                                <span style={{
                                  fontSize: 10,
                                  color: "#A63D2E",
                                  maxWidth: 180,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                                  title={toReadableGenerationError(entry.error, "Generation failed")}
                                >
                                  {toReadableGenerationError(entry.error, "Failed")}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button className="edu-btn" style={{ fontSize: 13 }} onClick={closeBatchModal}>
                        Done
                      </button>
                    </>
                  ) : batchError ? (
                    <>
                      <div style={{
                        background: "#FDECEA",
                        borderRadius: 8,
                        padding: "16px 18px",
                        marginBottom: 16,
                      }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#A63D2E", margin: "0 0 6px" }}>
                          Generation Failed
                        </p>
                        <p style={{ fontSize: 13, color: "#5A5048", margin: 0, lineHeight: 1.55 }}>
                          {batchError}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="edu-btn"
                          style={{ fontSize: 13 }}
                          onClick={() => { setBatchPhase("select"); setBatchError(null); }}
                        >
                          Try Again
                        </button>
                        <button className="edu-btn-outline" style={{ fontSize: 13 }} onClick={closeBatchModal}>
                          Close
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

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
                const displayName = getDisplayName(student.studentId);
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

function GapDetailCollapsible({
  concept,
  errorType,
  affectedQuestions,
  evidence,
  index,
}: {
  concept: string;
  errorType: string;
  affectedQuestions: string[];
  evidence: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const errorColor = ERROR_TYPE_COLORS[errorType] ?? "#8A7D6F";
  const errorBg = ERROR_TYPE_BG[errorType] ?? "#F5F0E9";

  return (
    <div style={{
      borderRadius: 8,
      border: "1px solid #F0ECE5",
      overflow: "hidden",
      transition: "box-shadow 0.2s",
      boxShadow: open ? "0 2px 8px rgba(61, 50, 41, 0.06)" : "none",
    }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
          padding: "14px 16px",
          border: "none",
          background: open ? "#FDFBF7" : "transparent",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
          transition: "background 0.15s",
        }}
      >
        <span
          className="edu-priority-number"
          style={{
            background: errorBg,
            color: errorColor,
          }}
        >
          {index + 1}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#3D3229", margin: 0 }}>
            {concept}
          </p>
          <p style={{ fontSize: 11, color: "#B5AA9C", margin: "2px 0 0" }}>
            Q: {affectedQuestions.join(", ")}
          </p>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 4,
            color: errorColor,
            background: errorBg,
            textTransform: "lowercase",
            flexShrink: 0,
          }}
        >
          {errorType}
        </span>
        <span style={{
          fontSize: 10,
          color: "#B5AA9C",
          transition: "transform 0.25s ease",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          flexShrink: 0,
        }}>{"\u25BC"}</span>
      </button>
      <div className="edu-collapsible-body" data-open={open}>
        <div>
          {evidence ? (
            <div style={{ padding: "0 16px 14px 50px" }}>
              <div className="edu-insight-strip" style={{ borderLeftColor: errorColor }}>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>
                  <strong>Evidence:</strong> {evidence}
                </p>
              </div>
            </div>
          ) : null}
        </div>
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
  const [savedNote, setSavedNote] = useState<SavedStudentNote | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);

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
    let cancelled = false;
    async function loadSavedNote() {
      try {
        const response = await fetch(
          `/api/notes?courseId=${courseId}&quizId=${quizId}&studentId=${studentId}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as { notes?: SavedStudentNote[] };
        if (!cancelled) {
          const [firstNote] = payload.notes ?? [];
          setSavedNote(firstNote ?? null);
        }
      } catch {
        // silent
      }
    }

    void loadSavedNote();
    return () => {
      cancelled = true;
    };
  }, [courseId, quizId, studentId]);

  useEffect(() => {
    if (!showAssetModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAssetModal(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showAssetModal]);

  async function generateNote() {
    setGeneratingNote(true);
    setNoteError(null);
    try {
      const response = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId, studentId }),
      });
      const payload = (await response.json()) as {
        error?: string;
        note?: SavedStudentNote;
      };

      if (!response.ok || !payload.note) {
        throw new Error(payload.error ?? "Failed to generate note");
      }

      setSavedNote(payload.note);
      setShowAssetModal(true);
    } catch (generateError) {
      const message = generateError instanceof Error ? generateError.message : "Failed to generate note";
      setNoteError(toReadableGenerationError(message, "Failed to generate note"));
    } finally {
      setGeneratingNote(false);
    }
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
  const hasGeneratedAsset = savedNote?.status === "success" && Boolean(savedNote.note);
  const hasFailedAsset = savedNote?.status === "error";
  const persistedNoteError = hasFailedAsset
    ? toReadableGenerationError(savedNote?.error, "Previous asset generation failed.")
    : null;
  const activeNoteError = noteError ?? persistedNoteError;
  const assetActionLabel = generatingNote
    ? "Generating Asset..."
    : hasGeneratedAsset
      ? "View Asset"
      : hasFailedAsset
        ? "Retry Asset"
        : "Generate Asset";

  function handleAssetAction() {
    if (hasGeneratedAsset) {
      setShowAssetModal(true);
      return;
    }
    void generateNote();
  }

  const conceptualGaps = student.misconceptions.filter((m) => m.errorType === "conceptual");
  const otherGaps = student.misconceptions.filter((m) => m.errorType !== "conceptual");
  const sortedGaps = [...conceptualGaps, ...otherGaps];

  return (
    <div>
      {/* ── Student header card ── */}
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
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
          <button
            className="edu-btn-outline"
            onClick={handleAssetAction}
            disabled={generatingNote}
            style={{ fontSize: 12, padding: "4px 12px" }}
          >
            {assetActionLabel}
          </button>
          {activeNoteError ? (
            <p style={{ margin: 0, maxWidth: 280, textAlign: "right", fontSize: 11, color: "#A63D2E" }}>
              {activeNoteError}
            </p>
          ) : null}
        </div>
      </div>

      {/* ── Quick summary strip ── */}
      <div
        className="edu-fade-in edu-fd1"
        style={{
          padding: "10px 16px",
          borderRadius: 6,
          background: student.riskLevel === "critical" || student.riskLevel === "high" ? "#FDECEA" : "#FEF8E7",
          borderLeft: `3px solid ${risk.color}`,
          marginBottom: 20,
          fontSize: 13,
          color: "#5A5048",
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: risk.color }}>{student.misconceptions.length}</strong> knowledge gap{student.misconceptions.length !== 1 ? "s" : ""} identified &middot;{" "}
        <strong style={{ color: "#C17A56" }}>{student.interventions.length}</strong> suggested intervention{student.interventions.length !== 1 ? "s" : ""}
      </div>

      {/* ── Knowledge Gaps (expandable cards) ── */}
      <div className="edu-fade-in edu-fd2" style={{ marginBottom: 20 }}>
        <p className="edu-section-label">Knowledge Gaps</p>
        {sortedGaps.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedGaps.map((misconception, index) => (
              <GapDetailCollapsible
                key={`gap-${index}`}
                concept={misconception.concept}
                errorType={misconception.errorType}
                affectedQuestions={misconception.affectedQuestions}
                evidence={misconception.evidence}
                index={index}
              />
            ))}
          </div>
        ) : (
          <p className="edu-muted" style={{ fontSize: 13 }}>No knowledge gaps identified.</p>
        )}
      </div>

      {/* ── Rationale (if present) ── */}
      {student.rationale ? (
        <div className="edu-fade-in edu-fd3" style={{ marginBottom: 20 }}>
          <div className="edu-insight-strip" style={{ borderLeftColor: "#2B5E9E" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8A7D6F", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                AI Rationale
              </p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, wordBreak: "break-word" }}>
                {student.rationale}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Interventions (numbered action list) ── */}
      <div className="edu-card edu-fade-in edu-fd4" style={{ padding: 20, marginBottom: 14 }}>
        <p className="edu-section-label" style={{ margin: "0 0 14px" }}>Suggested Interventions</p>
        {student.interventions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {student.interventions.map((intervention, index) => (
              <div
                key={`intervention-${index}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 14px",
                  background: "#FDFBF7",
                  borderRadius: 8,
                }}
              >
                <span
                  className="edu-priority-number"
                  style={{
                    background: "#FEF8E7",
                    color: "#8B6914",
                    marginTop: 2,
                  }}
                >
                  {index + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#3D3229", margin: "0 0 4px" }}>
                    {intervention.action}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 3,
                      background: "#F0ECE5",
                      color: "#6D6154",
                      textTransform: "capitalize",
                    }}>
                      {intervention.focusArea}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 3,
                      background: "#E3EDF7",
                      color: "#2B5E9E",
                      textTransform: "capitalize",
                    }}>
                      {intervention.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="edu-muted" style={{ fontSize: 13, margin: 0 }}>No interventions suggested.</p>
        )}
      </div>

      {showAssetModal && savedNote ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Generated student asset"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(34, 25, 18, 0.38)",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowAssetModal(false)}
        >
          <div
            className="edu-card"
            style={{
              width: "min(900px, 100%)",
              maxHeight: "88vh",
              overflow: "hidden",
              padding: 20,
              background: "#FFFDF9",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3 className="edu-heading" style={{ fontSize: 17, margin: 0 }}>
                  Student Asset
                </h3>
                <p className="edu-muted" style={{ fontSize: 12, margin: "3px 0 0", textTransform: "capitalize" }}>
                  {displayName}
                </p>
              </div>
              <button
                className="edu-btn-outline"
                style={{ fontSize: 12, padding: "4px 12px" }}
                onClick={() => setShowAssetModal(false)}
              >
                Close
              </button>
            </div>
            <div style={{ maxHeight: "72vh", overflowY: "auto", paddingRight: 4 }}>
              <StudentNoteCard
                note={savedNote}
                onRegenerate={generateNote}
                regenerating={generatingNote}
              />
            </div>
          </div>
        </div>
      ) : null}

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
