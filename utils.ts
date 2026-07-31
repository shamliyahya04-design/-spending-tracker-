import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  addDays,
  differenceInCalendarMonths,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfWeek,
} from "date-fns";
import { arSA, enUS } from "date-fns/locale";

import type { CurrencyCode, DateFormat, Language } from "./types";
import { getCurrency } from "./currencies";

/** Tailwind class merge helper */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number as currency in the user's locale */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode,
  options?: { compact?: boolean; showSign?: boolean; hideSymbol?: boolean }
): string {
  const meta = getCurrency(currencyCode);
  const compact = options?.compact ?? false;
  const showSign = options?.showSign ?? false;

  const abs = Math.abs(amount);
  let formatted: string;

  if (compact && abs >= 1000) {
    const compactValue = new Intl.NumberFormat(meta.locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(abs);
    formatted = compactValue;
  } else {
    formatted = new Intl.NumberFormat(meta.locale, {
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
    }).format(abs);
  }

  const sign = amount < 0 ? "-" : showSign && amount > 0 ? "+" : "";
  const symbol = options?.hideSymbol ? "" : `${meta.symbol} `;

  return `${sign}${symbol}${formatted}`;
}

/** Format a signed amount (income/expense aware) */
export function formatSignedCurrency(
  amount: number,
  currencyCode: CurrencyCode
): string {
  return formatCurrency(amount, currencyCode, { showSign: true });
}

const DATE_FORMAT_MAP: Record<DateFormat, string> = {
  "MM/DD/YYYY": "MM/dd/yyyy",
  "DD/MM/YYYY": "dd/MM/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
};

export function formatDate(
  dateInput: string | Date,
  formatStr: DateFormat | string,
  language: Language = "en"
): string {
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  const pattern =
    formatStr in DATE_FORMAT_MAP
      ? DATE_FORMAT_MAP[formatStr as DateFormat]
      : formatStr;
  const locale = language === "ar" ? arSA : enUS;
  return format(date, pattern, { locale });
}

export function formatTime(time: string, language: Language = "en"): string {
  // time is "HH:mm"
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h ?? 0, m ?? 0, 0, 0);
  return format(date, language === "ar" ? "h:mm a" : "h:mm a", {
    locale: language === "ar" ? arSA : enUS,
  });
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Compact, human-friendly relative date label */
export function relativeDateLabel(
  dateInput: string,
  language: Language = "en"
): string {
  const date = parseISO(dateInput);
  const now = new Date();
  const locale = language === "ar" ? arSA : enUS;

  if (isSameDay(date, now)) {
    return language === "ar" ? "اليوم" : "Today";
  }
  if (isSameDay(date, addDays(now, -1))) {
    return language === "ar" ? "أمس" : "Yesterday";
  }
  if (isSameMonth(date, now)) {
    return format(date, "d MMM", { locale });
  }
  if (differenceInCalendarMonths(now, date) < 12) {
    return format(date, "d MMM", { locale });
  }
  return format(date, "d MMM yyyy", { locale });
}

export function startOfWeekISO(date: Date, language: Language = "en"): string {
  // Saturday start for Arabic locale (common in MENA), Sunday/Monday otherwise
  const weekStartsOn = language === "ar" ? 6 : 1;
  return toISODate(startOfWeek(date, { weekStartsOn }));
}

/** Percentage change helper: returns signed number or null when undefined */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

/** Generate an array of n evenly spaced sparkline values (deterministic-ish) */
export function sparklineValues(seed: number, n = 12, base = 100): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    const r = Math.sin(seed * (i + 1) * 1.7) * 0.5 + Math.cos(seed + i) * 0.5;
    v = Math.max(base * 0.3, v + r * base * 0.18);
    out.push(Number(v.toFixed(2)));
  }
  return out;
}

/** Export array of objects to CSV and trigger download */
export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const escape = (val: unknown) => {
    const s = String(val ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");
  downloadFile(filename, csv, "text/csv;charset=utf-8;");
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export to an .xls file (HTML table) that Excel/LibreOffice open natively. */
export function exportToExcel(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const escape = (val: unknown) =>
    String(val ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((h) => `<td>${escape(row[h])}</td>`)
          .join("")}</tr>`
    )
    .join("");
  const html = `<table border="1">${headers
    .map((h) => `<th>${escape(h)}</th>`)
    .join("")}${body}</table>`;
  downloadFile(filename, html, "application/vnd.ms-excel");
}

export function initials(text: string): string {
  return text
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
