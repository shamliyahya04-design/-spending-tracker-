"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: number, name?: string) => string;
  labelFormatter?: (label: string) => string;
  className?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-popover/95 px-3 py-2 text-xs shadow-elevated backdrop-blur",
        className
      )}
    >
      {label && (
        <p className="mb-1 font-medium text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ms-auto font-semibold tabular text-foreground">
              {item.value !== undefined && formatter
                ? formatter(item.value, item.name)
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
