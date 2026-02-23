"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuizById } from "@/lib/mock-data";

export default function R5Analysis() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  const runAnalysis = () => { setRunning(true); setProgress(0); setComplete(false); };

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setProgress((p) => { if (p >= 100) { clearInterval(interval); setRunning(false); setComplete(true); return 100; } return p + 4; });
    }, 100);
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div>
      <h1 className="r5-heading r5-slide-in" style={{ fontSize: 20, marginBottom: 3 }}>AI Analysis</h1>
      <p className="r5-slide-in r5-sd1" style={{ color: "#64748B", fontSize: 13, marginBottom: 18 }}>{quiz?.title ?? "Quiz"}</p>

      <div className="r5-card r5-slide-in r5-sd2" style={{ padding: 28, textAlign: "center", marginBottom: 18 }}>
        {!running && !complete && (
          <p style={{ fontSize: 14, color: "#94A3B8" }}>Ready to run Gemini misconception analysis</p>
        )}
        {(running || complete) && (
          <>
            <div style={{ height: 6, background: "rgba(201,169,110,0.15)", borderRadius: 3, overflow: "hidden", maxWidth: 340, margin: "0 auto 10px" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: complete ? "#86EFAC" : "#C9A96E", borderRadius: 3, transition: "width 0.1s" }} />
            </div>
            <p style={{ fontSize: 12, color: "#64748B" }}>{complete ? "Analysis complete" : `${progress}%`}</p>
            {complete && (
              <div className="r5-slide-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, maxWidth: 320, margin: "14px auto 0" }}>
                <div><p style={{ fontSize: 20, fontWeight: 700, color: "#FCA5A5" }}>47%</p><p style={{ fontSize: 10, color: "#64748B" }}>Conceptual</p></div>
                <div><p style={{ fontSize: 20, fontWeight: 700, color: "#FDBA74" }}>33%</p><p style={{ fontSize: 10, color: "#64748B" }}>Procedural</p></div>
                <div><p style={{ fontSize: 20, fontWeight: 700, color: "#93C5FD" }}>20%</p><p style={{ fontSize: 10, color: "#64748B" }}>Careless</p></div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!complete && <button className="r5-btn" onClick={runAnalysis} disabled={running}>{running ? "Running..." : "Run Analysis"}</button>}
        {complete && (
          <>
            <Link href={`/5/dashboard/courses/${courseId}/quizzes/${quizId}/insights`}><button className="r5-btn">Open Insights</button></Link>
            <button className="r5-btn-outline" onClick={runAnalysis}>Re-run</button>
          </>
        )}
      </div>
    </div>
  );
}
