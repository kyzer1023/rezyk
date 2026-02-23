"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockHistorySnapshots } from "@/lib/mock-data";
import TrendChart from "@/lib/charts/TrendChart";

export default function R5History() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div>
      <h1 className="r5-heading r5-slide-in" style={{ fontSize: 20, marginBottom: 18 }}>Course History</h1>

      <div className="r5-card r5-slide-in r5-sd1" style={{ padding: 20, marginBottom: 18 }}>
        <h3 className="r5-heading" style={{ fontSize: 14, marginBottom: 10 }}>Score Trend</h3>
        <TrendChart data={mockHistorySnapshots} lineColor="#C9A96E" gridColor="rgba(201,169,110,0.1)" />
      </div>

      <h3 className="r5-heading r5-slide-in r5-sd2" style={{ fontSize: 15, marginBottom: 10 }}>Past Quizzes</h3>
      {mockHistorySnapshots.map((snap) => (
        <div key={snap.quizId} className="r5-card" style={{ padding: 14, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{snap.quizTitle}</p>
              <p style={{ fontSize: 11, color: "#64748B" }}>{snap.date}</p>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#C9A96E" }}>{snap.averageScore.toFixed(1)}/40</p>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
            {snap.topWeakConcepts.map((c) => <span key={c} className="r5-badge r5-badge-high">{c}</span>)}
          </div>
          <Link href={`/5/dashboard/courses/${courseId}/quizzes/${snap.quizId}/insights`}>
            <button className="r5-btn-outline" style={{ padding: "3px 10px", fontSize: 11 }}>View</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
