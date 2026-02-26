"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import TrendChart from "@/lib/charts/TrendChart";
import { PanelStateBlock } from "@/components/ui/loading-states";

interface QuizAnalysis {
  quizId: string;
  title: string;
  createdAt: number;
  averageScore: number;
  riskDistribution: { riskLevel: string; count: number; percentage: number }[];
  topWeakConcepts: string[];
}

interface HistoryAnalysisData {
  status: string;
  analyzedQuizIds: string[];
  generatedAt: number;
  analysis?: {
    overallTrend: string;
    confidence: string;
    evidenceSummary: {
      scoreTrajectory: string;
      riskTrajectory: string;
      recurringWeakConcepts: string[];
    };
    interventionImpactHypothesis: {
      appearsToImprove: string[];
      remainsUnresolved: string[];
    };
    nextCycleActions: string[];
    contradictionFlag?: string;
  };
  error?: string;
}

const TREND_BADGE: Record<string, { bg: string; color: string }> = {
  improving: { bg: "#E9F3E5", color: "#3D7A2E" },
  stable: { bg: "#FEF8E7", color: "#8B6914" },
  declining: { bg: "#FDECEA", color: "#A63D2E" },
  insufficient_data: { bg: "#F0ECE5", color: "#8A7D6F" },
};

function HistoryAnalysisBlock({ courseId }: { courseId: string }) {
  const [data, setData] = useState<HistoryAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/analyze/history?courseId=${courseId}`)
      .then((r) => r.json())
      .then((d) => { if (d.found) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  async function runAnalysis() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "History analysis failed");
      if (d.status === "insufficient_data") {
        setData({ status: "insufficient_data", analyzedQuizIds: [], generatedAt: Date.now(), error: d.error });
      } else {
        setData({ status: "success", analyzedQuizIds: [], generatedAt: Date.now(), analysis: d.analysis });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "History analysis failed");
    }
    setRunning(false);
  }

  if (loading) return null;

  const a = data?.analysis;
  const trendStyle = TREND_BADGE[a?.overallTrend ?? "insufficient_data"] ?? TREND_BADGE.insufficient_data;

  return (
    <div className="edu-card edu-fade-in" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 className="edu-heading" style={{ fontSize: 16, margin: 0 }}>History Analysis</h3>
        <button
          className="edu-btn-outline"
          style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={runAnalysis}
          disabled={running}
        >
          {running ? "Analyzing..." : data ? "Re-run Analysis" : "Run History Analysis"}
        </button>
      </div>

      {error && <p style={{ fontSize: 12, color: "#A63D2E", marginBottom: 12 }}>{error}</p>}

      {data?.status === "insufficient_data" && (
        <PanelStateBlock
          title="Insufficient data"
          description={data.error ?? "Need at least 2 analyzed quizzes."}
          tone="empty"
        />
      )}

      {a && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            <div style={{ textAlign: "center" }}>
              <p className="edu-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Trend</p>
              <span style={{ fontSize: 14, fontWeight: 700, padding: "4px 14px", borderRadius: 6, background: trendStyle.bg, color: trendStyle.color }}>
                {a.overallTrend.replace("_", " ")}
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <p className="edu-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Confidence</p>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#6D6154" }}>{a.confidence}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p className="edu-muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Based on</p>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#6D6154" }}>
                {data?.analyzedQuizIds?.length ?? 0} quizzes
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6D6154", margin: "0 0 6px" }}>Score Trajectory</p>
            <p style={{ fontSize: 12, color: "#3D3229", margin: 0, lineHeight: 1.5 }}>{a.evidenceSummary.scoreTrajectory}</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6D6154", margin: "0 0 6px" }}>Risk Trajectory</p>
            <p style={{ fontSize: 12, color: "#3D3229", margin: 0, lineHeight: 1.5 }}>{a.evidenceSummary.riskTrajectory}</p>
          </div>

          {a.contradictionFlag && (
            <div style={{ background: "#FEF4E5", borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#A25E1A", margin: "0 0 4px" }}>Trend Contradiction</p>
              <p style={{ fontSize: 12, color: "#6D6154", margin: 0 }}>{a.contradictionFlag}</p>
            </div>
          )}

          {a.evidenceSummary.recurringWeakConcepts.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#6D6154", margin: "0 0 6px" }}>Recurring Weak Concepts</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {a.evidenceSummary.recurringWeakConcepts.map((c, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: "#FDECEA", color: "#A63D2E", fontWeight: 500 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#3D7A2E", margin: "0 0 6px" }}>Appears to Improve</p>
              {a.interventionImpactHypothesis.appearsToImprove.map((item, i) => (
                <p key={i} style={{ fontSize: 12, color: "#3D3229", margin: "3px 0" }}>• {item}</p>
              ))}
              {a.interventionImpactHypothesis.appearsToImprove.length === 0 && (
                <p style={{ fontSize: 12, color: "#B5AA9C", margin: 0 }}>No clear improvement signals yet.</p>
              )}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#A63D2E", margin: "0 0 6px" }}>Remains Unresolved</p>
              {a.interventionImpactHypothesis.remainsUnresolved.map((item, i) => (
                <p key={i} style={{ fontSize: 12, color: "#3D3229", margin: "3px 0" }}>• {item}</p>
              ))}
              {a.interventionImpactHypothesis.remainsUnresolved.length === 0 && (
                <p style={{ fontSize: 12, color: "#B5AA9C", margin: 0 }}>No persistent issues identified.</p>
              )}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6D6154", margin: "0 0 8px" }}>Next Cycle Actions</p>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {a.nextCycleActions.map((action, i) => (
                <li key={i} style={{ fontSize: 12, marginBottom: 6, lineHeight: 1.5, color: "#3D3229" }}>{action}</li>
              ))}
            </ol>
          </div>

          <p style={{ fontSize: 11, color: "#B5AA9C", marginTop: 12, fontStyle: "italic" }}>
            AI-generated draft — analyzed {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : "recently"}
          </p>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [snapshots, setSnapshots] = useState<QuizAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistorySnapshots = useCallback(async (): Promise<QuizAnalysis[]> => {
    const qRes = await fetch(`/api/dashboard/quizzes?courseId=${courseId}`, {
      cache: "no-store",
    });
    const qData = (await qRes.json()) as {
      quizzes?: Array<{ id: string; title: string; analysisStatus: string }>;
    };
    const quizzes = qData.quizzes ?? [];

    const analyses: QuizAnalysis[] = [];
    for (const quiz of quizzes) {
      if (quiz.analysisStatus !== "completed") continue;
      const aRes = await fetch(
        `/api/dashboard/analysis?courseId=${courseId}&quizId=${quiz.id}`,
        { cache: "no-store" },
      );
      const aData = (await aRes.json()) as {
        found?: boolean;
        createdAt?: number;
        derivedAnalysis?: {
          scoreMetrics?: { averageScore?: number };
          riskDistribution?: { riskLevel: string; count: number; percentage: number }[];
          conceptHeatmap?: Array<{ concept: string }>;
        };
      };
      if (!aData.found) continue;
      analyses.push({
        quizId: quiz.id,
        title: quiz.title,
        createdAt: aData.createdAt ?? Date.now(),
        averageScore: aData.derivedAnalysis?.scoreMetrics?.averageScore ?? 0,
        riskDistribution: aData.derivedAnalysis?.riskDistribution ?? [],
        topWeakConcepts: (aData.derivedAnalysis?.conceptHeatmap ?? [])
          .slice(0, 3)
          .map((c) => c.concept),
      });
    }

    return analyses;
  }, [courseId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const analyses = await fetchHistorySnapshots();
        if (!cancelled) {
          setSnapshots(analyses);
        }
      } catch {
        // silent
      }
      if (!cancelled) {
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchHistorySnapshots]);

  function getScoreColor(score: number): string {
    if (score >= 75) return "#2E7D4B";
    if (score >= 55) return "#A25E1A";
    return "#A63D2E";
  }

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

  if (loading) return <p className="edu-muted">Loading history...</p>;

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <h1 className="edu-heading edu-fade-in" style={{ fontSize: 22, marginBottom: 0 }}>
          Quiz History
        </h1>
      </div>
      <p className="edu-fade-in edu-fd1 edu-muted" style={{ fontSize: 14, marginBottom: 20 }}>
        {snapshots.length} analyzed quiz(es) for this course
      </p>

      <HistoryAnalysisBlock courseId={courseId} />

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
                  Avg: <span style={{ color: getScoreColor(snap.averageScore), fontWeight: 700 }}>{snap.averageScore.toFixed(1)}%</span> &middot;{" "}
                  {new Date(snap.createdAt).toLocaleDateString()} &middot;{" "}
                  Top gaps: {snap.topWeakConcepts.join(", ") || "None"}
                </p>
              </div>
              <Link href={routes.quizWorkspace(courseId, snap.quizId, { view: "insights" })}>
                <button className="edu-btn-outline" style={{ padding: "4px 12px", fontSize: 12 }}>
                  View
                </button>
              </Link>
            </div>
          </div>
        ))}
        {snapshots.length === 0 && (
          <div className="edu-card" style={{ padding: 32, textAlign: "center" }}>
            <p className="edu-muted" style={{ marginBottom: 12 }}>
              No analyzed quizzes yet. Analyze a quiz to populate history trends.
            </p>
            <Link href={routes.quizzes(courseId)}>
              <button className="edu-btn">Open Quiz List</button>
            </Link>
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
