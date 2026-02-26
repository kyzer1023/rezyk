"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";

interface StudentAnalysis {
  studentId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  misconceptions: { concept: string; errorType: string; affectedQuestions: string[]; evidence: string }[];
  interventions: { type: string; focusArea: string; action: string }[];
  rationale: string;
}

const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#FDECEA", color: "#A63D2E" },
  high: { bg: "#FEF4E5", color: "#A25E1A" },
  medium: { bg: "#FEF8E7", color: "#8B6914" },
  low: { bg: "#E9F3E5", color: "#3D7A2E" },
};

export default function StudentsPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const [students, setStudents] = useState<StudentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    const res = await fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as {
      found?: boolean;
      modelOutput?: { students?: StudentAnalysis[] };
      emailMapping?: Record<string, string>;
    };
    if (data.found) {
      setStudents(data.modelOutput?.students ?? []);
      setEmailMap(data.emailMapping ?? {});
    } else {
      setStudents([]);
      setEmailMap({});
    }
  }, [courseId, quizId]);

  useEffect(() => {
    loadStudents()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadStudents]);

  async function runAnalysisInPlace() {
    setRunningAnalysis(true);
    setActionError(null);
    try {
      const res = await fetch("/api/analyze/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setActionError(payload.error ?? "Failed to run analysis.");
        return;
      }
      await loadStudents();
    } catch {
      setActionError("Failed to run analysis.");
    } finally {
      setRunningAnalysis(false);
    }
  }

  const filtered = students
    .filter((s) => riskFilter === "all" || s.riskLevel === riskFilter)
    .filter((s) => {
      if (!search) return true;
      const email = emailMap[s.studentId] ?? "";
      return s.studentId.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    });

  const riskOrder = ["critical", "high", "medium", "low"];
  const sorted = [...filtered].sort((a, b) => riskOrder.indexOf(a.riskLevel) - riskOrder.indexOf(b.riskLevel));

  if (loading) return <p className="edu-muted">Loading students...</p>;

  if (students.length === 0) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 12 }}>Students</h1>
        <p className="edu-muted" style={{ marginBottom: 12 }}>
          {runningAnalysis
            ? "Running analysis now..."
            : "No analysis results. Run analysis to unlock student-level insights."}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="edu-btn" onClick={runAnalysisInPlace} disabled={runningAnalysis}>
            {runningAnalysis ? "Running..." : "Run Analysis Now"}
          </button>
          <Link href={routes.analysis(courseId, quizId)}>
            <button className="edu-btn-outline">Open Analysis Page</button>
          </Link>
        </div>
        {actionError && (
          <p style={{ color: "#A63D2E", fontSize: 12, marginTop: 10 }}>{actionError}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>Students</h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 16 }}>
        {students.length} student(s) analyzed
      </p>

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
