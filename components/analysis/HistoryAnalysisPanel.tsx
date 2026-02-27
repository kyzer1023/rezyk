"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedHistoryAnalysis } from "@/lib/analysis/history-analysis-schema";

const TREND_DISPLAY: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  improving: { label: "Improving", bg: "#E9F3E5", color: "#3D7A2E", icon: "\u2191" },
  stable: { label: "Stable", bg: "#E3EDF7", color: "#2B5E9E", icon: "\u2194" },
  declining: { label: "Declining", bg: "#FDECEA", color: "#A63D2E", icon: "\u2193" },
  insufficient_data: { label: "Insufficient Data", bg: "#F5F0E9", color: "#8A7D6F", icon: "?" },
};

const CONFIDENCE_DISPLAY: Record<string, { bg: string; color: string }> = {
  high: { bg: "#E9F3E5", color: "#3D7A2E" },
  medium: { bg: "#FEF8E7", color: "#8B6914" },
  low: { bg: "#F5F0E9", color: "#8A7D6F" },
};

function CollapsibleSection({
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
        // silent
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
            <p className="edu-section-label" style={{ marginBottom: 6 }}>Cross-Quiz Trends</p>
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
            onClick={() => { void runAnalysis(); }}
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
        <p className="edu-section-label">Cross-Quiz Trends</p>
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
          onClick={() => { void runAnalysis(); }}
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

  const actionCount = analysis.nextCycleActions.length;
  const unresolvedCount = analysis.interventionImpactHypothesis.remainsUnresolved.length;
  const weakConceptCount = analysis.evidenceSummary.recurringWeakConcepts.length;

  return (
    <div className="edu-card edu-fade-in" style={{ padding: 0, marginBottom: 20, overflow: "hidden" }}>
      {/* ── Header: trend hero + meta ── */}
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F0ECE5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="edu-section-label" style={{ marginBottom: 6 }}>Cross-Quiz Trends</p>
            <h3 className="edu-heading" style={{ fontSize: 17, margin: 0 }}>
              AI History Analysis
            </h3>
          </div>
          <button
            className="edu-btn-outline"
            style={{ padding: "4px 12px", fontSize: 12 }}
            onClick={() => { void runAnalysis(); }}
            disabled={generating}
          >
            {generating ? "Re-running..." : "Re-run"}
          </button>
        </div>
        <p className="edu-muted" style={{ fontSize: 11, margin: "6px 0 0" }}>
          Based on {data.analyzedQuizIds.length} quiz(es) &middot; Analyzed{" "}
          {new Date(data.analyzedAt).toLocaleString()} &middot;{" "}
          <span style={{ fontStyle: "italic" }}>AI-generated draft</span>
        </p>
      </div>

      {/* ── Trend + Confidence hero strip ── */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #F0ECE5" }}>
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 24px",
          background: trend.bg,
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 800,
            color: trend.color,
            lineHeight: 1,
          }}>{trend.icon}</span>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: trend.color, margin: 0 }}>{trend.label}</p>
            <p style={{ fontSize: 11, color: trend.color, margin: "2px 0 0", opacity: 0.75 }}>Overall Trend</p>
          </div>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 24px",
          background: confidence.bg,
          minWidth: 130,
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: confidence.color, margin: 0, textTransform: "capitalize" }}>
              {analysis.confidence}
            </p>
            <p style={{ fontSize: 11, color: confidence.color, margin: "2px 0 0", opacity: 0.75 }}>Confidence</p>
          </div>
        </div>
      </div>

      {/* ── Quick summary strip ── */}
      <div style={{ padding: "14px 24px", background: "#FDFBF7", borderBottom: "1px solid #F0ECE5" }}>
        <p style={{ fontSize: 13, color: "#5A5048", margin: 0, lineHeight: 1.55 }}>
          <strong style={{ color: "#3D3229" }}>{weakConceptCount}</strong> recurring weak concept{weakConceptCount !== 1 ? "s" : ""} &middot;{" "}
          <strong style={{ color: "#A63D2E" }}>{unresolvedCount}</strong> unresolved issue{unresolvedCount !== 1 ? "s" : ""} &middot;{" "}
          <strong style={{ color: "#C17A56" }}>{actionCount}</strong> recommended action{actionCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Trend contradiction callout (always visible if present) ── */}
      {analysis.trendContradiction ? (
        <div style={{ padding: "0 24px" }}>
          <div style={{
            marginTop: 16,
            background: "#FEF8E7",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 13,
            color: "#8B6914",
            lineHeight: 1.6,
            borderLeft: "3px solid #E2C14F",
          }}>
            <strong>Heads up:</strong> {analysis.trendContradiction}
          </div>
        </div>
      ) : null}

      {/* ── Collapsible: Evidence Summary ── */}
      <div style={{ padding: "8px 8px 0" }}>
        <CollapsibleSection title="Score &amp; Risk Evidence" defaultOpen={false}>
          <div style={{ padding: "4px 16px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="edu-insight-strip" style={{ borderLeftColor: "#C17A56" }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#8A7D6F", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Score Trajectory
                  </p>
                  <p style={{ margin: 0, wordBreak: "break-word" }}>
                    {analysis.evidenceSummary.scoreTrajectorySummary}
                  </p>
                </div>
              </div>
              <div className="edu-insight-strip" style={{ borderLeftColor: "#2B5E9E" }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#8A7D6F", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Risk Trajectory
                  </p>
                  <p style={{ margin: 0, wordBreak: "break-word" }}>
                    {analysis.evidenceSummary.riskTrajectorySummary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* ── Collapsible: Recurring Weak Concepts ── */}
      {weakConceptCount > 0 ? (
        <div style={{ padding: "0 8px" }}>
          <CollapsibleSection title={`Recurring Weak Concepts (${weakConceptCount})`} defaultOpen={false}>
            <div style={{ padding: "4px 16px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {analysis.evidenceSummary.recurringWeakConcepts.map((concept, index) => (
                <span
                  key={`${concept}-${index}`}
                  style={{
                    fontSize: 12,
                    background: "#FDECEA",
                    color: "#A63D2E",
                    padding: "5px 12px",
                    borderRadius: 16,
                    fontWeight: 600,
                  }}
                >
                  {concept}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      ) : null}

      {/* ── Collapsible: Intervention Impact ── */}
      <div style={{ padding: "0 8px" }}>
        <CollapsibleSection title="Intervention Impact" defaultOpen={false}>
          <div style={{ padding: "4px 16px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#F6FBF4", borderRadius: 8, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#3D7A2E", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Appears to Improve
                </p>
                {analysis.interventionImpactHypothesis.appearsToImprove.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048", lineHeight: 1.65 }}>
                    {analysis.interventionImpactHypothesis.appearsToImprove.map((item, index) => (
                      <li key={`improve-${index}`} style={{ marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="edu-muted" style={{ fontSize: 12, margin: 0 }}>No clear improvement signals yet.</p>
                )}
              </div>
              <div style={{ background: "#FDF4F2", borderRadius: 8, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#A63D2E", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Remains Unresolved
                </p>
                {analysis.interventionImpactHypothesis.remainsUnresolved.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048", lineHeight: 1.65 }}>
                    {analysis.interventionImpactHypothesis.remainsUnresolved.map((item, index) => (
                      <li key={`unresolved-${index}`} style={{ marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="edu-muted" style={{ fontSize: 12, margin: 0 }}>No persistent issues identified.</p>
                )}
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* ── Collapsible: Next Cycle Actions ── */}
      {actionCount > 0 ? (
        <div style={{ padding: "0 8px 8px" }}>
          <CollapsibleSection title={`Next Cycle Actions (${actionCount})`} defaultOpen={true}>
            <div style={{ padding: "4px 16px 16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {analysis.nextCycleActions.map((action, index) => (
                  <div key={`action-${index}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      className="edu-priority-number"
                      style={{
                        color: "#C17A56",
                      }}
                    >
                      {index + 1}
                    </span>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: "#3D3229", margin: 0, wordBreak: "break-word" }}>
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      ) : null}
    </div>
  );
}
