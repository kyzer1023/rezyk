"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudentById, getNextAtRiskStudent } from "@/lib/mock-data";

export default function R2StudentDetail() {
  const { courseId, quizId, studentId } = useParams<{
    courseId: string;
    quizId: string;
    studentId: string;
  }>();
  const student = getStudentById(studentId);
  const nextStudent = getNextAtRiskStudent(studentId);
  if (!student) return <p className="r2-chalk">Student not found.</p>;

  return (
    <div>
      <div className="r2-fade-in" style={{ marginBottom: 20 }}>
        <h1 className="r2-heading" style={{ fontSize: 22, marginBottom: 4, fontWeight: 500 }}>
          {student.name}
        </h1>
        <p style={{ color: "rgba(232,229,216,0.5)", fontSize: 14 }}>{student.email}</p>
      </div>

      <div
        className="r2-fade-in r2-fade-in-d1"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}
      >
        <div className="r2-card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#8BA878" }}>
            {student.score}/{student.totalScore}
          </p>
          <p style={{ fontSize: 11, color: "rgba(232,229,216,0.45)", textTransform: "uppercase", letterSpacing: 0.5 }}>Score</p>
        </div>
        <div className="r2-card" style={{ padding: 16, textAlign: "center" }}>
          <span
            className={`r2-badge r2-badge-${student.riskLevel}`}
            style={{ fontSize: 14, padding: "4px 14px" }}
          >
            {student.riskLevel}
          </span>
          <p style={{ fontSize: 11, color: "rgba(232,229,216,0.45)", marginTop: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Risk Level</p>
        </div>
        <div className="r2-card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#90CAF9" }}>
            {student.knowledgeGaps.length}
          </p>
          <p style={{ fontSize: 11, color: "rgba(232,229,216,0.45)", textTransform: "uppercase", letterSpacing: 0.5 }}>Gaps</p>
        </div>
      </div>

      {student.knowledgeGaps.length > 0 && (
        <div className="r2-fade-in r2-fade-in-d2" style={{ marginBottom: 20 }}>
          <h3 className="r2-heading" style={{ fontSize: 16, marginBottom: 10, fontWeight: 500 }}>
            Knowledge Gaps
          </h3>
          {student.knowledgeGaps.map((gap) => (
            <div key={gap.concept} className="r2-card" style={{ padding: 16, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <p className="r2-chalk" style={{ fontWeight: 600, fontSize: 15 }}>{gap.concept}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <span
                    className={`r2-badge r2-badge-${
                      gap.severity === "severe" ? "critical" : gap.severity === "moderate" ? "high" : "medium"
                    }`}
                  >
                    {gap.severity}
                  </span>
                  <span className="r2-badge r2-badge-not_started">{gap.errorType}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(232,229,216,0.45)" }}>
                Questions: {gap.affectedQuestions.join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}

      {student.interventions.length > 0 && (
        <div className="r2-fade-in r2-fade-in-d3" style={{ marginBottom: 20 }}>
          <h3 className="r2-heading" style={{ fontSize: 16, marginBottom: 10, fontWeight: 500 }}>
            Interventions
          </h3>
          {student.interventions.map((iv, i) => (
            <div key={i} className="r2-card" style={{ padding: 16, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <p className="r2-chalk" style={{ fontWeight: 600, fontSize: 15 }}>{iv.focusArea}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="r2-badge r2-badge-completed">{iv.type}</span>
                  {iv.planned && <span className="r2-badge r2-badge-low">Planned</span>}
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(232,229,216,0.45)" }}>{iv.description}</p>
              {!iv.planned && (
                <button className="r2-btn" style={{ marginTop: 10, padding: "6px 18px", fontSize: 13 }}>
                  Mark Planned
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <Link href={`/2/dashboard/courses/${courseId}/quizzes/${quizId}/insights`}>
          <button className="r2-btn-outline">Back to Insights</button>
        </Link>
        {nextStudent && nextStudent.id !== studentId && (
          <Link href={`/2/dashboard/courses/${courseId}/quizzes/${quizId}/students/${nextStudent.id}`}>
            <button className="r2-btn">Next At-Risk: {nextStudent.name}</button>
          </Link>
        )}
      </div>
    </div>
  );
}
