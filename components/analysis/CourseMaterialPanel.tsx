"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedCourseMaterialAnalysis } from "@/lib/analysis/course-material-schema";

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
  const [data, setData] = useState<SavedCourseMaterialAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      try {
        const response = await fetch(`/api/analyze/course-materials?courseId=${courseId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as { found?: boolean } & SavedCourseMaterialAnalysis;
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

    void loadAnalysis();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const runAnalysis = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze/course-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        analysis?: SavedCourseMaterialAnalysis;
        error?: string;
      };

      if (!response.ok || !payload.success || !payload.analysis) {
        throw new Error(payload.error ?? "Course material analysis failed");
      }
      setData(payload.analysis);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Course material analysis failed");
    } finally {
      setGenerating(false);
    }
  }, [courseId]);

  if (loading) return null;

  if (!data) {
    return (
      <div className="edu-card edu-fade-in" style={{ padding: 24, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 4 }}>
              Course-wide Insights
            </h3>
            <p className="edu-muted" style={{ fontSize: 13 }}>
              Analyze patterns across all quizzes in this course.
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
            {generating ? "Analyzing Course..." : "Analyze Course"}
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
      <div className="edu-card edu-fade-in" style={{ padding: 24, marginTop: 16 }}>
        <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 10 }}>
          Course-wide Insights
        </h3>
        <div style={{ background: "#FEF8E7", borderRadius: 6, padding: "12px 16px" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#8B6914", margin: "0 0 6px" }}>
            Insufficient Data
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#5A5048" }}>
            {data.error ?? "Run at least one completed quiz analysis first."}
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
          {generating ? "Re-analyzing Course..." : "Re-analyze Course"}
        </button>
      </div>
    );
  }

  if (!data.analysis) {
    return null;
  }

  const analysis = data.analysis;
  const alignmentColor = ALIGNMENT_COLORS[analysis.alignment.score] ?? ALIGNMENT_COLORS.moderate;

  return (
    <div className="edu-card edu-fade-in" style={{ padding: 24, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 className="edu-heading" style={{ fontSize: 17, margin: 0 }}>
            Course-wide Insights
          </h3>
          <p className="edu-muted" style={{ fontSize: 11, margin: "4px 0 0" }}>
            Based on {data.analyzedQuizIds.length} quiz(es) | Analyzed{" "}
            {new Date(data.analyzedAt).toLocaleDateString()} |{" "}
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
          {generating ? "Re-analyzing Course..." : "Re-analyze Course"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: alignmentColor.bg, borderRadius: 6, padding: "10px 14px" }}>
          <p style={{ fontSize: 11, color: alignmentColor.color, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
            Alignment
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: alignmentColor.color, margin: 0, textTransform: "capitalize" }}>
            {analysis.alignment.score}
          </p>
        </div>
        <div style={{ background: "#F5F0E9", borderRadius: 6, padding: "10px 14px" }}>
          <p style={{ fontSize: 11, color: "#8A7D6F", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
            Balance
          </p>
          <p style={{ fontSize: 12, color: "#3D3229", margin: 0 }}>
            C:{analysis.assessmentBalance.conceptual}% P:{analysis.assessmentBalance.procedural}% A:
            {analysis.assessmentBalance.application}%
          </p>
        </div>
        <div style={{ background: "#F5F0E9", borderRadius: 6, padding: "10px 14px" }}>
          <p style={{ fontSize: 11, color: "#8A7D6F", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
            Progression
          </p>
          <p style={{ fontSize: 12, color: "#3D3229", margin: 0, textTransform: "capitalize" }}>
            {analysis.difficultyProgression.assessment.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {analysis.topWeakConcepts.length > 0 ? (
        <div style={{ marginBottom: 14 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#5A5048", margin: "0 0 8px" }}>
            Top Weak Concepts
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {analysis.topWeakConcepts.map((concept, index) => (
              <span
                key={`${concept}-${index}`}
                style={{
                  fontSize: 12,
                  background: "#FDECEA",
                  color: "#A63D2E",
                  padding: "3px 10px",
                  borderRadius: 4,
                  fontWeight: 500,
                }}
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {analysis.misconceptionRecurrence.length > 0 ? (
        <div style={{ marginBottom: 14 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#5A5048", margin: "0 0 8px" }}>
            Recurring Misconceptions
          </h4>
          {analysis.misconceptionRecurrence.slice(0, 5).map((entry, index) => {
            const severityColor = SEVERITY_COLORS[entry.severity] ?? SEVERITY_COLORS.occasional;
            return (
              <div
                key={`${entry.concept}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px solid #F0ECE5",
                }}
              >
                <span style={{ fontSize: 13 }}>
                  {entry.concept}{" "}
                  <span className="edu-muted" style={{ fontSize: 11 }}>
                    ({entry.quizCount} quiz{entry.quizCount > 1 ? "zes" : ""})
                  </span>
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 3,
                    background: severityColor.bg,
                    color: severityColor.color,
                    textTransform: "capitalize",
                  }}
                >
                  {entry.severity}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {analysis.prioritizedActions.length > 0 ? (
        <div style={{ background: "#F5F0E9", borderRadius: 6, padding: "12px 16px" }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: "#C17A56", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Prioritized Actions
          </h4>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, color: "#3D3229" }}>
            {analysis.prioritizedActions.map((action, index) => (
              <li key={`${action}-${index}`}>{action}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {(analysis.gaps.underCovered.length > 0 || analysis.gaps.overWeighted.length > 0) ? (
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {analysis.gaps.underCovered.length > 0 ? (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#A63D2E", margin: "0 0 6px" }}>
                Under-covered
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048" }}>
                {analysis.gaps.underCovered.map((gap, index) => (
                  <li key={`${gap}-${index}`}>{gap}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {analysis.gaps.overWeighted.length > 0 ? (
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#8B6914", margin: "0 0 6px" }}>
                Over-weighted
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#5A5048" }}>
                {analysis.gaps.overWeighted.map((gap, index) => (
                  <li key={`${gap}-${index}`}>{gap}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
