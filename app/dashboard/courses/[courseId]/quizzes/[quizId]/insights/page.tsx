"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";

interface RiskEntry { riskLevel: string; count: number; percentage: number }
interface ConceptEntry { concept: string; affectedStudentCount: number; questionIds: string[]; dominantErrorType: string }
interface ScoreMetrics { averageScore: number; medianScore: number; averageCompletionRate: number }
interface ErrorBreakdown { errorType: string; count: number; percentage: number }

interface AnalysisData {
  derivedAnalysis: {
    riskDistribution: RiskEntry[];
    scoreMetrics: ScoreMetrics;
    conceptHeatmap: ConceptEntry[];
    errorTypeBreakdown: ErrorBreakdown[];
  };
  modelOutput: {
    students: { studentId: string; riskLevel: string }[];
  };
}

export default function InsightsPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async () => {
    const res = await fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`, {
      cache: "no-store",
    });
    const payload = (await res.json()) as AnalysisData & { found?: boolean };
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
      const res = await fetch("/api/analyze/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
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
            : "No analysis found. Run analysis to generate class insights."}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="edu-btn" onClick={runAnalysisInPlace} disabled={runningAnalysis}>
            {runningAnalysis ? "Running..." : "Run Analysis Now"}
          </button>
          <Link href={routes.analysis(courseId, quizId)}>
            <button className="edu-btn-outline">Open Analysis Page</button>
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
    .filter((r) => r.riskLevel === "critical" || r.riskLevel === "high")
    .reduce((s, r) => s + r.count, 0);

  const riskChartData = riskDistribution.map((r) => ({
    level: r.riskLevel as "low" | "medium" | "high" | "critical",
    count: r.count,
    percentage: r.percentage,
  }));

  const heatmapData = conceptHeatmap.map((c) => ({
    concept: c.concept,
    questionIds: c.questionIds,
    correctRate: 1 - c.affectedStudentCount / (data.modelOutput.students.length || 1),
    studentsMastered: (data.modelOutput.students.length || 0) - c.affectedStudentCount,
    studentsStruggling: c.affectedStudentCount,
    dominantErrorType: c.dominantErrorType as "conceptual" | "procedural" | "careless",
  }));

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Class Insights
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        AI-generated analysis results
      </p>

      <div className="edu-fade-in edu-fd1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Average Score", value: `${scoreMetrics.averageScore.toFixed(1)}%`, color: "#C17A56" },
          { label: "Median Score", value: `${scoreMetrics.medianScore.toFixed(1)}%`, color: "#6B8E5C" },
          { label: "Completion Rate", value: `${scoreMetrics.averageCompletionRate.toFixed(0)}%`, color: "#2B5E9E" },
          { label: "At-Risk Students", value: String(atRiskCount), color: "#A63D2E" },
        ].map((stat) => (
          <div key={stat.label} className="edu-card" style={{ padding: 18 }}>
            <p className="edu-muted" style={{ fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="edu-fade-in edu-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div className="edu-card" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>Risk Distribution</h3>
          <RiskDistribution data={riskChartData} />
        </div>
        <div className="edu-card" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>Error Type Breakdown</h3>
          {errorTypeBreakdown.map((e) => (
            <div key={e.errorType} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F0ECE5" }}>
              <span style={{ fontSize: 14, textTransform: "capitalize" }}>{e.errorType}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 80, height: 6, background: "#F0ECE5", borderRadius: 3 }}>
                  <div style={{
                    width: `${e.percentage}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: e.errorType === "conceptual" ? "#A63D2E" : e.errorType === "procedural" ? "#A25E1A" : "#2B5E9E",
                  }} />
                </div>
                <span className="edu-muted" style={{ fontSize: 12, minWidth: 36, textAlign: "right" }}>{e.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="edu-card edu-fade-in edu-fd3" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>Concept Mastery</h3>
        <ConceptHeatmap data={heatmapData} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Link href={routes.students(courseId, quizId)}>
          <button className="edu-btn">View Students</button>
        </Link>
        <Link href={routes.analysis(courseId, quizId)}>
          <button className="edu-btn-outline">Back to Analysis</button>
        </Link>
      </div>
    </div>
  );
}
