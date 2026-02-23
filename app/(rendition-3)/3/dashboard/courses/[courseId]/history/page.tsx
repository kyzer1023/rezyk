"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockHistorySnapshots } from "@/lib/mock-data";
import TrendChart from "@/lib/charts/TrendChart";

export default function R3History() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div>
      <h1 className="r3-heading r3-fade-in" style={{ fontSize: 22, marginBottom: 20 }}>Course History</h1>

      <div className="r3-card r3-fade-in r3-fd1" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="r3-heading" style={{ fontSize: 15, marginBottom: 14 }}>Score Trend</h3>
        <TrendChart data={mockHistorySnapshots} lineColor="#C17A56" gridColor="#E8DFD4" />
      </div>

      <h3 className="r3-heading r3-fade-in r3-fd2" style={{ fontSize: 16, marginBottom: 14 }}>Past Quizzes</h3>
      {mockHistorySnapshots.map((snap) => (
        <div key={snap.quizId} className="r3-card" style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{snap.quizTitle}</p>
              <p className="r3-muted" style={{ fontSize: 12 }}>{snap.date}</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#C17A56" }}>{snap.averageScore.toFixed(1)}/40</p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {snap.topWeakConcepts.map((c) => <span key={c} className="r3-badge r3-badge-high">{c}</span>)}
          </div>
          <Link href={`/3/dashboard/courses/${courseId}/quizzes/${snap.quizId}/insights`}>
            <button className="r3-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>View</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
