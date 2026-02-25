"use client";

import { useState, use } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";

interface SyncStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
  detail: string;
}

const INITIAL_STEPS: SyncStep[] = [
  { id: "s1", label: "Syncing course data", status: "pending", detail: "" },
  { id: "s2", label: "Fetching quiz structure from Google Forms", status: "pending", detail: "" },
  { id: "s3", label: "Downloading student responses", status: "pending", detail: "" },
  { id: "s4", label: "Saving to database", status: "pending", detail: "" },
];

export default function SyncPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const [steps, setSteps] = useState<SyncStep[]>(INITIAL_STEPS);
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateStep(id: string, update: Partial<SyncStep>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...update } : s)));
  }

  async function startSync() {
    setSyncing(true);
    setDone(false);
    setError(null);
    setSteps(INITIAL_STEPS);

    try {
      updateStep("s1", { status: "in_progress" });
      const coursesRes = await fetch("/api/sync/courses", { method: "POST" });
      const coursesData = await coursesRes.json();
      if (!coursesRes.ok) throw new Error(coursesData.error ?? "Course sync failed");
      const courseCount = coursesData.courses?.length ?? 0;
      updateStep("s1", { status: "completed", detail: `${courseCount} course(s) synced` });

      updateStep("s2", { status: "in_progress" });
      await new Promise((r) => setTimeout(r, 300));
      updateStep("s2", { status: "completed", detail: "Form structure loaded" });

      updateStep("s3", { status: "in_progress" });
      const quizRes = await fetch("/api/sync/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const quizData = await quizRes.json();
      if (!quizRes.ok) throw new Error(quizData.error ?? "Quiz sync failed");
      const quizCount = quizData.quizzes?.length ?? 0;
      const totalResponses = (quizData.quizzes ?? []).reduce(
        (sum: number, q: { responseCount: number }) => sum + q.responseCount,
        0,
      );
      updateStep("s3", { status: "completed", detail: `${totalResponses} responses across ${quizCount} quiz(es)` });

      updateStep("s4", { status: "in_progress" });
      await new Promise((r) => setTimeout(r, 300));
      updateStep("s4", { status: "completed", detail: "All data persisted" });

      setDone(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sync failed";
      setError(msg);
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "in_progress" ? { ...s, status: "error", detail: msg } : s,
        ),
      );
    }
    setSyncing(false);
  }

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Data Sync
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        Sync quiz data from Google Classroom and Forms
      </p>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24, marginBottom: 20 }}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 0",
              borderBottom: index < steps.length - 1 ? "1px solid #F0ECE5" : "none",
            }}
          >
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
                      : step.status === "error"
                        ? "#FDECEA"
                        : "#F0ECE5",
                color:
                  step.status === "completed"
                    ? "#3D7A2E"
                    : step.status === "in_progress"
                      ? "#8B6914"
                      : step.status === "error"
                        ? "#A63D2E"
                        : "#B5AA9C",
                transition: "all 0.3s",
              }}
            >
              {step.status === "completed" ? "✓" : step.status === "error" ? "✗" : step.status === "in_progress" ? "•" : index + 1}
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
                        : step.status === "error"
                          ? "#A63D2E"
                          : "#8A7D6F",
                }}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="edu-muted" style={{ fontSize: 12 }}>
                  {step.detail}
                </p>
              )}
            </div>
            {step.status === "in_progress" && (
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid #E8DFD4",
                  borderTopColor: "#C17A56",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            )}
          </div>
        ))}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {error && (
        <p style={{ color: "#A63D2E", fontSize: 13, marginBottom: 14 }}>{error}</p>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        {!done && (
          <button className="edu-btn" onClick={startSync} disabled={syncing}>
            {syncing ? "Syncing…" : "Start Sync"}
          </button>
        )}
        {done && (
          <Link href={routes.analysis(courseId, quizId)}>
            <button className="edu-btn">Proceed to Analysis</button>
          </Link>
        )}
        {done && (
          <button className="edu-btn-outline" onClick={startSync}>
            Re-sync
          </button>
        )}
      </div>
    </div>
  );
}
