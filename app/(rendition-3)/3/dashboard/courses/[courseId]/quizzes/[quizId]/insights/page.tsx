"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockAnalysisResult, getQuizById } from "@/lib/mock-data";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";

export default function R3Insights() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const data = mockAnalysisResult;

  return (
    <div>
      <div className="r3-fade-in" style={{ marginBottom: 20 }}>
        <h1 className="r3-heading" style={{ fontSize: 22, marginBottom: 4 }}>Class Insights</h1>
        <p className="r3-muted" style={{ fontSize: 14 }}>{quiz?.title ?? "Quiz"}</p>
      </div>

      <div className="r3-fade-in r3-fd1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Avg Score / 40", value: data.averageScore, color: "#C17A56" },
          { label: "Median Score", value: data.medianScore, color: "#2B5E9E" },
          { label: "Completion", value: `${data.completionRate}%`, color: "#6B8E5C" },
          { label: "At-Risk", value: data.riskDistribution.filter((r) => r.level === "critical" || r.level === "high").reduce((a, r) => a + r.count, 0), color: "#A63D2E" },
        ].map((s) => (
          <div key={s.label} className="r3-card" style={{ padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p className="r3-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="r3-fade-in r3-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div className="r3-card" style={{ padding: 24 }}>
          <h3 className="r3-heading" style={{ fontSize: 15, marginBottom: 14 }}>Risk Distribution</h3>
          <RiskDistribution data={data.riskDistribution} colors={{ critical: "#A63D2E", high: "#C17A56", medium: "#C4A44A", low: "#6B8E5C" }} />
        </div>
        <div className="r3-card" style={{ padding: 24 }}>
          <h3 className="r3-heading" style={{ fontSize: 15, marginBottom: 14 }}>Concept Mastery</h3>
          <ConceptHeatmap data={data.conceptHeatmap} accentColor="#6B8E5C" dangerColor="#A63D2E" />
        </div>
      </div>

      <div className="r3-fade-in r3-fd3" style={{ display: "flex", gap: 10 }}>
        <Link href={`/3/dashboard/courses/${courseId}/quizzes/${quizId}/students`}><button className="r3-btn">Student List</button></Link>
        <Link href={`/3/dashboard/courses/${courseId}/history`}><button className="r3-btn-outline">View History</button></Link>
      </div>
    </div>
  );
}
