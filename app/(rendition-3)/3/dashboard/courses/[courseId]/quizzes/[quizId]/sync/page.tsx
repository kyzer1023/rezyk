"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockSyncSteps, getQuizById } from "@/lib/mock-data";
import type { SyncStep } from "@/lib/types";

export default function R3Sync() {
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
      <h1 className="r3-heading r3-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>Data Sync</h1>
      <p className="r3-fade-in r3-fd1 r3-muted" style={{ fontSize: 14, marginBottom: 20 }}>{quiz?.title ?? "Quiz"}</p>

      <div className="r3-card r3-fade-in r3-fd2" style={{ padding: 24, marginBottom: 20 }}>
        {steps.map((step, i) => (
          <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < steps.length - 1 ? "1px solid #F0ECE5" : "none" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
              background: step.status === "completed" ? "#E9F3E5" : step.status === "in_progress" ? "#FEF8E7" : "#F0ECE5",
              color: step.status === "completed" ? "#3D7A2E" : step.status === "in_progress" ? "#8B6914" : "#B5AA9C",
              transition: "all 0.3s",
            }}>
              {step.status === "completed" ? "✓" : step.status === "in_progress" ? "•" : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: step.status === "in_progress" ? 600 : 400, color: step.status === "completed" ? "#3D7A2E" : step.status === "in_progress" ? "#8B6914" : "#8A7D6F" }}>
                {step.label}
              </p>
              {step.status === "completed" && <p className="r3-muted" style={{ fontSize: 12 }}>{step.detail}</p>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!done && <button className="r3-btn" onClick={startSync} disabled={syncing}>{syncing ? "Syncing..." : "Start Sync"}</button>}
        {done && (
          <Link href={`/3/dashboard/courses/${courseId}/quizzes/${quizId}/analysis`}>
            <button className="r3-btn">Proceed to Analysis</button>
          </Link>
        )}
      </div>
    </div>
  );
}
