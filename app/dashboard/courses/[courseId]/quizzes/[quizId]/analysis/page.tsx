"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";

export default function AnalysisPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    studentsAnalyzed: number;
    riskDistribution: { riskLevel: string; count: number; percentage: number }[];
    scoreMetrics: { averageScore: number; medianScore: number; averageCompletionRate: number };
  } | null>(null);
  const [statusText, setStatusText] = useState("Ready to analyze quiz responses");

  useEffect(() => {
    fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.found) {
          setComplete(true);
          setSummary({
            studentsAnalyzed: data.modelOutput?.students?.length ?? 0,
            riskDistribution: data.derivedAnalysis?.riskDistribution ?? [],
            scoreMetrics: data.derivedAnalysis?.scoreMetrics ?? { averageScore: 0, medianScore: 0, averageCompletionRate: 0 },
          });
        }
      })
      .catch(() => {});
  }, [courseId, quizId]);

  async function runAnalysis() {
    setRunning(true);
    setError(null);
    setStatusText("Preparing quiz data for Gemini…");

    try {
      await new Promise((r) => setTimeout(r, 800));
      setStatusText("Sending to Gemini for misconception analysis…");

      const res = await fetch("/api/analyze/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }

      setSummary(data.summary);
      setComplete(true);
      setStatusText("Analysis complete");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis failed";
      setError(msg);
      setStatusText("Analysis failed");
    }
    setRunning(false);
  }

  const errorTypes = summary
    ? [
        {
          pct: `${summary.riskDistribution.find((r) => r.riskLevel === "critical")?.percentage ?? 0}%`,
          label: "Critical",
          color: "#A63D2E",
        },
        {
          pct: `${summary.riskDistribution.find((r) => r.riskLevel === "high")?.percentage ?? 0}%`,
          label: "High Risk",
          color: "#A25E1A",
        },
        {
          pct: `${summary.riskDistribution.find((r) => r.riskLevel === "medium")?.percentage ?? 0}%`,
          label: "Medium",
          color: "#8B6914",
        },
        {
          pct: `${summary.riskDistribution.find((r) => r.riskLevel === "low")?.percentage ?? 0}%`,
          label: "Low Risk",
          color: "#2B5E9E",
        },
      ]
    : [];

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        AI Analysis
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        Gemini-powered misconception analysis
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
              This may take 15–30 seconds
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {!running && !complete && (
          <>
            <p style={{ fontSize: 15, marginBottom: 6 }}>{statusText}</p>
            <p className="edu-muted" style={{ fontSize: 13, marginBottom: 16 }}>
              Gemini will classify errors into conceptual, procedural, and careless categories
            </p>
          </>
        )}

        {complete && summary && (
          <>
            <p style={{ fontSize: 15, color: "#3D7A2E", fontWeight: 600, marginBottom: 16 }}>
              ✓ Analysis complete — {summary.studentsAnalyzed} student(s) analyzed
            </p>
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

        {error && (
          <p style={{ color: "#A63D2E", fontSize: 13, marginTop: 10 }}>{error}</p>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!complete && (
          <button className="edu-btn" onClick={runAnalysis} disabled={running}>
            {running ? "Running…" : "Run Analysis"}
          </button>
        )}
        {complete && (
          <>
            <Link href={routes.insights(courseId, quizId)}>
              <button className="edu-btn">Open Insights</button>
            </Link>
            <button className="edu-btn-outline" onClick={runAnalysis} disabled={running}>
              Re-run
            </button>
          </>
        )}
      </div>
    </div>
  );
}
