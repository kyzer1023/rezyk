"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockAnalysisResult, getQuizById } from "@/lib/mock-data";
import RiskDistribution from "@/lib/charts/RiskDistribution";
import ConceptHeatmap from "@/lib/charts/ConceptHeatmap";
import { routes } from "@/lib/routes";

export default function InsightsPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const quiz = getQuizById(quizId);
  const data = mockAnalysisResult;

  return (
    <div>
      <div className="edu-fade-in" style={{ marginBottom: 20 }}>
        <h1 className="edu-heading" style={{ fontSize: 22, marginBottom: 4 }}>
          Class Insights
        </h1>
        <p className="edu-muted" style={{ fontSize: 14 }}>{quiz?.title ?? "Quiz"}</p>
      </div>

      <div className="edu-fade-in edu-fd1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Avg Score / 40", value: data.averageScore, color: "#C17A56" },
          { label: "Median Score", value: data.medianScore, color: "#2B5E9E" },
          { label: "Completion", value: `${data.completionRate}%`, color: "#6B8E5C" },
          {
            label: "At-Risk",
            value: data.riskDistribution
              .filter((risk) => risk.level === "critical" || risk.level === "high")
              .reduce((sum, risk) => sum + risk.count, 0),
            color: "#A63D2E",
          },
        ].map((stat) => (
          <div key={stat.label} className="edu-card" style={{ padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</p>
            <p className="edu-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="edu-fade-in edu-fd2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div className="edu-card" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 15, marginBottom: 14 }}>
            Risk Distribution
          </h3>
          <RiskDistribution
            data={data.riskDistribution}
            colors={{ critical: "#A63D2E", high: "#C17A56", medium: "#C4A44A", low: "#6B8E5C" }}
          />
        </div>
        <div className="edu-card" style={{ padding: 24 }}>
          <h3 className="edu-heading" style={{ fontSize: 15, marginBottom: 14 }}>
            Concept Mastery
          </h3>
          <ConceptHeatmap data={data.conceptHeatmap} accentColor="#6B8E5C" dangerColor="#A63D2E" />
        </div>
      </div>

      <div className="edu-fade-in edu-fd3" style={{ display: "flex", gap: 10 }}>
        <Link href={routes.students(courseId, quizId)}>
          <button className="edu-btn">Student List</button>
        </Link>
        <Link href={routes.history(courseId)}>
          <button className="edu-btn-outline">View History</button>
        </Link>
      </div>
    </div>
  );
}
