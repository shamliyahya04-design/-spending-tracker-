"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { chartColor, formatTick } from "./chart-utils";

interface AreaTrendProps {
  data: { label: string; income: number; expenses: number }[];
  height?: number;
}

export function AreaTrendChart({ data, height = 280 }: AreaTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor("chart-2")} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColor("chart-2")} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor("chart-1")} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColor("chart-1")} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
          opacity={0.5}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickFormatter={formatTick}
          width={48}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke={chartColor("chart-2")}
          strokeWidth={2.5}
          fill="url(#incomeFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke={chartColor("chart-1")}
          strokeWidth={2.5}
          fill="url(#expenseFill)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
