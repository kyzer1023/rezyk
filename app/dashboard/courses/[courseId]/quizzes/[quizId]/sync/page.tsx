"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockSyncSteps, getQuizById } from "@/lib/mock-data";
import type { SyncStep } from "@/lib/types";
import { routes } from "@/lib/routes";

export default function SyncPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const [steps, setSteps] = useState<SyncStep[]>(
    mockSyncSteps.map((step) => ({ ...step, status: "pending" as const })),
  );
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  const startSync = () => {
    setSyncing(true);
    setDone(false);
    setSteps(mockSyncSteps.map((step) => ({ ...step, status: "pending" as const })));
  };

  useEffect(() => {
    if (!syncing) {
      return;
    }
    let index = 0;
    const interval = setInterval(() => {
      if (index >= mockSyncSteps.length) {
        clearInterval(interval);
        setSyncing(false);
        setDone(true);
        return;
      }
      const currentIndex = index;
      setSteps((previous) =>
        previous.map((step, stepIndex) => {
          if (stepIndex === currentIndex) {
            return { ...step, status: "in_progress" };
          }
          if (stepIndex < currentIndex) {
            return { ...step, status: "completed" };
          }
          return step;
        }),
      );
      setTimeout(() => {
        setSteps((previous) =>
          previous.map((step, stepIndex) =>
            stepIndex === currentIndex ? { ...step, status: "completed" } : step,
          ),
        );
      }, 400);
      index += 1;
    }, 600);
    return () => clearInterval(interval);
  }, [syncing]);

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Data Sync
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {quiz?.title ?? "Quiz"}
      </p>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24, marginBottom: 20 }}>
        {steps.map((step, index) => (
          <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: index < steps.length - 1 ? "1px solid #F0ECE5" : "none" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                background:
                  step.status === "completed"
                    ? "#E9F3E5"
                    : step.status === "in_progress"
                      ? "#FEF8E7"
                      : "#F0ECE5",
                color:
                  step.status === "completed"
                    ? "#3D7A2E"
                    : step.status === "in_progress"
                      ? "#8B6914"
                      : "#B5AA9C",
                transition: "all 0.3s",
              }}
            >
              {step.status === "completed" ? "✓" : step.status === "in_progress" ? "•" : index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: step.status === "in_progress" ? 600 : 400,
                  color:
                    step.status === "completed"
                      ? "#3D7A2E"
                      : step.status === "in_progress"
                        ? "#8B6914"
                        : "#8A7D6F",
                }}
              >
                {step.label}
              </p>
              {step.status === "completed" && (
                <p className="edu-muted" style={{ fontSize: 12 }}>
                  {step.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!done && (
          <button className="edu-btn" onClick={startSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Start Sync"}
          </button>
        )}
        {done && (
          <Link href={routes.analysis(courseId, quizId)}>
            <button className="edu-btn">Proceed to Analysis</button>
          </Link>
        )}
      </div>
    </div>
  );
}
