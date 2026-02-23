"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockSyncSteps, getQuizById } from "@/lib/mock-data";
import type { SyncStep } from "@/lib/types";

export default function R2Sync() {
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

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div>
      <h1 className="r2-heading r2-fade-in" style={{ fontSize: 22, marginBottom: 4, fontWeight: 500 }}>
        Data Sync
      </h1>
      <p className="r2-fade-in r2-fade-in-d1" style={{ color: "rgba(232,229,216,0.5)", fontSize: 14, marginBottom: 20 }}>
        {quiz?.title ?? "Quiz"}
      </p>

      {(syncing || done) && (
        <div className="r2-fade-in" style={{ marginBottom: 20 }}>
          <div
            style={{
              height: 4,
              background: "rgba(139,168,120,0.15)",
              borderRadius: 2,
              overflow: "hidden",
              maxWidth: 400,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: done ? "#8BA878" : "#FFCC80",
                borderRadius: 2,
                transition: "width 0.3s",
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: "rgba(232,229,216,0.4)", marginTop: 6 }}>
            {done ? "Sync complete" : `${pct}%`}
          </p>
        </div>
      )}

      <div className="r2-card r2-fade-in r2-fade-in-d2" style={{ padding: 24, marginBottom: 20 }}>
        {steps.map((step, i) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 0",
              borderBottom: i < steps.length - 1 ? "1px solid rgba(139,168,120,0.1)" : "none",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                background:
                  step.status === "completed"
                    ? "rgba(139,168,120,0.3)"
                    : step.status === "in_progress"
                    ? "rgba(255,204,128,0.3)"
                    : "rgba(255,255,255,0.05)",
                color:
                  step.status === "completed"
                    ? "#8BA878"
                    : step.status === "in_progress"
                    ? "#FFCC80"
                    : "rgba(232,229,216,0.3)",
                transition: "all 0.3s",
              }}
            >
              {step.status === "completed" ? "✓" : step.status === "in_progress" ? "•" : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: step.status === "in_progress" ? 600 : 400,
                  color:
                    step.status === "completed"
                      ? "#8BA878"
                      : step.status === "in_progress"
                      ? "#FFCC80"
                      : "rgba(232,229,216,0.5)",
                }}
              >
                {step.label}
              </p>
              {step.status === "completed" && (
                <p style={{ fontSize: 12, color: "rgba(232,229,216,0.35)" }}>{step.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!done && (
          <button className="r2-btn" onClick={startSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Start Sync"}
          </button>
        )}
        {done && (
          <Link href={`/2/dashboard/courses/${courseId}/quizzes/${quizId}/analysis`}>
            <button className="r2-btn">Proceed to Analysis</button>
          </Link>
        )}
      </div>
    </div>
  );
}
