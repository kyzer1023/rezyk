"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizById } from "@/lib/mock-data";

export default function R4Analysis() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  const runAnalysis = () => { setRunning(true); setProgress(0); setComplete(false); };

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); setRunning(false); setComplete(true); return 100; }
        return p + 5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div>
      <h1 className="r4-heading r4-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>AI Analysis</h1>
      <p className="r4-fade-in r4-fd1 r4-muted" style={{ fontSize: 14, marginBottom: 20 }}>{quiz?.title ?? "Quiz"}</p>

      <div className="r4-card r4-fade-in r4-fd2" style={{ padding: 36, textAlign: "center", marginBottom: 20 }}>
        {!running && !complete && (
          <>
            <p style={{ fontSize: 15, marginBottom: 6 }}>Ready to analyze quiz responses</p>
            <p className="r4-muted" style={{ fontSize: 13, marginBottom: 16 }}>Gemini classifies errors into conceptual, procedural, and careless</p>
          </>
        )}
        {(running || complete) && (
          <>
            <div style={{ height: 5, background: "rgba(160,178,196,0.15)", borderRadius: 3, overflow: "hidden", maxWidth: 360, margin: "0 auto 14px" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: complete ? "#3A7D5E" : "#5C7D99", borderRadius: 3, transition: "width 0.12s" }} />
            </div>
            <p className="r4-muted" style={{ fontSize: 13 }}>{complete ? "Analysis complete" : `Analyzing... ${progress}%`}</p>
            {complete && (
              <div className="r4-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, maxWidth: 360, margin: "20px auto 0" }}>
                {[
                  { pct: "47%", label: "Conceptual", color: "#C6443C" },
                  { pct: "33%", label: "Procedural", color: "#B8762A" },
                  { pct: "20%", label: "Careless", color: "#5C7D99" },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.pct}</p>
                    <p className="r4-muted" style={{ fontSize: 11 }}>{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!complete && <button className="r4-btn" onClick={runAnalysis} disabled={running}>{running ? "Running..." : "Run Analysis"}</button>}
        {complete && (
          <>
            <Link href={`/4/dashboard/courses/${courseId}/quizzes/${quizId}/insights`}><button className="r4-btn">Open Insights</button></Link>
            <button className="r4-btn-outline" onClick={runAnalysis}>Re-run</button>
          </>
        )}
      </div>
    </div>
  );
}
