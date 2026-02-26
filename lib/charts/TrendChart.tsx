"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { QuizSnapshot } from "../types";

interface TrendChartProps {
  data: QuizSnapshot[];
  lineColor?: string;
  gridColor?: string;
  height?: number;
}

export default function TrendChart({
  data,
  lineColor = "#C17A56",
  gridColor = "#e5e7eb",
  height = 280,
}: TrendChartProps) {
  const chartData = data.map((d) => ({
    name: d.quizTitle.length > 20 ? d.quizTitle.slice(0, 20) + "..." : d.quizTitle,
    average: d.averageScore,
    date: d.date,
    critical: d.riskDistribution.find((r) => r.level === "critical")?.count ?? 0,
    high: d.riskDistribution.find((r) => r.level === "high")?.count ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 40]} />
        <Tooltip
          formatter={(value, name) => {
            const v = Number(value);
            if (name === "average") return [`${v.toFixed(1)} / 40`, "Avg Score"];
            if (name === "critical") return [`${v}`, "Critical"];
            if (name === "high") return [`${v}`, "High Risk"];
            return [`${v}`, `${name}`];
          }}
        />
        <ReferenceLine y={24} stroke="#d97706" strokeDasharray="5 5" label="Pass" />
        <Line
          type="monotone"
          dataKey="average"
          stroke={lineColor}
          strokeWidth={2.5}
          dot={{ r: 5, fill: lineColor }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="critical"
          stroke="#dc2626"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="high"
          stroke="#ea580c"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
