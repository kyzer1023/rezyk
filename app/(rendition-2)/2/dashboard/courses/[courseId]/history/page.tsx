"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockHistorySnapshots } from "@/lib/mock-data";
import TrendChart from "@/lib/charts/TrendChart";

export default function R2History() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div>
      <h1 className="r2-heading r2-fade-in" style={{ fontSize: 22, marginBottom: 20, fontWeight: 500 }}>
        Course History
      </h1>

      <div className="r2-card r2-fade-in r2-fade-in-d1" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="r2-heading" style={{ fontSize: 15, marginBottom: 14, fontWeight: 500 }}>
          Score Trend
        </h3>
        <TrendChart data={mockHistorySnapshots} lineColor="#8BA878" gridColor="rgba(139,168,120,0.15)" />
      </div>

      <h3
        className="r2-heading r2-fade-in r2-fade-in-d2"
        style={{ fontSize: 16, marginBottom: 14, fontWeight: 500 }}
      >
        Past Quizzes
      </h3>
      {mockHistorySnapshots.map((snap) => (
        <div key={snap.quizId} className="r2-card" style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <p className="r2-chalk" style={{ fontWeight: 600, fontSize: 15 }}>{snap.quizTitle}</p>
              <p style={{ fontSize: 12, color: "rgba(232,229,216,0.4)" }}>{snap.date}</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#8BA878" }}>
              {snap.averageScore.toFixed(1)}/40
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {snap.topWeakConcepts.map((c) => (
              <span key={c} className="r2-badge r2-badge-high">{c}</span>
            ))}
          </div>
          <Link href={`/2/dashboard/courses/${courseId}/quizzes/${snap.quizId}/insights`}>
            <button className="r2-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>View</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
