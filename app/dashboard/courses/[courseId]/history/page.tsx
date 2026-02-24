"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { mockHistorySnapshots } from "@/lib/mock-data";
import TrendChart from "@/lib/charts/TrendChart";
import { routes } from "@/lib/routes";

export default function CourseHistoryPage() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 20 }}>
        Course History
      </h1>

      <div className="edu-card edu-fade-in edu-fd1" style={{ padding: 24, marginBottom: 20 }}>
        <h3 className="edu-heading" style={{ fontSize: 15, marginBottom: 14 }}>
          Score Trend
        </h3>
        <TrendChart data={mockHistorySnapshots} lineColor="#C17A56" gridColor="#E8DFD4" />
      </div>

      <h3 className="edu-heading edu-fade-in edu-fd2" style={{ fontSize: 16, marginBottom: 14 }}>
        Past Quizzes
      </h3>
      {mockHistorySnapshots.map((snapshot) => (
        <div key={snapshot.quizId} className="edu-card" style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{snapshot.quizTitle}</p>
              <p className="edu-muted" style={{ fontSize: 12 }}>{snapshot.date}</p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#C17A56" }}>
              {snapshot.averageScore.toFixed(1)}/40
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {snapshot.topWeakConcepts.map((concept) => (
              <span key={concept} className="edu-badge edu-badge-high">
                {concept}
              </span>
            ))}
          </div>
          <Link href={routes.insights(courseId, snapshot.quizId)}>
            <button className="edu-btn-outline" style={{ padding: "5px 14px", fontSize: 12 }}>
              View
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}
