"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { routes } from "@/lib/routes";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";
import RiskDistribution from "@/lib/charts/RiskDistribution";

interface SyncStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
  detail: string;
}

const INITIAL_STEPS: SyncStep[] = [
  { id: "s1", label: "Syncing course data", status: "pending", detail: "" },
  { id: "s2", label: "Fetching quiz structure from Google Forms", status: "pending", detail: "" },
  { id: "s3", label: "Downloading student responses", status: "pending", detail: "" },
  { id: "s4", label: "Saving to database", status: "pending", detail: "" },
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
      updateStep("s1", { status: "completed", detail: `${courseCount} course(s) synced` });

      updateStep("s2", { status: "in_progress" });
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateStep("s2", { status: "completed", detail: "Form structure loaded" });

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
        detail: `${totalResponses} responses across ${quizCount} quiz(es)`,
      });

      updateStep("s4", { status: "in_progress" });
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateStep("s4", { status: "completed", detail: "All data persisted" });

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

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Data Sync
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        Sync quiz data from Google Classroom and Forms (starts automatically)
      </p>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24, marginBottom: 20 }}>
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
        <p style={{ color: "#A63D2E", fontSize: 13, marginBottom: 14 }}>{error}</p>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        {!done && (
          <button className="edu-btn" onClick={startSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Start Sync"}
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
  const [statusText, setStatusText] = useState("Ready to sync and analyze quiz responses");

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

  async function runAnalysis() {
    const hasPreviousCompletedResult = complete && summary !== null;
    setRunning(true);
    setError(null);
    setShowingPreviousResult(false);
    setStatusText("Syncing classroom roster and metadata...");

    try {
      const coursesResponse = await fetch("/api/sync/courses", { method: "POST" });
      const coursesPayload = await coursesResponse.json().catch(() => ({}));
      if (!coursesResponse.ok) {
        throw new Error(toApiErrorMessage(coursesPayload, "Course sync failed"));
      }

      setStatusText("Syncing latest quiz responses...");
      const quizSyncResponse = await fetch("/api/sync/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const quizSyncPayload = await quizSyncResponse.json().catch(() => ({}));
      if (!quizSyncResponse.ok) {
        throw new Error(toApiErrorMessage(quizSyncPayload, "Quiz sync failed"));
      }

      setStatusText("Running Gemini misconception analysis...");

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
      setStatusText("Sync and analysis failed");
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
          color: "#A96842",
        },
      ]
    : [];

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Sync & Analyze
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        Sync data and run Gemini analysis in one section
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
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {!running && !complete && (
          <>
            <p style={{ fontSize: 15, marginBottom: 6 }}>{statusText}</p>
            <p className="edu-muted" style={{ fontSize: 13, marginBottom: 16 }}>
              If no prior analysis exists, this runs sync first, then analysis automatically
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
              <span>Avg: <strong>{summary.scoreMetrics.averageScore.toFixed(1)}%</strong></span>
              <span>Median: <strong>{summary.scoreMetrics.medianScore.toFixed(1)}%</strong></span>
              <span>Completion: <strong>{summary.scoreMetrics.averageCompletionRate.toFixed(0)}%</strong></span>
            </div>
          </>
        )}

        {error && !showingPreviousResult && (
          <p style={{ color: "#A63D2E", fontSize: 13, marginTop: 10 }}>{error}</p>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!running && !complete && (
          <button className="edu-btn" onClick={runAnalysis} disabled={running}>
            {running ? "Running..." : "Run Sync + Analysis"}
          </button>
        )}
        {!running && complete && (
          <>
            <Link href={routes.quizWorkspace(courseId, quizId, { view: "insights" })}>
              <button className="edu-btn">Open Insights</button>
            </Link>
            <button className="edu-btn-outline" onClick={runAnalysis} disabled={running}>
              Re-sync & Re-run
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
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async () => {
    const response = await fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as AnalysisData & { found?: boolean };
    if (payload.found) {
      setData(payload);
    } else {
      setData(null);
    }
  }, [courseId, quizId]);

  useEffect(() => {
    loadAnalysis()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadAnalysis]);

  async function runAnalysisInPlace() {
    setRunningAnalysis(true);
    setActionError(null);
    try {
      const response = await fetch("/api/analyze/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setActionError(payload.error ?? "Failed to run analysis.");
        return;
      }
      await loadAnalysis();
    } catch {
      setActionError("Failed to run analysis.");
    } finally {
      setRunningAnalysis(false);
    }
  }

  if (loading) {
    return <p className="edu-muted">Loading insights...</p>;
  }

  if (!data) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 12 }}>Class Insights</h1>
        <p className="edu-muted" style={{ marginBottom: 12 }}>
          {runningAnalysis
            ? "Running analysis now..."
            : "No analysis found. Run Sync & Analyze to generate class insights."}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="edu-btn" onClick={runAnalysisInPlace} disabled={runningAnalysis}>
            {runningAnalysis ? "Running..." : "Run Sync & Analyze"}
          </button>
          <Link href={routes.quizWorkspace(courseId, quizId, { view: "analysis" })}>
            <button className="edu-btn-outline">Open Sync & Analyze</button>
          </Link>
        </div>
        {actionError && (
          <p style={{ color: "#A63D2E", fontSize: 12, marginTop: 10 }}>{actionError}</p>
        )}
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

  return (
    <div>
      <div className="edu-fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <h1 className="edu-heading" style={{ fontSize: 22, margin: 0 }}>
          Class Insights
        </h1>
        <Link href={routes.quizWorkspace(courseId, quizId, { view: "students" })}>
          <button className="edu-btn" style={{ fontSize: 13, padding: "8px 18px" }}>
            View Students
          </button>
        </Link>
      </div>

      <div className="edu-fade-in edu-fd1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Average", value: scoreMetrics.averageScore.toFixed(1) },
          { label: "Median", value: String(Math.round(scoreMetrics.medianScore)) },
          { label: "Completion", value: `${scoreMetrics.averageCompletionRate.toFixed(2)}%` },
          { label: "At Risk", value: String(atRiskCount) },
        ].map((stat) => (
          <div key={stat.label} className="edu-card" style={{ padding: 18, textAlign: "center" }}>
            <p className="edu-muted" style={{ fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: "#3D3229", margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="edu-fade-in edu-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div className="edu-card" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>Concept Mastery</h3>
          <ConceptHeatmap data={heatmapData} />
        </div>
        <div className="edu-card" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>Risk Levels</h3>
          <RiskDistribution data={riskChartData} />
        </div>
      </div>

      <div className="edu-card edu-fade-in edu-fd3" style={{ padding: 24 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 16 }}>Error Types</h3>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${errorTypeBreakdown.length}, 1fr)`, gap: 14 }}>
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
      </div>
    </div>
  );
}

export function QuizStudentsPanel({ courseId, quizId }: { courseId: string; quizId: string }) {
  const [students, setStudents] = useState<StudentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("all");
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    const response = await fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`, {
      cache: "no-store",
    });
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
  }, [courseId, quizId]);

  useEffect(() => {
    loadStudents()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadStudents]);

  async function runAnalysisInPlace() {
    setRunningAnalysis(true);
    setActionError(null);
    try {
      const response = await fetch("/api/analyze/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setActionError(payload.error ?? "Failed to run analysis.");
        return;
      }
      await loadStudents();
    } catch {
      setActionError("Failed to run analysis.");
    } finally {
      setRunningAnalysis(false);
    }
  }

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

  if (loading) return <p className="edu-muted">Loading students...</p>;

  if (students.length === 0) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 12 }}>Students</h1>
        <p className="edu-muted" style={{ marginBottom: 12 }}>
          {runningAnalysis
            ? "Running analysis now..."
            : "No analysis results. Run Sync & Analyze to unlock student-level insights."}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="edu-btn" onClick={runAnalysisInPlace} disabled={runningAnalysis}>
            {runningAnalysis ? "Running..." : "Run Sync & Analyze"}
          </button>
          <Link href={routes.quizWorkspace(courseId, quizId, { view: "analysis" })}>
            <button className="edu-btn-outline">Open Sync & Analyze</button>
          </Link>
        </div>
        {actionError && (
          <p style={{ color: "#A63D2E", fontSize: 12, marginTop: 10 }}>{actionError}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 16 }}>Students</h1>

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

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 0, overflow: "hidden" }}>
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
                    {score}/{SCORE_MAX}
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
              {email} &middot; Score: {score}/{SCORE_MAX}
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

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24, marginBottom: 20 }}>
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

      <div style={{ display: "flex", gap: 10 }}>
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
