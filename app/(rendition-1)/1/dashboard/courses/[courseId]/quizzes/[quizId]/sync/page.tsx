"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockSyncSteps, getQuizById } from "@/lib/mock-data";
import type { SyncStep } from "@/lib/types";

export default function R1Sync() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const [steps, setSteps] = useState<SyncStep[]>(
    mockSyncSteps.map((s) => ({ ...s, status: "pending" as const }))
  );
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  const startSync = () => {
    setSyncing(true);
    setDone(false);
    setSteps(mockSyncSteps.map((s) => ({ ...s, status: "pending" as const })));
  };

  useEffect(() => {
    if (!syncing) return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= mockSyncSteps.length) {
        clearInterval(interval);
        setSyncing(false);
        setDone(true);
        return;
      }
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i === idx) return { ...s, status: "in_progress" };
          if (i < idx) return { ...s, status: "completed" };
          return s;
        })
      );
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, i) => (i === idx ? { ...s, status: "completed" } : s))
        );
      }, 400);
      idx++;
    }, 600);
    return () => clearInterval(interval);
  }, [syncing]);

  return (
    <div>
      <h1 className="r1-heading r1-fade-in" style={{ fontSize: 24, marginBottom: 4 }}>Data Sync</h1>
      <p className="r1-fade-in r1-fade-in-delay-1" style={{ color: "#8B7E7E", fontSize: 15, marginBottom: 24 }}>
        {quiz?.title ?? "Quiz"} &mdash; Sync roster, metadata, and responses
      </p>

      <div className="r1-card r1-fade-in r1-fade-in-delay-2" style={{ padding: 24, marginBottom: 24 }}>
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              borderBottom: "1px solid #F0EAE0",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                background:
                  step.status === "completed" ? "#16a34a" :
                  step.status === "in_progress" ? "#C1694F" : "#E8E0D5",
                color: step.status === "pending" ? "#8B7E7E" : "#fff",
                transition: "background 0.3s",
              }}
            >
              {step.status === "completed" ? "✓" : step.status === "in_progress" ? "..." : "○"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: step.status === "in_progress" ? 600 : 400 }}>
                {step.label}
              </p>
              {step.status === "completed" && (
                <p style={{ fontSize: 13, color: "#8B7E7E" }}>{step.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {!done && (
          <button className="r1-btn" onClick={startSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Start Sync"}
          </button>
        )}
        {done && (
          <Link href={`/1/dashboard/courses/${courseId}/quizzes/${quizId}/analysis`}>
            <button className="r1-btn">Proceed to Analysis</button>
          </Link>
        )}
      </div>
    </div>
  );
}
