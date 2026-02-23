"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockAnalysisResult, getQuizById } from "@/lib/mock-data";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";

export default function R2Insights() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const data = mockAnalysisResult;

  return (
    <div>
      <div className="r2-fade-in" style={{ marginBottom: 20 }}>
        <h1 className="r2-heading" style={{ fontSize: 22, marginBottom: 4, fontWeight: 500 }}>
          Class Insights
        </h1>
        <p style={{ color: "rgba(232,229,216,0.5)", fontSize: 14 }}>{quiz?.title ?? "Quiz"}</p>
      </div>

      <div
        className="r2-fade-in r2-fade-in-d1"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}
      >
        {[
          { label: "Avg Score / 40", value: data.averageScore, color: "#8BA878" },
          { label: "Median Score", value: data.medianScore, color: "#90CAF9" },
          { label: "Completion", value: `${data.completionRate}%`, color: "#A5D6A7" },
          {
            label: "At-Risk",
            value: data.riskDistribution
              .filter((r) => r.level === "critical" || r.level === "high")
              .reduce((a, r) => a + r.count, 0),
            color: "#EF9A9A",
          },
        ].map((s) => (
          <div key={s.label} className="r2-card" style={{ padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "rgba(232,229,216,0.45)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div
        className="r2-fade-in r2-fade-in-d2"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}
      >
        <div className="r2-card" style={{ padding: 24 }}>
          <h3 className="r2-heading" style={{ fontSize: 15, marginBottom: 14, fontWeight: 500 }}>
            Risk Distribution
          </h3>
          <RiskDistribution
            data={data.riskDistribution}
            colors={{ critical: "#EF9A9A", high: "#FFCC80", medium: "#FFF59D", low: "#A5D6A7" }}
          />
        </div>
        <div className="r2-card" style={{ padding: 24 }}>
          <h3 className="r2-heading" style={{ fontSize: 15, marginBottom: 14, fontWeight: 500 }}>
            Concept Mastery
          </h3>
          <ConceptHeatmap data={data.conceptHeatmap} accentColor="#8BA878" dangerColor="#EF9A9A" />
        </div>
      </div>

      <div className="r2-fade-in r2-fade-in-d3" style={{ display: "flex", gap: 10 }}>
        <Link href={`/2/dashboard/courses/${courseId}/quizzes/${quizId}/students`}>
          <button className="r2-btn">Student List</button>
        </Link>
        <Link href={`/2/dashboard/courses/${courseId}/history`}>
          <button className="r2-btn-outline">View History</button>
        </Link>
      </div>
    </div>
  );
}
