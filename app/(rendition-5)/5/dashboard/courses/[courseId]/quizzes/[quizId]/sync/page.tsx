"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockSyncSteps, getQuizById } from "@/lib/mock-data";
import type { SyncStep } from "@/lib/types";

export default function R5Sync() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const [steps, setSteps] = useState<SyncStep[]>(mockSyncSteps.map((s) => ({ ...s, status: "pending" as const })));
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  const startSync = () => { setSyncing(true); setDone(false); setSteps(mockSyncSteps.map((s) => ({ ...s, status: "pending" as const }))); };

  useEffect(() => {
    if (!syncing) return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= mockSyncSteps.length) { clearInterval(interval); setSyncing(false); setDone(true); return; }
      setSteps((prev) => prev.map((s, i) => {
        if (i === idx) return { ...s, status: "in_progress" };
        if (i < idx) return { ...s, status: "completed" };
        return s;
      }));
      setTimeout(() => { setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, status: "completed" } : s))); }, 400);
      idx++;
    }, 600);
    return () => clearInterval(interval);
  }, [syncing]);

  return (
    <div>
      <h1 className="r5-heading r5-slide-in" style={{ fontSize: 20, marginBottom: 3 }}>Data Sync</h1>
      <p className="r5-slide-in r5-sd1" style={{ color: "#64748B", fontSize: 13, marginBottom: 18 }}>{quiz?.title ?? "Quiz"}</p>

      <div className="r5-card r5-slide-in r5-sd2" style={{ padding: 20, marginBottom: 18 }}>
        {steps.map((step, i) => (
          <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < steps.length - 1 ? "1px solid rgba(201,169,110,0.08)" : "none" }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
              background: step.status === "completed" ? "rgba(22,163,74,0.2)" : step.status === "in_progress" ? "rgba(201,169,110,0.2)" : "rgba(100,116,139,0.2)",
              color: step.status === "completed" ? "#86EFAC" : step.status === "in_progress" ? "#C9A96E" : "#64748B",
              transition: "all 0.3s",
            }}>
              {step.status === "completed" ? "✓" : step.status === "in_progress" ? "..." : ""}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: step.status === "in_progress" ? 700 : 400 }}>{step.label}</p>
              {step.status === "completed" && <p style={{ fontSize: 11, color: "#64748B" }}>{step.detail}</p>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!done && <button className="r5-btn" onClick={startSync} disabled={syncing}>{syncing ? "Syncing..." : "Start Sync"}</button>}
        {done && <Link href={`/5/dashboard/courses/${courseId}/quizzes/${quizId}/analysis`}><button className="r5-btn">Proceed to Analysis</button></Link>}
      </div>
    </div>
  );
}
