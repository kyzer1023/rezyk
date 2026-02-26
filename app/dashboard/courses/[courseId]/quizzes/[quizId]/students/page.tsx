"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";

interface StudentAnalysis {
  studentId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  misconceptions: { concept: string; errorType: string; affectedQuestions: string[]; evidence: string }[];
  interventions: { type: string; focusArea: string; action: string }[];
  rationale: string;
}

interface BatchResult {
  generated: number;
  failed: number;
  total: number;
}

const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#FDECEA", color: "#A63D2E" },
  high: { bg: "#FEF4E5", color: "#A25E1A" },
  medium: { bg: "#FEF8E7", color: "#8B6914" },
  low: { bg: "#E9F3E5", color: "#3D7A2E" },
};

const BATCH_FILTERS = [
  { value: "critical_high", label: "Critical + High (recommended)" },
  { value: "critical", label: "Critical only" },
  { value: "high", label: "High only" },
  { value: "medium", label: "Medium only" },
  { value: "low", label: "Low only" },
  { value: "all", label: "All students" },
] as const;

export default function StudentsPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const [students, setStudents] = useState<StudentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [batchFilter, setBatchFilter] = useState("critical_high");
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [showBatchPanel, setShowBatchPanel] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.found) {
          setStudents(data.modelOutput?.students ?? []);
          setEmailMap(data.emailMapping ?? {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId, quizId]);

  const handleBatchGenerate = useCallback(async () => {
    setBatchGenerating(true);
    setBatchResult(null);
    try {
      const res = await fetch("/api/notes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId, categoryFilter: batchFilter }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setBatchResult({
          generated: data.result.generated,
          failed: data.result.failed,
          total: data.result.total,
        });
      }
    } catch {
      // silent
    }
    setBatchGenerating(false);
  }, [courseId, quizId, batchFilter]);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>Students</h1>
          <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 16 }}>
            {students.length} student(s) analyzed
          </p>
        </div>
        <button
          className="edu-btn edu-fade-in"
          style={{ padding: "8px 18px", fontSize: 13 }}
          onClick={() => setShowBatchPanel(!showBatchPanel)}
        >
          Batch Generate Notes
        </button>
      </div>

      {showBatchPanel && (
        <div className="edu-card edu-fade-in" style={{ padding: 20, marginBottom: 16 }}>
          <h3 className="edu-heading" style={{ fontSize: 15, marginBottom: 12 }}>Batch Note Generation</h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "#5A5048" }}>Category:</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              style={{ padding: "6px 12px", border: "1px solid #E8DFD4", borderRadius: 6, fontSize: 13, background: "#FFF" }}
            >
              {BATCH_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <button
              className="edu-btn"
              style={{ padding: "6px 16px", fontSize: 13 }}
              onClick={handleBatchGenerate}
              disabled={batchGenerating}
            >
              {batchGenerating ? "Generating…" : "Generate"}
            </button>
          </div>
          {batchGenerating && (
            <p className="edu-muted" style={{ fontSize: 13 }}>
              Generating notes with AI… This may take a moment for large batches.
            </p>
          )}
          {batchResult && (
            <div style={{ background: batchResult.failed > 0 ? "#FEF8E7" : "#E9F3E5", borderRadius: 6, padding: "10px 14px", fontSize: 13 }}>
              <strong>{batchResult.generated}</strong> of {batchResult.total} notes generated successfully.
              {batchResult.failed > 0 && (
                <span style={{ color: "#A63D2E" }}> {batchResult.failed} failed — open student detail to retry.</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="edu-fade-in edu-fd1" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 14px",
            border: "1px solid #E8DFD4",
            borderRadius: 6,
            fontSize: 13,
            background: "#FFF",
            outline: "none",
          }}
        />
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          style={{
            padding: "8px 14px",
            border: "1px solid #E8DFD4",
            borderRadius: 6,
            fontSize: 13,
            background: "#FFF",
          }}
        >
          <option value="all">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 0, overflow: "hidden" }}>
        {sorted.map((student, idx) => {
          const risk = RISK_COLORS[student.riskLevel] ?? RISK_COLORS.low;
          const email = emailMap[student.studentId] ?? student.studentId;
          const displayName = email.split("@")[0].replace(/[._]/g, " ");
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
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 4,
                    background: risk.bg,
                    color: risk.color,
                    textTransform: "capitalize",
                  }}
                >
                  {student.riskLevel}
                </span>
                <Link href={routes.studentDetail(courseId, quizId, student.studentId)}>
                  <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 12 }}>
                    Details
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
