"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizById } from "@/lib/mock-data";

export default function R1Analysis() {
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
      <h1 className="r1-heading r1-fade-in" style={{ fontSize: 24, marginBottom: 4 }}>AI Analysis</h1>
      <p className="r1-fade-in r1-fade-in-delay-1" style={{ color: "#8B7E7E", fontSize: 15, marginBottom: 24 }}>
        {quiz?.title ?? "Quiz"} &mdash; Gemini misconception analysis pipeline
      </p>

      <div className="r1-card r1-fade-in r1-fade-in-delay-2" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
        {!running && !complete && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>Ready to analyze quiz responses</p>
            <p style={{ fontSize: 14, color: "#8B7E7E", marginBottom: 20 }}>
              Gemini will classify errors as conceptual, procedural, or careless
            </p>
          </>
        )}

        {(running || complete) && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  height: 8,
                  background: "#E8E0D5",
                  borderRadius: 4,
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: 400,
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: complete ? "#16a34a" : "#C1694F",
                    borderRadius: 4,
                    transition: "width 0.12s",
                  }}
                />
              </div>
              <p style={{ fontSize: 14, color: "#8B7E7E", marginTop: 8 }}>
                {complete ? "Analysis complete!" : `Analyzing... ${progress}%`}
              </p>
            </div>

            {complete && (
              <div className="r1-fade-in" style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#16a34a", marginBottom: 8 }}>
                  Misconception analysis finished successfully
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, maxWidth: 400, width: "100%", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 700, color: "#C1694F" }}>47%</p>
                    <p style={{ fontSize: 12, color: "#8B7E7E" }}>Conceptual</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 700, color: "#d97706" }}>33%</p>
                    <p style={{ fontSize: 12, color: "#8B7E7E" }}>Procedural</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 700, color: "#4A90D9" }}>20%</p>
                    <p style={{ fontSize: 12, color: "#8B7E7E" }}>Careless</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {!complete && (
          <button className="r1-btn" onClick={runAnalysis} disabled={running}>
            {running ? "Running..." : "Run Analysis"}
          </button>
        )}
        {complete && (
          <>
            <Link href={`/1/dashboard/courses/${courseId}/quizzes/${quizId}/insights`}>
              <button className="r1-btn">Open Class Insights</button>
            </Link>
            <button className="r1-btn-outline" onClick={runAnalysis}>Re-run Analysis</button>
          </>
        )}
      </div>
    </div>
  );
}
