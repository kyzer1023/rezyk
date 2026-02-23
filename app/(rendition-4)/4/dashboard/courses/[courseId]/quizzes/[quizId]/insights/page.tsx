"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockAnalysisResult, getQuizById } from "@/lib/mock-data";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";

export default function R4Insights() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const data = mockAnalysisResult;

  return (
    <div>
      <div className="r4-fade-in" style={{ marginBottom: 20 }}>
        <h1 className="r4-heading" style={{ fontSize: 22, marginBottom: 4 }}>Class Insights</h1>
        <p className="r4-muted" style={{ fontSize: 14 }}>{quiz?.title ?? "Quiz"}</p>
      </div>

      <div className="r4-fade-in r4-fd1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Avg Score / 40", value: data.averageScore, color: "#5C7D99" },
          { label: "Median Score", value: data.medianScore, color: "#4A6B85" },
          { label: "Completion", value: `${data.completionRate}%`, color: "#3A7D5E" },
          { label: "At-Risk", value: data.riskDistribution.filter((r) => r.level === "critical" || r.level === "high").reduce((a, r) => a + r.count, 0), color: "#C6443C" },
        ].map((s) => (
          <div key={s.label} className="r4-card" style={{ padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p className="r4-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="r4-fade-in r4-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div className="r4-card" style={{ padding: 24 }}>
          <h3 className="r4-heading" style={{ fontSize: 15, marginBottom: 14 }}>Risk Distribution</h3>
          <RiskDistribution data={data.riskDistribution} colors={{ critical: "#C6443C", high: "#B8762A", medium: "#907A1E", low: "#3A7D5E" }} />
        </div>
        <div className="r4-card" style={{ padding: 24 }}>
          <h3 className="r4-heading" style={{ fontSize: 15, marginBottom: 14 }}>Concept Mastery</h3>
          <ConceptHeatmap data={data.conceptHeatmap} accentColor="#3A7D5E" dangerColor="#C6443C" />
        </div>
      </div>

      <div className="r4-fade-in r4-fd3" style={{ display: "flex", gap: 10 }}>
        <Link href={`/4/dashboard/courses/${courseId}/quizzes/${quizId}/students`}><button className="r4-btn">Student List</button></Link>
        <Link href={`/4/dashboard/courses/${courseId}/history`}><button className="r4-btn-outline">View History</button></Link>
      </div>
    </div>
  );
}
