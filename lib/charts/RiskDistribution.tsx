"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { RiskDistributionEntry } from "../types";

interface RiskDistributionProps {
  data: RiskDistributionEntry[];
  colors?: Record<string, string>;
  height?: number;
}

const defaultColors: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
  low: "#16a34a",
};

export default function RiskDistribution({
  data,
  colors = defaultColors,
  height = 280,
}: RiskDistributionProps) {
  const chartData = data.map((d) => ({
    name: d.level.charAt(0).toUpperCase() + d.level.slice(1),
    value: d.count,
    percentage: d.percentage,
    level: d.level,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, payload }) => `${name} ${(payload as Record<string, number>)?.percentage ?? ""}%`}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.level}
              fill={colors[entry.level] ?? defaultColors[entry.level]}
              strokeWidth={0}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} students`, `${name}`]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
