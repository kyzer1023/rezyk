"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ConceptHeatmapEntry } from "../types";

interface ConceptHeatmapProps {
  data: ConceptHeatmapEntry[];
  accentColor?: string;
  dangerColor?: string;
  height?: number;
}

function rateToColor(rate: number, accent: string, danger: string): string {
  if (rate >= 0.75) return accent;
  if (rate >= 0.6) return "#d97706";
  if (rate >= 0.45) return "#ea580c";
  return danger;
}

export default function ConceptHeatmap({
  data,
  accentColor = "#16a34a",
  dangerColor = "#dc2626",
  height = 300,
}: ConceptHeatmapProps) {
  const chartData = data
    .sort((a, b) => a.correctRate - b.correctRate)
    .map((d) => ({
      concept: d.concept,
      correctRate: Math.round(d.correctRate * 100),
      struggling: d.studentsStruggling,
      mastered: d.studentsMastered,
      errorType: d.dominantErrorType,
      raw: d.correctRate,
    }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" domain={[0, 100]} unit="%" />
        <YAxis
          type="category"
          dataKey="concept"
          width={140}
          tick={{ fontSize: 13 }}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, "Correct Rate"]}
          labelFormatter={(label) => `${label}`}
        />
        <Bar dataKey="correctRate" radius={[0, 4, 4, 0]} barSize={24}>
          {chartData.map((entry) => (
            <Cell
              key={entry.concept}
              fill={rateToColor(entry.raw, accentColor, dangerColor)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
