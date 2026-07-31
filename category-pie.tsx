"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { chartColor } from "./chart-utils";

interface CategoryPieProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
}

export function CategoryPieChart({ data, height = 240 }: CategoryPieProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip content={<ChartTooltip />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="62%"
          outerRadius="92%"
          paddingAngle={2}
          stroke="hsl(var(--card))"
          strokeWidth={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={chartColor(entry.color)} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
