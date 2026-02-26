"use client";

import { useEffect, useState, useCallback } from "react";

interface HistoryAnalysis {
  overallTrend: string;
  confidence: string;
  evidenceSummary: {
    scoreTrajectorySummary: string;
    riskTrajectorySummary: string;
    recurringWeakConcepts: string[];
  };
  interventionImpactHypothesis: {
    appearsToImprove: string[];
    remainsUnresolved: string[];
  };
  nextCycleActions: string[];
  trendContradiction?: string;
}

interface SavedData {
  analysis: HistoryAnalysis;
  analyzedQuizIds: string[];
  analyzedAt: number;
  status: string;
}

const TREND_DISPLAY: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  improving: { label: "Improving", bg: "#E9F3E5", color: "#3D7A2E", icon: "↑" },
  stable: { label: "Stable", bg: "#E3EDF7", color: "#2B5E9E", icon: "→" },
  declining: { label: "Declining", bg: "#FDECEA", color: "#A63D2E", icon: "↓" },
  insufficient_data: { label: "Insufficient Data", bg: "#F5F0E9", color: "#8A7D6F", icon: "?" },
};

const CONFIDENCE_DISPLAY: Record<string, { bg: string; color: string }> = {
  high: { bg: "#E9F3E5", color: "#3D7A2E" },
  medium: { bg: "#FEF8E7", color: "#8B6914" },
  low: { bg: "#F5F0E9", color: "#8A7D6F" },
};

export default function HistoryAnalysisPanel({ courseId }: { courseId: string }) {
  const [data, setData] = useState<SavedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/history-analysis?courseId=${courseId}`)
      .then((r) => r.json())
      .then((d) => { if (d.found) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const runAnalysis = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const d = await res.json();
      if (d.success && d.analysis) {
        setData(d.analysis);
      } else {
        setError(d.error ?? "Analysis failed");
      }
    } catch {
      setError("Network error");
    }
    setGenerating(false);
  }, [courseId]);

  if (loading) return null;

  if (!data) {
    return (
      <div className="edu-card edu-fade-in" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 4 }}>AI History Analysis</h3>
            <p className="edu-muted" style={{ fontSize: 13 }}>Analyze trends across quiz cycles with AI.</p>
          </div>
          <button className="edu-btn" style={{ padding: "8px 18px", fontSize: 13 }} onClick={runAnalysis} disabled={generating}>
            {generating ? "Analyzing…" : "Run History Analysis"}
          </button>
        </div>
        {error && <p style={{ fontSize: 13, color: "#A63D2E", marginTop: 10 }}>{error}</p>}
      </div>
    );
  }

  const a = data.analysis;
  const trend = TREND_DISPLAY[a.overallTrend] ?? TREND_DISPLAY.insufficient_data;
  const conf = CONFIDENCE_DISPLAY[a.confidence] ?? CONFIDENCE_DISPLAY.low;

  return (
    <div className="edu-card edu-fade-in" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 className="edu-heading" style={{ fontSize: 17, margin: 0 }}>AI History Analysis</h3>
          <p className="edu-muted" style={{ fontSize: 11, margin: "4px 0 0" }}>
            Based on {data.analyzedQuizIds.length} quiz(es) · Analyzed {new Date(data.analyzedAt).toLocaleString()} · <span style={{ fontStyle: "italic" }}>AI-generated</span>
          </p>
        </div>
        <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 12 }} onClick={runAnalysis} disabled={generating}>
          {generating ? "Re-running…" : "Re-run"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ background: trend.bg, borderRadius: 8, padding: "14px 20px", flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: trend.color, margin: 0 }}>{trend.icon}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: trend.color, margin: "4px 0 0" }}>{trend.label}</p>
          <p style={{ fontSize: 11, color: trend.color, margin: "2px 0 0" }}>Overall Trend</p>
        </div>
        <div style={{ background: conf.bg, borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 100 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: conf.color, margin: 0, textTransform: "capitalize" }}>{a.confidence}</p>
          <p style={{ fontSize: 11, color: conf.color, margin: "2px 0 0" }}>Confidence</p>
        </div>
      </div>

      {a.overallTrend !== "insufficient_data" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: "#5A5048", margin: "0 0 6px" }}>Evidence Summary</h4>
            <p style={{ fontSize: 13, color: "#3D3229", lineHeight: 1.6, margin: "0 0 4px" }}>
              <strong>Scores:</strong> {a.evidenceSummary.scoreTrajectorySummary}
            </p>
            <p style={{ fontSize: 13, color: "#3D3229", lineHeight: 1.6, margin: "0 0 4px" }}>
              <strong>Risks:</strong> {a.evidenceSummary.riskTrajectorySummary}
            </p>
            {a.evidenceSummary.recurringWeakConcepts.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                <span style={{ fontSize: 12, color: "#5A5048", fontWeight: 500 }}>Recurring:</span>
                {a.evidenceSummary.recurringWeakConcepts.map((c, i) => (
                  <span key={i} style={{ fontSize: 11, background: "#FDECEA", color: "#A63D2E", padding: "2px 8px", borderRadius: 3 }}>{c}</span>
                ))}
              </div>
            )}
          </div>

          {a.trendContradiction && (
            <div style={{ background: "#FEF8E7", borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#8B6914" }}>
              <strong>⚠ Trend Contradiction:</strong> {a.trendContradiction}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#3D7A2E", margin: "0 0 6px" }}>Appears to Improve</h4>
              {a.interventionImpactHypothesis.appearsToImprove.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048", lineHeight: 1.6 }}>
                  {a.interventionImpactHypothesis.appearsToImprove.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              ) : (
                <p className="edu-muted" style={{ fontSize: 12 }}>No clear improvement signals yet.</p>
              )}
            </div>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#A63D2E", margin: "0 0 6px" }}>Remains Unresolved</h4>
              {a.interventionImpactHypothesis.remainsUnresolved.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048", lineHeight: 1.6 }}>
                  {a.interventionImpactHypothesis.remainsUnresolved.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              ) : (
                <p className="edu-muted" style={{ fontSize: 12 }}>No persistent issues identified.</p>
              )}
            </div>
          </div>

          {a.nextCycleActions.length > 0 && (
            <div style={{ background: "#F5F0E9", borderRadius: 6, padding: "12px 16px" }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#C17A56", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Next Cycle Actions
              </h4>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, color: "#3D3229" }}>
                {a.nextCycleActions.map((act, i) => <li key={i}>{act}</li>)}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
