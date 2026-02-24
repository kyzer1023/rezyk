"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudentById, getNextAtRiskStudent } from "@/lib/mock-data";
import { routes } from "@/lib/routes";

export default function StudentDetailPage() {
  const { courseId, quizId, studentId } = useParams<{
    courseId: string;
    quizId: string;
    studentId: string;
  }>();
  const student = getStudentById(studentId);
  const nextStudent = getNextAtRiskStudent(studentId);
  if (!student) {
    return <p>Student not found.</p>;
  }

  return (
    <div>
      <div className="edu-fade-in" style={{ marginBottom: 20 }}>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 4 }}>
          {student.name}
        </h1>
        <p className="edu-muted" style={{ fontSize: 14 }}>{student.email}</p>
      </div>

      <div className="edu-fade-in edu-fd1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <div className="edu-card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#C17A56" }}>
            {student.score}/{student.totalScore}
          </p>
          <p className="edu-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Score
          </p>
        </div>
        <div className="edu-card" style={{ padding: 16, textAlign: "center" }}>
          <span className={`edu-badge edu-badge-${student.riskLevel}`} style={{ fontSize: 14, padding: "4px 14px" }}>
            {student.riskLevel}
          </span>
          <p className="edu-muted" style={{ fontSize: 11, marginTop: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Risk Level
          </p>
        </div>
        <div className="edu-card" style={{ padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#2B5E9E" }}>{student.knowledgeGaps.length}</p>
          <p className="edu-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Gaps</p>
        </div>
      </div>

      {student.knowledgeGaps.length > 0 && (
        <div className="edu-fade-in edu-fd2" style={{ marginBottom: 20 }}>
          <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 10 }}>
            Knowledge Gaps
          </h3>
          {student.knowledgeGaps.map((gap) => (
            <div key={gap.concept} className="edu-card" style={{ padding: 16, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{gap.concept}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className={`edu-badge edu-badge-${gap.severity === "severe" ? "critical" : gap.severity === "moderate" ? "high" : "medium"}`}>
                    {gap.severity}
                  </span>
                  <span className="edu-badge edu-badge-not_started">{gap.errorType}</span>
                </div>
              </div>
              <p className="edu-muted" style={{ fontSize: 13 }}>
                Questions: {gap.affectedQuestions.join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}

      {student.interventions.length > 0 && (
        <div className="edu-fade-in edu-fd3" style={{ marginBottom: 20 }}>
          <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 10 }}>
            Interventions
          </h3>
          {student.interventions.map((intervention, index) => (
            <div key={index} className="edu-card" style={{ padding: 16, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{intervention.focusArea}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="edu-badge edu-badge-completed">{intervention.type}</span>
                  {intervention.planned && <span className="edu-badge edu-badge-low">Planned</span>}
                </div>
              </div>
              <p className="edu-muted" style={{ fontSize: 13 }}>{intervention.description}</p>
              {!intervention.planned && (
                <button className="edu-btn" style={{ marginTop: 10, padding: "6px 18px", fontSize: 13 }}>
                  Mark Planned
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <Link href={routes.insights(courseId, quizId)}>
          <button className="edu-btn-outline">Back to Insights</button>
        </Link>
        {nextStudent && nextStudent.id !== studentId && (
          <Link href={routes.studentDetail(courseId, quizId, nextStudent.id)}>
            <button className="edu-btn">Next At-Risk: {nextStudent.name}</button>
          </Link>
        )}
      </div>
    </div>
  );
}
