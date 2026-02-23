"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudentById, getNextAtRiskStudent } from "@/lib/mock-data";

export default function R1StudentDetail() {
  const { courseId, quizId, studentId } = useParams<{ courseId: string; quizId: string; studentId: string }>();
  const student = getStudentById(studentId);
  const nextStudent = getNextAtRiskStudent(studentId);

  if (!student) return <p>Student not found.</p>;

  return (
    <div>
      <div className="r1-fade-in" style={{ marginBottom: 24 }}>
        <h1 className="r1-heading" style={{ fontSize: 24, marginBottom: 4 }}>{student.name}</h1>
        <p style={{ color: "#8B7E7E", fontSize: 15 }}>{student.email}</p>
      </div>

      <div className="r1-fade-in r1-fade-in-delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="r1-card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#C1694F" }}>{student.score}/{student.totalScore}</p>
          <p style={{ fontSize: 13, color: "#8B7E7E" }}>Score</p>
        </div>
        <div className="r1-card" style={{ padding: 20, textAlign: "center" }}>
          <span className={`r1-badge r1-badge-${student.riskLevel}`} style={{ fontSize: 16, padding: "6px 16px" }}>
            {student.riskLevel}
          </span>
          <p style={{ fontSize: 13, color: "#8B7E7E", marginTop: 8 }}>Risk Level</p>
        </div>
        <div className="r1-card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#4A90D9" }}>{student.knowledgeGaps.length}</p>
          <p style={{ fontSize: 13, color: "#8B7E7E" }}>Knowledge Gaps</p>
        </div>
      </div>

      {student.knowledgeGaps.length > 0 && (
        <div className="r1-fade-in r1-fade-in-delay-2" style={{ marginBottom: 24 }}>
          <h3 className="r1-heading" style={{ fontSize: 18, marginBottom: 12 }}>Knowledge Gaps</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {student.knowledgeGaps.map((gap) => (
              <div key={gap.concept} className="r1-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontWeight: 600, fontSize: 16 }}>{gap.concept}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className={`r1-badge r1-badge-${gap.severity === "severe" ? "critical" : gap.severity === "moderate" ? "high" : "medium"}`}>
                      {gap.severity}
                    </span>
                    <span className="r1-badge r1-badge-not_started">{gap.errorType}</span>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#8B7E7E" }}>
                  Affected questions: {gap.affectedQuestions.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {student.interventions.length > 0 && (
        <div className="r1-fade-in r1-fade-in-delay-3" style={{ marginBottom: 24 }}>
          <h3 className="r1-heading" style={{ fontSize: 18, marginBottom: 12 }}>Recommended Interventions</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {student.interventions.map((intervention, i) => (
              <div key={i} className="r1-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontWeight: 600, fontSize: 16 }}>{intervention.focusArea}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="r1-badge r1-badge-completed">{intervention.type}</span>
                    {intervention.planned && <span className="r1-badge r1-badge-low">Planned</span>}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#8B7E7E" }}>{intervention.description}</p>
                {!intervention.planned && (
                  <button className="r1-btn" style={{ marginTop: 12, padding: "8px 20px", fontSize: 14 }}>
                    Mark Intervention Planned
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="r1-fade-in r1-fade-in-delay-4" style={{ display: "flex", gap: 12 }}>
        <Link href={`/1/dashboard/courses/${courseId}/quizzes/${quizId}/insights`}>
          <button className="r1-btn-outline">Back to Class Insights</button>
        </Link>
        {nextStudent && nextStudent.id !== studentId && (
          <Link href={`/1/dashboard/courses/${courseId}/quizzes/${quizId}/students/${nextStudent.id}`}>
            <button className="r1-btn">Next At-Risk: {nextStudent.name}</button>
          </Link>
        )}
      </div>
    </div>
  );
}
