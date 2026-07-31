import * as React from "react";
import { cn, clamp } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  indicatorClassName?: string;
  /** Show animated gradient shine */
  shine?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, indicatorClassName, shine, ...props }, ref) => {
    const pct = clamp((value / max) * 100, 0, 100);
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            indicatorClassName
          )}
          style={{ width: `${pct}%` }}
        >
          {shine && (
            <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          )}
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
