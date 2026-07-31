"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { chartColor, formatTick } from "./chart-utils";

interface IncomeExpenseChartProps {
  data: { label: string; income: number; expenses: number }[];
  height?: number;
}

export function IncomeExpenseChart({ data, height = 280 }: IncomeExpenseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
        barGap={4}
        barCategoryGap="28%"
      >
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
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
        />
        <Bar
          dataKey="income"
          name="Income"
          fill={chartColor("chart-2")}
          radius={[6, 6, 0, 0]}
          maxBarSize={26}
        />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill={chartColor("chart-1")}
          radius={[6, 6, 0, 0]}
          maxBarSize={26}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
