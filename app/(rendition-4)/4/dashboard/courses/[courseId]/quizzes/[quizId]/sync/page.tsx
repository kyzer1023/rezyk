"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockSyncSteps, getQuizById } from "@/lib/mock-data";
import type { SyncStep } from "@/lib/types";

export default function R4Sync() {
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
      <h1 className="r4-heading r4-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>Data Sync</h1>
      <p className="r4-fade-in r4-fd1 r4-muted" style={{ fontSize: 14, marginBottom: 20 }}>{quiz?.title ?? "Quiz"}</p>

      <div className="r4-card r4-fade-in r4-fd2" style={{ padding: 24, marginBottom: 20 }}>
        {steps.map((step, i) => (
          <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < steps.length - 1 ? "1px solid rgba(160,178,196,0.1)" : "none" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
              background: step.status === "completed" ? "rgba(58,125,94,0.12)" : step.status === "in_progress" ? "rgba(184,118,42,0.12)" : "rgba(140,158,176,0.1)",
              color: step.status === "completed" ? "#3A7D5E" : step.status === "in_progress" ? "#B8762A" : "#8C9EB0",
              transition: "all 0.3s",
            }}>
              {step.status === "completed" ? "✓" : step.status === "in_progress" ? "•" : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: step.status === "in_progress" ? 600 : 400, color: step.status === "completed" ? "#3A7D5E" : step.status === "in_progress" ? "#B8762A" : "#7A8A98" }}>
                {step.label}
              </p>
              {step.status === "completed" && <p className="r4-muted" style={{ fontSize: 12 }}>{step.detail}</p>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!done && <button className="r4-btn" onClick={startSync} disabled={syncing}>{syncing ? "Syncing..." : "Start Sync"}</button>}
        {done && (
          <Link href={`/4/dashboard/courses/${courseId}/quizzes/${quizId}/analysis`}>
            <button className="r4-btn">Proceed to Analysis</button>
          </Link>
        )}
      </div>
    </div>
  );
}
