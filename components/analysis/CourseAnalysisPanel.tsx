"use client";

import { useState, useCallback } from "react";

interface CourseAnalysis {
  topWeakConcepts: { concept: string; frequency: number }[];
  rootCauses: string[];
  contentCoverage: { taught: string[]; assessed: string[]; gaps: string[] };
  difficultyProgression: string;
  misconceptionRecurrence: { concept: string; quizCount: number }[];
  assessmentBalance: { conceptual: number; procedural: number; application: number };
  interventionOpportunities: string[];
  overallAssessment: string;
  generatedAt?: number;
}

export default function CourseAnalysisPanel({
  courseId,
  initialData,
}: {
  courseId: string;
  initialData: CourseAnalysis | null;
}) {
  const [data, setData] = useState<CourseAnalysis | null>(initialData);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze/course-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Analysis failed");
      if (result.status === "insufficient_data") {
        setError(result.reason ?? "Insufficient data for analysis");
        return;
      }
      setData(result.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
    setRunning(false);
  }, [courseId]);

  if (!data && !running && !error) {
    return (
      <div className="edu-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 6 }}>Course-Wide Material Analysis</h3>
            <p className="edu-muted" style={{ fontSize: 13 }}>AI-powered analysis across all quizzes in this course</p>
          </div>
          <button className="edu-btn" onClick={runAnalysis} style={{ padding: "8px 20px", fontSize: 13 }}>
            Run Analysis
          </button>
        </div>
      </div>
    );
  }

  if (running) {
    return (
      <div className="edu-card" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #E8DFD4", borderTopColor: "#C17A56", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ fontSize: 14, color: "#8B6914", fontWeight: 500 }}>Analyzing course materials with Gemini AI…</p>
        <p className="edu-muted" style={{ fontSize: 12 }}>This may take 20–40 seconds</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edu-card" style={{ padding: 20, borderLeft: "4px solid #A63D2E" }}>
        <h3 className="edu-heading" style={{ fontSize: 17, marginBottom: 8 }}>Course-Wide Material Analysis</h3>
        <p style={{ color: "#A63D2E", fontSize: 13, marginBottom: 8 }}>{error}</p>
        <button className="edu-btn-outline" style={{ fontSize: 12 }} onClick={runAnalysis}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const balanceTotal = data.assessmentBalance.conceptual + data.assessmentBalance.procedural + data.assessmentBalance.application;

  return (
    <div className="edu-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="edu-heading" style={{ fontSize: 17 }}>Course-Wide Material Analysis</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {data.generatedAt && (
            <span className="edu-muted" style={{ fontSize: 11 }}>
              {new Date(data.generatedAt).toLocaleDateString()}
            </span>
          )}
          <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 11 }} onClick={runAnalysis} disabled={running}>
            Refresh
          </button>
        </div>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#5A5048", marginBottom: 16 }}>{data.overallAssessment}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div style={{ background: "#F5F0E9", borderRadius: 10, padding: 16 }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
            Top Weak Concepts
          </h4>
          {data.topWeakConcepts.slice(0, 5).map((c) => (
            <div key={c.concept} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
              <span style={{ color: "#5A5048" }}>{c.concept}</span>
              <span className="edu-muted">{c.frequency} quiz(es)</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#F5F0E9", borderRadius: 10, padding: 16 }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: "#8A7D6F", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
            Assessment Balance
          </h4>
          {[
            { label: "Conceptual", value: data.assessmentBalance.conceptual, color: "#A63D2E" },
            { label: "Procedural", value: data.assessmentBalance.procedural, color: "#A25E1A" },
            { label: "Application", value: data.assessmentBalance.application, color: "#2B5E9E" },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span>{item.label}</span>
                <span>{balanceTotal > 0 ? Math.round(item.value) : 0}%</span>
              </div>
              <div style={{ height: 5, background: "#E8DFD4", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${balanceTotal > 0 ? item.value : 0}%`, background: item.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.contentCoverage.gaps.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: "#A63D2E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
            Coverage Gaps
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.contentCoverage.gaps.map((g) => (
              <span key={g} style={{ padding: "4px 10px", background: "#FDECEA", color: "#A63D2E", borderRadius: 4, fontSize: 12 }}>{g}</span>
            ))}
          </div>
        </div>
      )}

      {data.interventionOpportunities.length > 0 && (
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: "#3D7A2E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
            Intervention Opportunities
          </h4>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {data.interventionOpportunities.map((opp, i) => (
              <li key={i} style={{ fontSize: 13, lineHeight: 1.6, color: "#5A5048", marginBottom: 4 }}>{opp}</li>
            ))}
          </ol>
        </div>
      )}

      <p style={{ fontSize: 10, color: "#C5BAB0", marginTop: 12, fontStyle: "italic" }}>
        AI-generated draft — review before acting
      </p>
    </div>
  );
}
