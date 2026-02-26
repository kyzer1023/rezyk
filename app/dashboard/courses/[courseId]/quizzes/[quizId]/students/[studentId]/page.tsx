"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import StudentNoteCard from "@/components/notes/StudentNoteCard";

interface Misconception {
  concept: string;
  errorType: string;
  affectedQuestions: string[];
  evidence: string;
}

interface Intervention {
  type: string;
  focusArea: string;
  action: string;
}

interface StudentAnalysis {
  studentId: string;
  riskLevel: string;
  misconceptions: Misconception[];
  interventions: Intervention[];
  rationale: string;
}

interface SavedNoteData {
  noteId: string;
  displayName: string;
  note: {
    studentId: string;
    displayName: string;
    topWeaknesses: { concept: string; errorType: string; rootIssue: string }[];
    improvementTips: string[];
    teacherFollowUp: string;
  };
  generatedAt: number;
  status: string;
  error?: string;
}

const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#FDECEA", color: "#A63D2E" },
  high: { bg: "#FEF4E5", color: "#A25E1A" },
  medium: { bg: "#FEF8E7", color: "#8B6914" },
  low: { bg: "#E9F3E5", color: "#3D7A2E" },
};

const ERROR_TYPE_COLORS: Record<string, string> = {
  conceptual: "#A63D2E",
  procedural: "#A25E1A",
  careless: "#2B5E9E",
};

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string; studentId: string }>;
}) {
  const { courseId, quizId, studentId } = use(params);
  const [student, setStudent] = useState<StudentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [allStudents, setAllStudents] = useState<StudentAnalysis[]>([]);
  const [savedNote, setSavedNote] = useState<SavedNoteData | null>(null);
  const [noteLoading, setNoteLoading] = useState(true);
  const [noteGenerating, setNoteGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.found) {
          const students: StudentAnalysis[] = data.modelOutput?.students ?? [];
          setAllStudents(students);
          setEmailMap(data.emailMapping ?? {});
          const found = students.find((s) => s.studentId === studentId);
          setStudent(found ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId, quizId, studentId]);

  useEffect(() => {
    fetch(`/api/notes?courseId=${courseId}&quizId=${quizId}&studentId=${studentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.found) setSavedNote(data.note);
      })
      .catch(() => {})
      .finally(() => setNoteLoading(false));
  }, [courseId, quizId, studentId]);

  const generateNote = useCallback(async () => {
    setNoteGenerating(true);
    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quizId, studentId }),
      });
      const data = await res.json();
      if (data.success && data.note) {
        setSavedNote(data.note);
      }
    } catch {
      // silent
    }
    setNoteGenerating(false);
  }, [courseId, quizId, studentId]);

  if (loading) return <p className="edu-muted">Loading student details…</p>;
  if (!student) {
    return (
      <div>
        <h1 className="edu-heading" style={{ fontSize: 22 }}>Student Not Found</h1>
        <Link href={routes.students(courseId, quizId)}>
          <button className="edu-btn-outline" style={{ marginTop: 12 }}>Back to Students</button>
        </Link>
      </div>
    );
  }

  const risk = RISK_COLORS[student.riskLevel] ?? RISK_COLORS.low;
  const email = emailMap[student.studentId] ?? student.studentId;
  const displayName = email.split("@")[0].replace(/[._]/g, " ");

  const riskOrder = ["critical", "high", "medium", "low"];
  const atRisk = allStudents
    .filter((s) => s.riskLevel === "critical" || s.riskLevel === "high")
    .sort((a, b) => riskOrder.indexOf(a.riskLevel) - riskOrder.indexOf(b.riskLevel));
  const currentIdx = atRisk.findIndex((s) => s.studentId === studentId);
  const nextStudent = currentIdx >= 0 && currentIdx < atRisk.length - 1 ? atRisk[currentIdx + 1] : atRisk[0];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4, textTransform: "capitalize" }}>
            {displayName}
          </h1>
          <p className="edu-muted edu-fade-in edu-fd1" style={{ fontSize: 13 }}>{email}</p>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "5px 14px",
            borderRadius: 6,
            background: risk.bg,
            color: risk.color,
            textTransform: "capitalize",
          }}
        >
          {student.riskLevel} Risk
        </span>
      </div>

      <div className="edu-card edu-fade-in edu-fd1" style={{ padding: 20, marginBottom: 14 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 10 }}>Rationale</h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#5A5048" }}>{student.rationale}</p>
      </div>

      <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 20, marginBottom: 14 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>
          Knowledge Gaps ({student.misconceptions.length})
        </h3>
        {student.misconceptions.map((mc, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: i < student.misconceptions.length - 1 ? "1px solid #F0ECE5" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{mc.concept}</p>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 3,
                  color: ERROR_TYPE_COLORS[mc.errorType] ?? "#8A7D6F",
                  background: "#F5F0E9",
                  textTransform: "uppercase",
                }}
              >
                {mc.errorType}
              </span>
            </div>
            <p className="edu-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>{mc.evidence}</p>
            <p style={{ fontSize: 11, color: "#B5AA9C", marginTop: 4 }}>
              Questions: {mc.affectedQuestions.join(", ")}
            </p>
          </div>
        ))}
      </div>

      <div className="edu-card edu-fade-in edu-fd3" style={{ padding: 20, marginBottom: 20 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>
          Recommended Interventions ({student.interventions.length})
        </h3>
        {student.interventions.map((iv, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: i < student.interventions.length - 1 ? "1px solid #F0ECE5" : "none" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 3,
                  background: "#E9F3E5",
                  color: "#3D7A2E",
                  textTransform: "uppercase",
                }}
              >
                {iv.type}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{iv.focusArea}</span>
            </div>
            <p style={{ fontSize: 13, color: "#5A5048", lineHeight: 1.5 }}>{iv.action}</p>
          </div>
        ))}
      </div>

      <div className="edu-fade-in" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 className="edu-heading" style={{ fontSize: 16, margin: 0 }}>Asset Note</h3>
          {!savedNote && !noteLoading && (
            <button className="edu-btn" style={{ padding: "8px 18px", fontSize: 13 }} onClick={generateNote} disabled={noteGenerating}>
              {noteGenerating ? "Generating…" : "Generate Asset Note"}
            </button>
          )}
        </div>
        {noteLoading && <p className="edu-muted" style={{ fontSize: 13 }}>Checking for existing note…</p>}
        {noteGenerating && !savedNote && (
          <div className="edu-card" style={{ padding: 24, textAlign: "center" }}>
            <p className="edu-muted" style={{ fontSize: 13 }}>Generating personalized note with AI…</p>
          </div>
        )}
        {savedNote && (
          <StudentNoteCard note={savedNote} onRegenerate={generateNote} regenerating={noteGenerating} />
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {nextStudent && nextStudent.studentId !== studentId && (
          <Link href={routes.studentDetail(courseId, quizId, nextStudent.studentId)}>
            <button className="edu-btn">Next At-Risk Student</button>
          </Link>
        )}
        <Link href={routes.insights(courseId, quizId)}>
          <button className="edu-btn-outline">Back to Insights</button>
        </Link>
        <Link href={routes.students(courseId, quizId)}>
          <button className="edu-btn-outline">All Students</button>
        </Link>
      </div>
    </div>
  );
}
