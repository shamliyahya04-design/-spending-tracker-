import * as React from "react";
import {
  icons,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps extends LucideProps {
  name: string;
}

/**
 * Dynamic Lucide icon renderer. Looks up an icon by name from the full set.
 * Falls back to a circle if the name is not found.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, className, ...props }, ref) => {
    const LucideIcon = (icons as Record<string, React.FC<LucideProps>>)[name];
    if (!LucideIcon) {
      return (
        <svg
          ref={ref}
          viewBox="0 0 24 24"
          className={cn("size-4", className)}
          {...props}
        >
          <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2" />
        </svg>
      );
    }
    return <LucideIcon ref={ref} className={cn("size-4", className)} {...props} />;
  }
);
Icon.displayName = "Icon";
