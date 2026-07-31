"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Sparkline } from "@/components/charts/sparkline";
import { cn, formatCurrency } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/types";

interface SummaryCardProps {
  label: string;
  value: number;
  currency: CurrencyCode;
  icon: string;
  color: string; // chart token
  change?: number | null; // percentage
  spark?: number[];
  delay?: number;
}

export function SummaryCard({
  label,
  value,
  currency,
  icon,
  color,
  change,
  spark,
  delay = 0,
}: SummaryCardProps) {
  const positive = (change ?? 0) >= 0;
  const showChange = change !== null && change !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="card-premium group rounded-2xl p-5 transition-shadow hover:shadow-elevated"
    >
      <div className="relative flex items-start justify-between">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `hsl(var(--${color}) / 0.12)`, color: `hsl(var(--${color}))` }}
        >
          <Icon name={icon} className="size-5" />
        </div>
        {showChange && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              positive
                ? "bg-positive/10 text-positive"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {Math.abs(change!).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 tabular text-2xl font-semibold tracking-tight">
          {formatCurrency(value, currency)}
        </p>
      </div>

      {spark && spark.length > 1 && (
        <div className="relative mt-3 -mb-1">
          <Sparkline data={spark} color={color} height={36} />
        </div>
      )}
    </motion.div>
  );
}
