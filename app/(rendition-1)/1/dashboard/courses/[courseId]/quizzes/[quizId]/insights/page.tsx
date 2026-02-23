"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockAnalysisResult, getQuizById } from "@/lib/mock-data";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";

export default function R1Insights() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const data = mockAnalysisResult;

  return (
    <div>
      <div className="r1-fade-in" style={{ marginBottom: 24 }}>
        <h1 className="r1-heading" style={{ fontSize: 24, marginBottom: 4 }}>Class Insights</h1>
        <p style={{ color: "#8B7E7E", fontSize: 15 }}>{quiz?.title ?? "Quiz"}</p>
      </div>

      <div className="r1-fade-in r1-fade-in-delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="r1-card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#C1694F" }}>{data.averageScore}</p>
          <p style={{ fontSize: 13, color: "#8B7E7E" }}>Avg Score / 40</p>
        </div>
        <div className="r1-card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#4A90D9" }}>{data.medianScore}</p>
          <p style={{ fontSize: 13, color: "#8B7E7E" }}>Median Score</p>
        </div>
        <div className="r1-card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{data.completionRate}%</p>
          <p style={{ fontSize: 13, color: "#8B7E7E" }}>Completion</p>
        </div>
        <div className="r1-card" style={{ padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#dc2626" }}>
            {data.riskDistribution.filter((r) => r.level === "critical" || r.level === "high").reduce((a, r) => a + r.count, 0)}
          </p>
          <p style={{ fontSize: 13, color: "#8B7E7E" }}>At-Risk Students</p>
        </div>
      </div>

      <div className="r1-fade-in r1-fade-in-delay-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="r1-card" style={{ padding: 24 }}>
          <h3 className="r1-heading" style={{ fontSize: 17, marginBottom: 16 }}>Risk Distribution</h3>
          <RiskDistribution data={data.riskDistribution} />
        </div>
        <div className="r1-card" style={{ padding: 24 }}>
          <h3 className="r1-heading" style={{ fontSize: 17, marginBottom: 16 }}>Concept Mastery</h3>
          <ConceptHeatmap data={data.conceptHeatmap} />
        </div>
      </div>

      <div className="r1-fade-in r1-fade-in-delay-3" style={{ display: "flex", gap: 12 }}>
        <Link href={`/1/dashboard/courses/${courseId}/quizzes/${quizId}/students`}>
          <button className="r1-btn">Open Student List</button>
        </Link>
        <Link href={`/1/dashboard/courses/${courseId}/history`}>
          <button className="r1-btn-outline">View History</button>
        </Link>
      </div>
    </div>
  );
}
