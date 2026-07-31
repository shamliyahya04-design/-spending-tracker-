"use client";

import { motion } from "framer-motion";
import { chartColor } from "@/components/charts/chart-utils";
import { clamp } from "@/lib/utils";

interface GoalRingProps {
  percentage: number;
  color: string; // chart token
  size?: number;
  strokeWidth?: number;
}

/** Animated circular progress ring rendered with SVG. */
export function GoalRing({
  percentage,
  color,
  size = 72,
  strokeWidth = 8,
}: GoalRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = clamp(percentage, 0, 100);
  const offset = circumference - (pct / 100) * circumference;
  const stroke = chartColor(color);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="tabular text-sm font-bold">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
