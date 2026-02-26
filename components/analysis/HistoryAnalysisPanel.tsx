"use client";

import { useState, useCallback } from "react";

interface HistoryAnalysis {
  overallTrend: "improving" | "stable" | "declining" | "insufficient_data";
  confidence: "low" | "medium" | "high";
  evidenceSummary: {
    scoreTrajectory: string;
    riskTrajectory: string;
    recurringWeakConcepts: string[];
  };
  interventionImpactHypothesis: {
    improving: string[];
    unresolved: string[];
  };
  nextCycleActions: string[];
  contradictionFlag?: string;
  quizCount?: number;
  generatedAt?: number;
  status?: string;
}

const TREND_STYLE: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  improving: { label: "Improving", color: "#3D7A2E", bg: "#E9F3E5", icon: "↑" },
  stable: { label: "Stable", color: "#2B5E9E", bg: "#E8F0FA", icon: "→" },
  declining: { label: "Declining", color: "#A63D2E", bg: "#FDECEA", icon: "↓" },
  insufficient_data: { label: "Insufficient Data", color: "#8B6914", bg: "#FEF8E7", icon: "?" },
};

const CONFIDENCE_STYLE: Record<string, { color: string }> = {
  high: { color: "#3D7A2E" },
  medium: { color: "#8B6914" },
  low: { color: "#A63D2E" },
};

export default function HistoryAnalysisPanel({
  courseId,
  initialData,
}: {
  courseId: string;
  initialData: HistoryAnalysis | null;
}) {
  const [data, setData] = useState<HistoryAnalysis | null>(initialData);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Analysis failed");
      setData(result.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
    setRunning(false);
  }, [courseId]);

  if (!data && !running && !error) {
    return (
      <div className="edu-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 6 }}>AI History Analysis</h3>
            <p className="edu-muted" style={{ fontSize: 13 }}>Analyze performance trends across quizzes</p>
          </div>
          <button className="edu-btn" onClick={runAnalysis} style={{ padding: "8px 20px", fontSize: 13 }}>
            Run History Analysis
          </button>
        </div>
      </div>
    );
  }

  if (running) {
    return (
      <div className="edu-card" style={{ padding: 32, textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 32, height: 32, border: "3px solid #E8DFD4", borderTopColor: "#C17A56", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ fontSize: 14, color: "#8B6914", fontWeight: 500 }}>Analyzing quiz history with Gemini AI…</p>
        <p className="edu-muted" style={{ fontSize: 12 }}>This may take 15–30 seconds</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edu-card" style={{ padding: 20, borderLeft: "4px solid #A63D2E", marginBottom: 20 }}>
        <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 8 }}>AI History Analysis</h3>
        <p style={{ color: "#A63D2E", fontSize: 13, marginBottom: 8 }}>{error}</p>
        <button className="edu-btn-outline" style={{ fontSize: 12 }} onClick={runAnalysis}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const trend = TREND_STYLE[data.overallTrend] ?? TREND_STYLE.insufficient_data;
  const conf = CONFIDENCE_STYLE[data.confidence] ?? CONFIDENCE_STYLE.low;
  const isInsufficient = data.overallTrend === "insufficient_data";

  return (
    <div className="edu-card" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="edu-heading" style={{ fontSize: 17 }}>AI History Analysis</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {data.generatedAt && (
            <span className="edu-muted" style={{ fontSize: 11 }}>
              Analyzed {new Date(data.generatedAt).toLocaleDateString()} &middot; {data.quizCount ?? 0} quiz(es)
            </span>
          )}
          <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 11 }} onClick={runAnalysis} disabled={running}>
            Rerun
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ padding: "12px 20px", borderRadius: 10, background: trend.bg, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>{trend.icon}</span>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: trend.color, margin: 0 }}>{trend.label}</p>
            <p style={{ fontSize: 11, color: trend.color, margin: 0, opacity: 0.7 }}>Overall Trend</p>
          </div>
        </div>
        <div style={{ padding: "12px 20px", borderRadius: 10, background: "#F5F0E9", display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: conf.color, margin: 0, textTransform: "capitalize" }}>{data.confidence}</p>
            <p style={{ fontSize: 11, color: "#8A7D6F", margin: 0 }}>Confidence</p>
          </div>
        </div>
      </div>

      {!isInsufficient && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ background: "#F5F0E9", borderRadius: 10, padding: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Score Trajectory
              </h4>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#5A5048", margin: 0 }}>{data.evidenceSummary.scoreTrajectory}</p>
            </div>
            <div style={{ background: "#F5F0E9", borderRadius: 10, padding: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Risk Trajectory
              </h4>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#5A5048", margin: 0 }}>{data.evidenceSummary.riskTrajectory}</p>
            </div>
          </div>

          {data.evidenceSummary.recurringWeakConcepts.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#A63D2E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                Recurring Weak Concepts
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.evidenceSummary.recurringWeakConcepts.map((c) => (
                  <span key={c} style={{ padding: "4px 10px", background: "#FDECEA", color: "#A63D2E", borderRadius: 4, fontSize: 12 }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {data.contradictionFlag && (
            <div style={{ padding: "10px 14px", background: "#FEF8E7", borderRadius: 8, marginBottom: 14, borderLeft: "3px solid #8B6914" }}>
              <p style={{ fontSize: 12, color: "#8B6914", margin: 0 }}>
                <strong>Contradiction detected:</strong> {data.contradictionFlag}
              </p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#3D7A2E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Appears Improving
              </h4>
              {data.interventionImpactHypothesis.improving.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {data.interventionImpactHypothesis.improving.map((item, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#5A5048", marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="edu-muted" style={{ fontSize: 12 }}>No clear improvements detected yet</p>
              )}
            </div>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#A63D2E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Remains Unresolved
              </h4>
              {data.interventionImpactHypothesis.unresolved.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {data.interventionImpactHypothesis.unresolved.map((item, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#5A5048", marginBottom: 4 }}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="edu-muted" style={{ fontSize: 12 }}>No unresolved issues flagged</p>
              )}
            </div>
          </div>

          {data.nextCycleActions.length > 0 && (
            <div style={{ padding: "14px 16px", background: "#E9F3E5", borderRadius: 8 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#3D7A2E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Next Cycle Actions
              </h4>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {data.nextCycleActions.map((action, i) => (
                  <li key={i} style={{ fontSize: 13, lineHeight: 1.6, color: "#3D7A2E", marginBottom: 4 }}>{action}</li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}

      {isInsufficient && (
        <div style={{ padding: "14px 16px", background: "#FEF8E7", borderRadius: 8 }}>
          <p style={{ fontSize: 13, color: "#8B6914", margin: 0 }}>
            At least 2 analyzed quizzes are required for trend analysis. Analyze more quizzes to enable this feature.
          </p>
        </div>
      )}

      <p style={{ fontSize: 10, color: "#C5BAB0", marginTop: 12, fontStyle: "italic" }}>
        AI-generated analysis — evidence-based hypotheses, not causal claims
      </p>
    </div>
  );
}
