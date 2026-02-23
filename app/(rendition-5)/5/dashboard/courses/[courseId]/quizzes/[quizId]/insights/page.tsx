"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockAnalysisResult, getQuizById } from "@/lib/mock-data";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";

export default function R5Insights() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const data = mockAnalysisResult;

  return (
    <div>
      <div className="r5-slide-in" style={{ marginBottom: 18 }}>
        <h1 className="r5-heading" style={{ fontSize: 20, marginBottom: 3 }}>Class Insights</h1>
        <p style={{ color: "#64748B", fontSize: 13 }}>{quiz?.title ?? "Quiz"}</p>
      </div>

      <div className="r5-slide-in r5-sd1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Avg Score / 40", value: data.averageScore, color: "#C9A96E" },
          { label: "Median", value: data.medianScore, color: "#93C5FD" },
          { label: "Completion", value: `${data.completionRate}%`, color: "#86EFAC" },
          { label: "At-Risk", value: data.riskDistribution.filter((r) => r.level === "critical" || r.level === "high").reduce((a, r) => a + r.count, 0), color: "#FCA5A5" },
        ].map((s) => (
          <div key={s.label} className="r5-card" style={{ padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#64748B" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="r5-slide-in r5-sd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div className="r5-card" style={{ padding: 20 }}>
          <h3 className="r5-heading" style={{ fontSize: 14, marginBottom: 10 }}>Risk Distribution</h3>
          <RiskDistribution data={data.riskDistribution} colors={{ critical: "#FCA5A5", high: "#FDBA74", medium: "#FCD34D", low: "#86EFAC" }} />
        </div>
        <div className="r5-card" style={{ padding: 20 }}>
          <h3 className="r5-heading" style={{ fontSize: 14, marginBottom: 10 }}>Concept Mastery</h3>
          <ConceptHeatmap data={data.conceptHeatmap} accentColor="#86EFAC" dangerColor="#FCA5A5" />
        </div>
      </div>

      <div className="r5-slide-in r5-sd3" style={{ display: "flex", gap: 8 }}>
        <Link href={`/5/dashboard/courses/${courseId}/quizzes/${quizId}/students`}><button className="r5-btn">Student List</button></Link>
        <Link href={`/5/dashboard/courses/${courseId}/history`}><button className="r5-btn-outline">History</button></Link>
      </div>
    </div>
  );
}
