"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { chartColor } from "./chart-utils";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color?: string; // chart token
  className?: string;
  height?: number;
}

/** Tiny inline trend chart used inside summary cards. */
export function Sparkline({
  data,
  color = "chart-1",
  className,
  height = 40,
}: SparklineProps) {
  const chartData = data.map((value, i) => ({ i, value }));
  const stroke = chartColor(color);
  const id = `spark-${color}-${data.length}`;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
