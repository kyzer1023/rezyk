"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedHistoryAnalysis } from "@/lib/analysis/history-analysis-schema";

const TREND_DISPLAY: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  improving: { label: "Improving", bg: "#E9F3E5", color: "#3D7A2E", icon: "^" },
  stable: { label: "Stable", bg: "#E3EDF7", color: "#2B5E9E", icon: "~" },
  declining: { label: "Declining", bg: "#FDECEA", color: "#A63D2E", icon: "v" },
  insufficient_data: {
    label: "Insufficient Data",
    bg: "#F5F0E9",
    color: "#8A7D6F",
    icon: "?",
  },
};

const CONFIDENCE_DISPLAY: Record<string, { bg: string; color: string }> = {
  high: { bg: "#E9F3E5", color: "#3D7A2E" },
  medium: { bg: "#FEF8E7", color: "#8B6914" },
  low: { bg: "#F5F0E9", color: "#8A7D6F" },
};

export default function HistoryAnalysisPanel({ courseId }: { courseId: string }) {
  const [data, setData] = useState<SavedHistoryAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistoryAnalysis() {
      try {
        const response = await fetch(`/api/analyze/history?courseId=${courseId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as { found?: boolean } & SavedHistoryAnalysis;
        if (!cancelled && payload.found) {
          setData(payload);
        }
      } catch {
        // silent, user can run manually
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHistoryAnalysis();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const runAnalysis = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        analysis?: SavedHistoryAnalysis;
        error?: string;
      };

      if (!response.ok || !payload.success || !payload.analysis) {
        throw new Error(payload.error ?? "History analysis failed");
      }
      setData(payload.analysis);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "History analysis failed");
    } finally {
      setGenerating(false);
    }
  }, [courseId]);

  if (loading) return null;

  if (!data) {
    return (
      <div className="edu-card edu-fade-in" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 4 }}>
              AI History Analysis
            </h3>
            <p className="edu-muted" style={{ fontSize: 13 }}>
              Analyze trends across quiz cycles with AI.
            </p>
          </div>
          <button
            className="edu-btn"
            style={{ padding: "8px 18px", fontSize: 13 }}
            onClick={() => {
              void runAnalysis();
            }}
            disabled={generating}
          >
            {generating ? "Analyzing..." : "Run History Analysis"}
          </button>
        </div>
        {error ? (
          <p style={{ fontSize: 13, color: "#A63D2E", marginTop: 10 }}>{error}</p>
        ) : null}
      </div>
    );
  }

  if (data.status === "insufficient_data") {
    return (
      <div className="edu-card edu-fade-in" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 10 }}>
          AI History Analysis
        </h3>
        <div style={{ background: "#FEF8E7", borderRadius: 6, padding: "12px 16px" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#8B6914", margin: "0 0 6px" }}>
            Insufficient Data
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#5A5048" }}>
            {data.error ?? "Run at least two quiz analyses before trend analysis."}
          </p>
        </div>
        <button
          className="edu-btn-outline"
          style={{ marginTop: 12, padding: "6px 14px", fontSize: 12 }}
          onClick={() => {
            void runAnalysis();
          }}
          disabled={generating}
        >
          {generating ? "Re-analyzing..." : "Re-run"}
        </button>
      </div>
    );
  }

  if (!data.analysis) {
    return null;
  }

  const analysis = data.analysis;
  const trend = TREND_DISPLAY[analysis.overallTrend] ?? TREND_DISPLAY.insufficient_data;
  const confidence = CONFIDENCE_DISPLAY[analysis.confidence] ?? CONFIDENCE_DISPLAY.low;

  return (
    <div className="edu-card edu-fade-in" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 className="edu-heading" style={{ fontSize: 17, margin: 0 }}>
            AI History Analysis
          </h3>
          <p className="edu-muted" style={{ fontSize: 11, margin: "4px 0 0" }}>
            Based on {data.analyzedQuizIds.length} quiz(es) | Analyzed{" "}
            {new Date(data.analyzedAt).toLocaleString()} |{" "}
            <span style={{ fontStyle: "italic" }}>AI-generated draft</span>
          </p>
        </div>
        <button
          className="edu-btn-outline"
          style={{ padding: "4px 12px", fontSize: 12 }}
          onClick={() => {
            void runAnalysis();
          }}
          disabled={generating}
        >
          {generating ? "Re-running..." : "Re-run"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ background: trend.bg, borderRadius: 8, padding: "14px 20px", flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: trend.color, margin: 0 }}>{trend.icon}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: trend.color, margin: "4px 0 0" }}>{trend.label}</p>
          <p style={{ fontSize: 11, color: trend.color, margin: "2px 0 0" }}>Overall Trend</p>
        </div>
        <div style={{ background: confidence.bg, borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 110 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: confidence.color, margin: 0, textTransform: "capitalize" }}>
            {analysis.confidence}
          </p>
          <p style={{ fontSize: 11, color: confidence.color, margin: "2px 0 0" }}>Confidence</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "#F8F5EF", borderRadius: 8, padding: "12px 14px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "#5A5048", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Score Trajectory
          </h4>
          <p style={{ fontSize: 13, color: "#3D3229", lineHeight: 1.65, margin: 0, wordBreak: "break-word" }}>
            {analysis.evidenceSummary.scoreTrajectorySummary}
          </p>
        </div>
        <div style={{ background: "#F8F5EF", borderRadius: 8, padding: "12px 14px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "#5A5048", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Risk Trajectory
          </h4>
          <p style={{ fontSize: 13, color: "#3D3229", lineHeight: 1.65, margin: 0, wordBreak: "break-word" }}>
            {analysis.evidenceSummary.riskTrajectorySummary}
          </p>
        </div>
      </div>

      {analysis.evidenceSummary.recurringWeakConcepts.length > 0 ? (
        <div style={{ marginBottom: 12, background: "#FCF8F3", borderRadius: 8, padding: "10px 12px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "#5A5048", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Recurring Weak Concepts
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {analysis.evidenceSummary.recurringWeakConcepts.map((concept, index) => (
              <span
                key={`${concept}-${index}`}
                style={{ fontSize: 11, background: "#FDECEA", color: "#A63D2E", padding: "3px 9px", borderRadius: 4 }}
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {analysis.trendContradiction ? (
        <div style={{ background: "#FEF8E7", borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#8B6914", lineHeight: 1.6 }}>
          <strong>Trend Contradiction:</strong> {analysis.trendContradiction}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#F6FBF4", borderRadius: 8, padding: "12px 14px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "#3D7A2E", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Appears to Improve
          </h4>
          {analysis.interventionImpactHypothesis.appearsToImprove.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048", lineHeight: 1.65 }}>
              {analysis.interventionImpactHypothesis.appearsToImprove.map((item, index) => (
                <li key={`${item}-${index}`} style={{ marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="edu-muted" style={{ fontSize: 12 }}>
              No clear improvement signals yet.
            </p>
          )}
        </div>
        <div style={{ background: "#FDF4F2", borderRadius: 8, padding: "12px 14px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "#A63D2E", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Remains Unresolved
          </h4>
          {analysis.interventionImpactHypothesis.remainsUnresolved.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048", lineHeight: 1.65 }}>
              {analysis.interventionImpactHypothesis.remainsUnresolved.map((item, index) => (
                <li key={`${item}-${index}`} style={{ marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="edu-muted" style={{ fontSize: 12 }}>
              No persistent issues identified.
            </p>
          )}
        </div>
      </div>

      {analysis.nextCycleActions.length > 0 ? (
        <div style={{ background: "#F5F0E9", borderRadius: 6, padding: "12px 16px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: "#C17A56", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Next Cycle Actions
          </h4>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, color: "#3D3229" }}>
            {analysis.nextCycleActions.map((action, index) => (
              <li key={`${action}-${index}`} style={{ marginBottom: 6, wordBreak: "break-word" }}>
                {action}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
