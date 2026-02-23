"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudentById, getNextAtRiskStudent } from "@/lib/mock-data";

export default function R5StudentDetail() {
  const { courseId, quizId, studentId } = useParams<{ courseId: string; quizId: string; studentId: string }>();
  const student = getStudentById(studentId);
  const nextStudent = getNextAtRiskStudent(studentId);
  if (!student) return <p style={{ color: "#94A3B8" }}>Student not found.</p>;

  return (
    <div>
      <div className="r5-slide-in" style={{ marginBottom: 18 }}>
        <h1 className="r5-heading" style={{ fontSize: 20, marginBottom: 3 }}>{student.name}</h1>
        <p style={{ color: "#64748B", fontSize: 13 }}>{student.email}</p>
      </div>

      <div className="r5-slide-in r5-sd1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
        <div className="r5-card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#C9A96E" }}>{student.score}/{student.totalScore}</p>
          <p style={{ fontSize: 11, color: "#64748B" }}>Score</p>
        </div>
        <div className="r5-card" style={{ padding: 16, textAlign: "center" }}>
          <span className={`r5-badge r5-badge-${student.riskLevel}`} style={{ fontSize: 13, padding: "3px 12px" }}>{student.riskLevel}</span>
          <p style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>Risk</p>
        </div>
        <div className="r5-card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#93C5FD" }}>{student.knowledgeGaps.length}</p>
          <p style={{ fontSize: 11, color: "#64748B" }}>Gaps</p>
        </div>
      </div>

      {student.knowledgeGaps.length > 0 && (
        <div className="r5-slide-in r5-sd2" style={{ marginBottom: 18 }}>
          <h3 className="r5-heading" style={{ fontSize: 15, marginBottom: 8 }}>Knowledge Gaps</h3>
          {student.knowledgeGaps.map((gap) => (
            <div key={gap.concept} className="r5-card" style={{ padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{gap.concept}</p>
                <div style={{ display: "flex", gap: 4 }}>
                  <span className={`r5-badge r5-badge-${gap.severity === "severe" ? "critical" : gap.severity === "moderate" ? "high" : "medium"}`}>{gap.severity}</span>
                  <span className="r5-badge r5-badge-not_started">{gap.errorType}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#64748B" }}>Questions: {gap.affectedQuestions.join(", ")}</p>
            </div>
          ))}
        </div>
      )}

      {student.interventions.length > 0 && (
        <div className="r5-slide-in r5-sd3" style={{ marginBottom: 18 }}>
          <h3 className="r5-heading" style={{ fontSize: 15, marginBottom: 8 }}>Interventions</h3>
          {student.interventions.map((iv, i) => (
            <div key={i} className="r5-card" style={{ padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{iv.focusArea}</p>
                <div style={{ display: "flex", gap: 4 }}>
                  <span className="r5-badge r5-badge-completed">{iv.type}</span>
                  {iv.planned && <span className="r5-badge r5-badge-low">Planned</span>}
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#64748B" }}>{iv.description}</p>
              {!iv.planned && <button className="r5-btn" style={{ marginTop: 8, padding: "5px 14px", fontSize: 12 }}>Mark Planned</button>}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Link href={`/5/dashboard/courses/${courseId}/quizzes/${quizId}/insights`}><button className="r5-btn-outline">Back to Insights</button></Link>
        {nextStudent && nextStudent.id !== studentId && (
          <Link href={`/5/dashboard/courses/${courseId}/quizzes/${quizId}/students/${nextStudent.id}`}>
            <button className="r5-btn">Next At-Risk: {nextStudent.name}</button>
          </Link>
        )}
      </div>
    </div>
  );
}
