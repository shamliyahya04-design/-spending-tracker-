"use client";

/** Resolve a chart token (e.g. "chart-1" or "primary") to an hsl() color string. */
export function chartColor(token: string): string {
  return `hsl(var(--${token}))`;
}

/** Format a number into a short axis tick (e.g. 1.2k). */
export function formatTick(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return String(value);
}
