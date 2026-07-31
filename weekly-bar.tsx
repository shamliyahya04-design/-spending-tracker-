"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { chartColor } from "./chart-utils";

interface WeeklyBarChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function WeeklyBarChart({ data, height = 260 }: WeeklyBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          dy={6}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.4, radius: 8 }}
        />
        <Bar dataKey="value" name="Spent" radius={[8, 8, 8, 8]} maxBarSize={28}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={chartColor(entry.value >= max ? "chart-1" : "primary")}
              fillOpacity={entry.value >= max ? 1 : 0.55}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
