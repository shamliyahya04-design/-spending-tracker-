import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "default" | "sm";
}

/** Accessible, premium-styled native select. */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = "default", children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-xl border border-input bg-background/50 text-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "pe-8", // space for chevron
            size === "default" ? "h-10 px-3" : "h-9 px-3 text-xs",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground",
            size === "default" ? "size-4" : "size-3.5"
          )}
        />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
