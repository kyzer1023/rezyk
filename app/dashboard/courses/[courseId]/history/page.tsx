"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import TrendChart from "@/lib/charts/TrendChart";

interface QuizAnalysis {
  quizId: string;
  title: string;
  createdAt: number;
  averageScore: number;
  riskDistribution: { riskLevel: string; count: number; percentage: number }[];
  topWeakConcepts: string[];
}

export default function HistoryPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [snapshots, setSnapshots] = useState<QuizAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const qRes = await fetch(`/api/dashboard/quizzes?courseId=${courseId}`);
        const qData = await qRes.json();
        const quizzes = qData.quizzes ?? [];

        const analyses: QuizAnalysis[] = [];
        for (const quiz of quizzes) {
          if (quiz.analysisStatus !== "completed") continue;
          const aRes = await fetch(`/api/dashboard/analysis?courseId=${courseId}&quizId=${quiz.id}`);
          const aData = await aRes.json();
          if (!aData.found) continue;
          analyses.push({
            quizId: quiz.id,
            title: quiz.title,
            createdAt: aData.createdAt,
            averageScore: aData.derivedAnalysis?.scoreMetrics?.averageScore ?? 0,
            riskDistribution: aData.derivedAnalysis?.riskDistribution ?? [],
            topWeakConcepts: (aData.derivedAnalysis?.conceptHeatmap ?? [])
              .slice(0, 3)
              .map((c: { concept: string }) => c.concept),
          });
        }

        if (!cancelled) setSnapshots(analyses);
      } catch {
        // silent
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [courseId]);

  const trendData = snapshots.map((s) => ({
    quizId: s.quizId,
    quizTitle: s.title,
    date: new Date(s.createdAt).toISOString().slice(0, 10),
    averageScore: s.averageScore,
    riskDistribution: s.riskDistribution.map((r) => ({
      level: r.riskLevel as "low" | "medium" | "high" | "critical",
      count: r.count,
      percentage: r.percentage,
    })),
    topWeakConcepts: s.topWeakConcepts,
  }));

  if (loading) return <p className="edu-muted">Loading history…</p>;

  return (
    <div>
      <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 4 }}>
        Quiz History
      </h1>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {snapshots.length} analyzed quiz(es) for this course
      </p>

      {snapshots.length > 0 && (
        <div className="edu-card edu-fade-in edu-fd2" style={{ padding: 24, marginBottom: 20 }}>
          <h3 className="edu-heading" style={{ fontSize: 16, marginBottom: 14 }}>Score Trend</h3>
          <TrendChart data={trendData} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {snapshots.map((snap) => (
          <div key={snap.quizId} className="edu-card edu-fade-in" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{snap.title}</p>
                <p className="edu-muted" style={{ fontSize: 12, margin: "4px 0 0" }}>
                  Avg: {snap.averageScore.toFixed(1)}% &middot;{" "}
                  {new Date(snap.createdAt).toLocaleDateString()} &middot;{" "}
                  Top gaps: {snap.topWeakConcepts.join(", ") || "None"}
                </p>
              </div>
              <Link href={routes.insights(courseId, snap.quizId)}>
                <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 12 }}>
                  View
                </button>
              </Link>
            </div>
          </div>
        ))}
        {snapshots.length === 0 && (
          <div className="edu-card" style={{ padding: 32, textAlign: "center" }}>
            <p className="edu-muted">No analyzed quizzes yet. Run analysis on a quiz first.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <Link href={routes.course(courseId)}>
          <button className="edu-btn-outline">Back to Course</button>
        </Link>
      </div>
    </div>
  );
}
