"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";

interface StudentAnalysis {
  studentId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  misconceptions: { concept: string; errorType: string; affectedQuestions: string[]; evidence: string }[];
  interventions: { type: string; focusArea: string; action: string }[];
  rationale: string;
}

type BatchCategory = "critical" | "high" | "medium" | "low" | "critical+high" | "all";

const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#FDECEA", color: "#A63D2E" },
  high: { bg: "#FEF4E5", color: "#A25E1A" },
  medium: { bg: "#FEF8E7", color: "#8B6914" },
  low: { bg: "#E9F3E5", color: "#3D7A2E" },
};

const CATEGORY_OPTIONS: { value: BatchCategory; label: string }[] = [
  { value: "critical+high", label: "Critical + High (recommended)" },
  { value: "critical", label: "Critical only" },
  { value: "high", label: "High only" },
  { value: "medium", label: "Medium only" },
  { value: "low", label: "Low only" },
  { value: "all", label: "All students" },
];

export default function StudentsPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const [students, setStudents] = useState<StudentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [batchCategory, setBatchCategory] = useState<BatchCategory>("critical+high");
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<{ generated: number; failed: number; total: number } | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [noteStatuses, setNoteStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [analysisRes, notesRes] = await Promise.all([
          fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`),
          fetch(`/api/notes/list?courseId=${courseId}&quizId=${quizId}`),
        ]);
        const aData = await analysisRes.json();
        const nData = await notesRes.json();
        if (!cancelled && aData.found) {
          setStudents(aData.modelOutput?.students ?? []);
          setEmailMap(aData.emailMapping ?? {});
        }
        if (!cancelled && nData.notes) {
          const statuses: Record<string, boolean> = {};
          for (const n of nData.notes) {
            statuses[n.studentId] = true;
          }
          setNoteStatuses(statuses);
        }
      } catch {
        // silent
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [courseId, quizId]);

  const runBatch = useCallback(async () => {
    setBatchRunning(true);
    setBatchError(null);
    setBatchResult(null);
    try {
      const res = await fetch("/api/notes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId, category: batchCategory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Batch generation failed");
      setBatchResult({ generated: data.generated, failed: data.failed, total: data.total });
      if (data.results) {
        const updated = { ...noteStatuses };
        for (const r of data.results) {
          if (r.status === "success") updated[r.studentId] = true;
        }
        setNoteStatuses(updated);
      }
    } catch (e) {
      setBatchError(e instanceof Error ? e.message : "Failed");
    }
    setBatchRunning(false);
  }, [courseId, quizId, batchCategory, noteStatuses]);

  const filtered = students
    .filter((s) => riskFilter === "all" || s.riskLevel === riskFilter)
    .filter((s) => {
      if (!search) return true;
      const email = emailMap[s.studentId] ?? "";
      return s.studentId.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    });

  const riskOrder = ["critical", "high", "medium", "low"];
  const sorted = [...filtered].sort((a, b) => riskOrder.indexOf(a.riskLevel) - riskOrder.indexOf(b.riskLevel));

  if (loading) return <p className="edu-muted">Loading students…</p>;

  if (students.length === 0) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 12 }}>Students</h1>
        <p className="edu-muted">No analysis results. Run analysis first.</p>
        <Link href={routes.analysis(courseId, quizId)}>
          <button className="edu-btn" style={{ marginTop: 12 }}>Run Analysis</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>Students</h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 16 }}>
        {students.length} student(s) analyzed
      </p>

      <div className="edu-fade-in edu-fd1" style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "8px 14px", border: "1px solid #E8DFD4", borderRadius: 6, fontSize: 13, background: "#FFF", outline: "none" }}
        />
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          style={{ padding: "8px 14px", border: "1px solid #E8DFD4", borderRadius: 6, fontSize: 13, background: "#FFF" }}
        >
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Batch Generate Section */}
      <div className="edu-card edu-fade-in edu-fd1" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#5A5048" }}>Batch Notes:</span>
        <select
          value={batchCategory}
          onChange={(e) => setBatchCategory(e.target.value as BatchCategory)}
          style={{ padding: "6px 10px", border: "1px solid #E8DFD4", borderRadius: 6, fontSize: 12, background: "#FFF" }}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button className="edu-btn" onClick={runBatch} disabled={batchRunning} style={{ padding: "6px 16px", fontSize: 12 }}>
          {batchRunning ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#FFF", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              Generating…
            </span>
          ) : "Generate Notes"}
        </button>
        {batchResult && (
          <span style={{ fontSize: 12, color: batchResult.failed > 0 ? "#A25E1A" : "#3D7A2E" }}>
            {batchResult.generated}/{batchResult.total} generated{batchResult.failed > 0 ? `, ${batchResult.failed} failed` : ""}
          </span>
        )}
        {batchError && <span style={{ fontSize: 12, color: "#A63D2E" }}>{batchError}</span>}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 0, overflow: "hidden" }}>
        {sorted.map((student, idx) => {
          const risk = RISK_COLORS[student.riskLevel] ?? RISK_COLORS.low;
          const email = emailMap[student.studentId] ?? student.studentId;
          const displayName = email.split("@")[0].replace(/[._]/g, " ");
          const hasNote = noteStatuses[student.studentId];
          return (
            <div
              key={student.studentId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: idx < sorted.length - 1 ? "1px solid #F0ECE5" : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0, textTransform: "capitalize" }}>{displayName}</p>
                <p className="edu-muted" style={{ fontSize: 12, margin: "2px 0 0" }}>
                  {student.misconceptions.length} misconception(s) &middot; {email}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {hasNote && (
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 3, background: "#E9F3E5", color: "#3D7A2E" }}>
                    NOTE
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4, background: risk.bg, color: risk.color, textTransform: "capitalize" }}>
                  {student.riskLevel}
                </span>
                <Link href={routes.studentDetail(courseId, quizId, student.studentId)}>
                  <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 12 }}>Details</button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
