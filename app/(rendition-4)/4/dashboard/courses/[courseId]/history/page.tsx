"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockHistorySnapshots } from "@/lib/mock-data";
import TrendChart from "@/lib/charts/TrendChart";

export default function R4History() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div>
      <h1 className="r4-heading r4-fade-in" style={{ fontSize: 22, marginBottom: 20 }}>Course History</h1>

      <div className="r4-card r4-fade-in r4-fd1" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="r4-heading" style={{ fontSize: 15, marginBottom: 14 }}>Score Trend</h3>
        <TrendChart data={mockHistorySnapshots} lineColor="#5C7D99" gridColor="rgba(160,178,196,0.2)" />
      </div>

      <h3 className="r4-heading r4-fade-in r4-fd2" style={{ fontSize: 16, marginBottom: 14 }}>Past Quizzes</h3>
      {mockHistorySnapshots.map((snap) => (
        <div key={snap.quizId} className="r4-card" style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{snap.quizTitle}</p>
              <p className="r4-muted" style={{ fontSize: 12 }}>{snap.date}</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#5C7D99" }}>{snap.averageScore.toFixed(1)}/40</p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {snap.topWeakConcepts.map((c) => <span key={c} className="r4-badge r4-badge-high">{c}</span>)}
          </div>
          <Link href={`/4/dashboard/courses/${courseId}/quizzes/${snap.quizId}/insights`}>
            <button className="r4-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>View</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
