"use client";

import { useEffect, useState, useCallback } from "react";

interface MaterialAnalysis {
  contentCoverage: { taughtConcepts: string[]; assessedConcepts: string[]; gapConcepts: string[] };
  alignment: { score: string; summary: string };
  difficultyProgression: { assessment: string; summary: string };
  misconceptionRecurrence: { concept: string; quizCount: number; severity: string }[];
  assessmentBalance: { conceptual: number; procedural: number; application: number; summary: string };
  gaps: { underCovered: string[]; overWeighted: string[] };
  interventionOpportunities: string[];
  topWeakConcepts: string[];
  likelyRootCauses: string[];
  prioritizedActions: string[];
  dataQuality: string;
  insufficientDataReasons?: string[];
}

interface SavedAnalysis {
  analysis: MaterialAnalysis;
  analyzedQuizIds: string[];
  analyzedAt: number;
  status: string;
  error?: string;
}

const ALIGNMENT_COLORS: Record<string, { bg: string; color: string }> = {
  strong: { bg: "#E9F3E5", color: "#3D7A2E" },
  moderate: { bg: "#FEF8E7", color: "#8B6914" },
  weak: { bg: "#FDECEA", color: "#A63D2E" },
};

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  persistent: { bg: "#FDECEA", color: "#A63D2E" },
  occasional: { bg: "#FEF8E7", color: "#8B6914" },
  resolved: { bg: "#E9F3E5", color: "#3D7A2E" },
};

export default function CourseMaterialPanel({ courseId }: { courseId: string }) {
  const [data, setData] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/analyze/course-materials?courseId=${courseId}`)
      .then((r) => r.json())
      .then((d) => { if (d.found) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const runAnalysis = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze/course-materials", {
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
      <div className="edu-card edu-fade-in" style={{ padding: 24, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 4 }}>Course Material Analysis</h3>
            <p className="edu-muted" style={{ fontSize: 13 }}>AI-powered analysis across all quizzes in this course.</p>
          </div>
          <button className="edu-btn" style={{ padding: "8px 18px", fontSize: 13 }} onClick={runAnalysis} disabled={generating}>
            {generating ? "Analyzing…" : "Run Analysis"}
          </button>
        </div>
        {error && <p style={{ fontSize: 13, color: "#A63D2E", marginTop: 10 }}>{error}</p>}
      </div>
    );
  }

  const a = data.analysis;

  if (a.dataQuality === "insufficient_data") {
    return (
      <div className="edu-card edu-fade-in" style={{ padding: 24, marginTop: 16 }}>
        <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 10 }}>Course Material Analysis</h3>
        <div style={{ background: "#FEF8E7", borderRadius: 6, padding: "12px 16px" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#8B6914", margin: "0 0 6px" }}>Insufficient Data</p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#5A5048" }}>
            {(a.insufficientDataReasons ?? []).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        <button className="edu-btn-outline" style={{ marginTop: 12, padding: "6px 14px", fontSize: 12 }} onClick={runAnalysis} disabled={generating}>
          {generating ? "Re-analyzing…" : "Re-run"}
        </button>
      </div>
    );
  }

  const alColor = ALIGNMENT_COLORS[a.alignment.score] ?? ALIGNMENT_COLORS.moderate;

  return (
    <div className="edu-card edu-fade-in" style={{ padding: 24, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 className="edu-heading" style={{ fontSize: 17, margin: 0 }}>Course Material Analysis</h3>
          <p className="edu-muted" style={{ fontSize: 11, margin: "4px 0 0" }}>
            Based on {data.analyzedQuizIds.length} quiz(es) · Analyzed {new Date(data.analyzedAt).toLocaleDateString()} · <span style={{ fontStyle: "italic" }}>AI-generated draft</span>
          </p>
        </div>
        <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 12 }} onClick={runAnalysis} disabled={generating}>
          {generating ? "Re-running…" : "Re-run"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: alColor.bg, borderRadius: 6, padding: "10px 14px" }}>
          <p style={{ fontSize: 11, color: alColor.color, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Alignment</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: alColor.color, margin: 0, textTransform: "capitalize" }}>{a.alignment.score}</p>
        </div>
        <div style={{ background: "#F5F0E9", borderRadius: 6, padding: "10px 14px" }}>
          <p style={{ fontSize: 11, color: "#8A7D6F", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Balance</p>
          <p style={{ fontSize: 12, color: "#3D3229", margin: 0 }}>C:{a.assessmentBalance.conceptual}% P:{a.assessmentBalance.procedural}% A:{a.assessmentBalance.application}%</p>
        </div>
        <div style={{ background: "#F5F0E9", borderRadius: 6, padding: "10px 14px" }}>
          <p style={{ fontSize: 11, color: "#8A7D6F", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Progression</p>
          <p style={{ fontSize: 12, color: "#3D3229", margin: 0, textTransform: "capitalize" }}>{a.difficultyProgression.assessment.replace(/_/g, " ")}</p>
        </div>
      </div>

      {a.topWeakConcepts.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#5A5048", margin: "0 0 8px" }}>Top Weak Concepts</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {a.topWeakConcepts.map((c, i) => (
              <span key={i} style={{ fontSize: 12, background: "#FDECEA", color: "#A63D2E", padding: "3px 10px", borderRadius: 4, fontWeight: 500 }}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {a.misconceptionRecurrence.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#5A5048", margin: "0 0 8px" }}>Recurring Misconceptions</h4>
          {a.misconceptionRecurrence.slice(0, 5).map((m, i) => {
            const sColor = SEVERITY_COLORS[m.severity] ?? SEVERITY_COLORS.occasional;
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F0ECE5" }}>
                <span style={{ fontSize: 13 }}>{m.concept} <span className="edu-muted" style={{ fontSize: 11 }}>({m.quizCount} quiz{m.quizCount > 1 ? "zes" : ""})</span></span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 3, background: sColor.bg, color: sColor.color, textTransform: "capitalize" }}>{m.severity}</span>
              </div>
            );
          })}
        </div>
      )}

      {a.prioritizedActions.length > 0 && (
        <div style={{ background: "#F5F0E9", borderRadius: 6, padding: "12px 16px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: "#C17A56", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>Prioritized Actions</h4>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, color: "#3D3229" }}>
            {a.prioritizedActions.map((act, i) => <li key={i}>{act}</li>)}
          </ol>
        </div>
      )}

      {(a.gaps.underCovered.length > 0 || a.gaps.overWeighted.length > 0) && (
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {a.gaps.underCovered.length > 0 && (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#A63D2E", margin: "0 0 6px" }}>Under-covered</h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048" }}>
                {a.gaps.underCovered.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}
          {a.gaps.overWeighted.length > 0 && (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#8B6914", margin: "0 0 6px" }}>Over-weighted</h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048" }}>
                {a.gaps.overWeighted.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
