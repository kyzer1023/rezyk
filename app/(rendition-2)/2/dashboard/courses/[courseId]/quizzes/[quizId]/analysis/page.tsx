"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizById } from "@/lib/mock-data";

export default function R2Analysis() {
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
    if (!running) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setRunning(false);
          setComplete(true);
          return 100;
        }
        return p + 5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div>
      <h1 className="r2-heading r2-fade-in" style={{ fontSize: 22, marginBottom: 4, fontWeight: 500 }}>
        AI Analysis
      </h1>
      <p className="r2-fade-in r2-fade-in-d1" style={{ color: "rgba(232,229,216,0.5)", fontSize: 14, marginBottom: 20 }}>
        {quiz?.title ?? "Quiz"}
      </p>

      <div className="r2-card r2-fade-in r2-fade-in-d2" style={{ padding: 36, textAlign: "center", marginBottom: 20 }}>
        {!running && !complete && (
          <>
            <p className="r2-chalk" style={{ fontSize: 15, marginBottom: 6 }}>
              Ready to analyze quiz responses
            </p>
            <p style={{ fontSize: 13, color: "rgba(232,229,216,0.45)", marginBottom: 16 }}>
              Gemini will classify errors into conceptual, procedural, and careless
            </p>
          </>
        )}
        {(running || complete) && (
          <>
            <div
              style={{
                height: 6,
                background: "rgba(139,168,120,0.15)",
                borderRadius: 3,
                overflow: "hidden",
                maxWidth: 360,
                margin: "0 auto 14px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: complete ? "#8BA878" : "#FFCC80",
                  borderRadius: 3,
                  transition: "width 0.12s",
                }}
              />
            </div>
            <p style={{ fontSize: 13, color: "rgba(232,229,216,0.5)" }}>
              {complete ? "Analysis complete" : `Analyzing... ${progress}%`}
            </p>
            {complete && (
              <div
                className="r2-fade-in"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  maxWidth: 360,
                  margin: "20px auto 0",
                }}
              >
                {[
                  { pct: "47%", label: "Conceptual", color: "#EF9A9A" },
                  { pct: "33%", label: "Procedural", color: "#FFCC80" },
                  { pct: "20%", label: "Careless", color: "#90CAF9" },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.pct}</p>
                    <p style={{ fontSize: 11, color: "rgba(232,229,216,0.45)" }}>{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!complete && (
          <button className="r2-btn" onClick={runAnalysis} disabled={running}>
            {running ? "Running..." : "Run Analysis"}
          </button>
        )}
        {complete && (
          <>
            <Link href={`/2/dashboard/courses/${courseId}/quizzes/${quizId}/insights`}>
              <button className="r2-btn">Open Insights</button>
            </Link>
            <button className="r2-btn-outline" onClick={runAnalysis}>
              Re-run
            </button>
          </>
        )}
      </div>
    </div>
  );
}
