"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizById } from "@/lib/mock-data";
import { routes } from "@/lib/routes";

export default function AnalysisPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  const runAnalysis = () => {
    setRunning(true);
    setProgress(0);
    setComplete(false);
  };

  useEffect(() => {
    if (!running) {
      return;
    }
    const interval = setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 100) {
          clearInterval(interval);
          setRunning(false);
          setComplete(true);
          return 100;
        }
        return currentProgress + 5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        AI Analysis
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {quiz?.title ?? "Quiz"}
      </p>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 36, textAlign: "center", marginBottom: 20 }}>
        {!running && !complete && (
          <>
            <p style={{ fontSize: 15, marginBottom: 6 }}>Ready to analyze quiz responses</p>
            <p className="edu-muted" style={{ fontSize: 13, marginBottom: 16 }}>
              Gemini will classify errors into conceptual, procedural, and careless
            </p>
          </>
        )}
        {(running || complete) && (
          <>
            <div style={{ height: 6, background: "#F0ECE5", borderRadius: 3, overflow: "hidden", maxWidth: 360, margin: "0 auto 14px" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: complete ? "#6B8E5C" : "#C17A56", borderRadius: 3, transition: "width 0.12s" }} />
            </div>
            <p className="edu-muted" style={{ fontSize: 13 }}>
              {complete ? "Analysis complete" : `Analyzing... ${progress}%`}
            </p>
            {complete && (
              <div className="edu-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, maxWidth: 360, margin: "20px auto 0" }}>
                {[
                  { pct: "47%", label: "Conceptual", color: "#A63D2E" },
                  { pct: "33%", label: "Procedural", color: "#A25E1A" },
                  { pct: "20%", label: "Careless", color: "#2B5E9E" },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.pct}</p>
                    <p className="edu-muted" style={{ fontSize: 11 }}>{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!complete && (
          <button className="edu-btn" onClick={runAnalysis} disabled={running}>
            {running ? "Running..." : "Run Analysis"}
          </button>
        )}
        {complete && (
          <>
            <Link href={routes.insights(courseId, quizId)}>
              <button className="edu-btn">Open Insights</button>
            </Link>
            <button className="edu-btn-outline" onClick={runAnalysis}>
              Re-run
            </button>
          </>
        )}
      </div>
    </div>
  );
}
