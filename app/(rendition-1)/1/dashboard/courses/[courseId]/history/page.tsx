"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockHistorySnapshots } from "@/lib/mock-data";
import TrendChart from "@/lib/charts/TrendChart";

export default function R1History() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div>
      <h1 className="r1-heading r1-fade-in" style={{ fontSize: 24, marginBottom: 24 }}>Course History</h1>

      <div className="r1-card r1-fade-in r1-fade-in-delay-1" style={{ padding: 24, marginBottom: 24 }}>
        <h3 className="r1-heading" style={{ fontSize: 17, marginBottom: 16 }}>Score Trend</h3>
        <TrendChart data={mockHistorySnapshots} lineColor="#C1694F" />
      </div>

      <h3 className="r1-heading r1-fade-in r1-fade-in-delay-2" style={{ fontSize: 18, marginBottom: 16 }}>Past Quizzes</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {mockHistorySnapshots.map((snapshot, i) => (
          <div key={snapshot.quizId} className={`r1-card r1-fade-in r1-fade-in-delay-${Math.min(i + 2, 4)}`} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 16 }}>{snapshot.quizTitle}</p>
                <p style={{ fontSize: 13, color: "#8B7E7E" }}>{snapshot.date}</p>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#C1694F" }}>{snapshot.averageScore.toFixed(1)}/40</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {snapshot.topWeakConcepts.map((c) => (
                <span key={c} className="r1-badge r1-badge-high">{c}</span>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <Link href={`/1/dashboard/courses/${courseId}/quizzes/${snapshot.quizId}/insights`}>
                <button className="r1-btn-outline" style={{ padding: "6px 16px", fontSize: 13 }}>View Details</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
