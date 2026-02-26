"use client";

import type { CSSProperties, ReactNode } from "react";

export function SkeletonBox({
  width = "100%",
  height = 14,
  radius = 6,
  style,
}: {
  width?: CSSProperties["width"];
  height?: number;
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      className="edu-skeleton"
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 14,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={`metric-skeleton-${index}`} className="edu-card" style={{ padding: 22 }}>
          <SkeletonBox width="42%" height={11} style={{ marginBottom: 10 }} />
          <SkeletonBox width="58%" height={32} radius={8} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="edu-card" style={{ padding: 24 }}>
      <SkeletonBox width="40%" height={16} style={{ marginBottom: 14 }} />
      <SkeletonBox width="100%" height={height} radius={10} />
    </div>
  );
}

export function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="edu-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <SkeletonBox width="26%" />
        <SkeletonBox width="16%" />
        <SkeletonBox width="16%" />
        <SkeletonBox width="16%" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`row-skeleton-${index}`}
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 12,
            padding: "12px 0",
            borderTop: "1px solid #F0ECE5",
          }}
        >
          <SkeletonBox width="75%" />
          <SkeletonBox width="55%" />
          <SkeletonBox width="55%" />
          <SkeletonBox width="62%" />
        </div>
      ))}
    </div>
  );
}

type PanelStateTone = "loading" | "empty" | "error" | "info";

const TONE_COLORS: Record<PanelStateTone, string> = {
  loading: "#8B6914",
  empty: "#8A7D6F",
  error: "#A63D2E",
  info: "#6D6154",
};

export function PanelStateBlock({
  title,
  description,
  tone = "info",
  action,
}: {
  title: string;
  description: string;
  tone?: PanelStateTone;
  action?: ReactNode;
}) {
  return (
    <div className="edu-card" style={{ padding: 24 }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TONE_COLORS[tone] }}>{title}</p>
      <p className="edu-muted" style={{ margin: "6px 0 0", fontSize: 13 }}>
        {description}
      </p>
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </div>
  );
}

export function RefreshingOverlay({
  show,
  label = "Updating data...",
}: {
  show: boolean;
  label?: string;
}) {
  if (!show) return null;
  return (
    <div className="edu-refresh-overlay" role="status" aria-live="polite">
      <span>{label}</span>
    </div>
  );
}
