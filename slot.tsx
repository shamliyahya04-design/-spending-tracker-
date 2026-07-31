/**
 * Minimal Slot implementation (Radix-free) to support asChild composition.
 * Clones the single child element and merges props/class names.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) {
      return null;
    }
    const childProps = children.props as Record<string, unknown>;
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      ...mergeProps(props, childProps),
      className: cn(
        props.className,
        childProps.className as string | undefined
      ),
      ref,
    });
  }
);
Slot.displayName = "Slot";

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...childProps };
  for (const key in slotProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (key === "style") {
      merged[key] = { ...(childValue as object), ...(slotValue as object) };
    } else if (
      typeof slotValue === "function" &&
      typeof childValue === "function"
    ) {
      // chain event handlers
      merged[key] = (...args: unknown[]) => {
        childValue(...args);
        slotValue(...args);
      };
    } else if (childValue === undefined) {
      merged[key] = slotValue;
    }
  }
  return merged;
}
