import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

import type {
  Budget,
  Category,
  CategoryTotal,
  CurrencyCode,
  PeriodSummary,
  Transaction,
} from "./types";
import { convertFromUSD } from "./currencies";

/** Filter transactions to a [start, end] date interval (inclusive). */
export function inRange(
  txs: Transaction[],
  start: string | Date,
  end: string | Date
): Transaction[] {
  const s = typeof start === "string" ? parseISO(start) : start;
  const e = typeof end === "string" ? parseISO(end) : end;
  return txs.filter((t) => {
    const d = parseISO(t.date);
    return isWithinInterval(d, { start: s, end: e });
  });
}

export function summarize(txs: Transaction[]): PeriodSummary {
  let income = 0;
  let expenses = 0;
  for (const t of txs) {
    if (t.status === "failed") continue;
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  const balance = income - expenses;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;
  return {
    income,
    expenses,
    balance,
    savings: balance,
    savingsRate,
    transactionCount: txs.length,
  };
}

/** Break down expenses by category for a set of transactions. */
export function categoryBreakdown(
  txs: Transaction[],
  categories: Category[],
  currency: CurrencyCode
): CategoryTotal[] {
  const map = new Map<string, { total: number; count: number }>();
  let grand = 0;

  for (const t of txs) {
    if (t.type !== "expense" || t.status === "failed") continue;
    const usd = t.amount;
    const entry = map.get(t.categoryId) ?? { total: 0, count: 0 };
    entry.total += usd;
    entry.count += 1;
    grand += usd;
    map.set(t.categoryId, entry);
  }

  const totals: CategoryTotal[] = [];
  for (const [categoryId, data] of map) {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) continue;
    totals.push({
      category,
      total: convertFromUSD(data.total, currency),
      percentage: grand > 0 ? (data.total / grand) * 100 : 0,
      count: data.count,
    });
  }

  return totals.sort((a, b) => b.total - a.total);
}

/** Monthly series of income vs expenses for the last N months. */
export function monthlySeries(txs: Transaction[], months = 6) {
  const now = new Date();
  const start = startOfMonth(subMonths(now, months - 1));
  const buckets = eachMonthOfInterval({ start, end: endOfMonth(now) });

  return buckets.map((bucket) => {
    const start_ = startOfMonth(bucket);
    const end_ = endOfMonth(bucket);
    let income = 0;
    let expenses = 0;
    for (const t of txs) {
      const d = parseISO(t.date);
      if (isWithinInterval(d, { start: start_, end: end_ })) {
        if (t.status === "failed") continue;
        if (t.type === "income") income += t.amount;
        else expenses += t.amount;
      }
    }
    return {
      label: format(bucket, "MMM"),
      month: format(bucket, "yyyy-MM"),
      income: Number(income.toFixed(2)),
      expenses: Number(expenses.toFixed(2)),
      net: Number((income - expenses).toFixed(2)),
    };
  });
}

/** Weekly spending for the last N weeks. */
export function weeklySeries(txs: Transaction[], weeks = 8) {
  const now = new Date();
  const start = startOfWeek(subMonths(now, 1), { weekStartsOn: 1 });
  const buckets = eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 }).slice(-weeks);

  return buckets.map((bucket) => {
    const start_ = bucket;
    const end_ = endOfWeek(bucket, { weekStartsOn: 1 });
    let total = 0;
    for (const t of txs) {
      const d = parseISO(t.date);
      if (
        t.type === "expense" &&
        t.status !== "failed" &&
        isWithinInterval(d, { start: start_, end: end_ })
      ) {
        total += t.amount;
      }
    }
    return {
      label: format(bucket, "d MMM"),
      value: Number(total.toFixed(2)),
    };
  });
}

/** Daily spending for the current month — used by the calendar & sparkline. */
export function dailySeries(txs: Transaction[], from: Date, to: Date) {
  const days = eachDayOfInterval({ start: from, end: to });
  return days.map((day) => {
    let expenses = 0;
    let income = 0;
    for (const t of txs) {
      const d = parseISO(t.date);
      if (isWithinInterval(d, { start: day, end: day })) {
        if (t.status === "failed") continue;
        if (t.type === "expense") expenses += t.amount;
        else income += t.amount;
      }
    }
    return {
      date: format(day, "yyyy-MM-dd"),
      label: format(day, "d"),
      expenses: Number(expenses.toFixed(2)),
      income: Number(income.toFixed(2)),
    };
  });
}

/** Map daily spending for calendar quick-lookup. */
export function spendingByDay(
  txs: Transaction[]
): Record<string, { expenses: number; income: number; count: number }> {
  const map: Record<string, { expenses: number; income: number; count: number }> = {};
  for (const t of txs) {
    if (t.status === "failed") continue;
    const entry = map[t.date] ?? { expenses: 0, income: 0, count: 0 };
    if (t.type === "expense") entry.expenses += t.amount;
    else entry.income += t.amount;
    entry.count += 1;
    map[t.date] = entry;
  }
  return map;
}

export interface BudgetStatus {
  budget: Budget;
  /** Budget amount converted to the display currency */
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "onTrack" | "warning" | "exceeded";
}

/** Compute current-period spending against each budget. */
export function budgetStatuses(
  budgets: Budget[],
  txs: Transaction[],
  currency: CurrencyCode
): BudgetStatus[] {
  const now = new Date();

  return budgets.map((budget) => {
    const periodStart = budget.period === "weekly"
      ? startOfWeek(now, { weekStartsOn: 1 })
      : startOfMonth(now);
    const periodEnd = budget.period === "weekly"
      ? endOfWeek(now, { weekStartsOn: 1 })
      : endOfMonth(now);

    const relevant = txs.filter((t) => {
      if (t.type !== "expense" || t.status === "failed") return false;
      const d = parseISO(t.date);
      if (!isWithinInterval(d, { start: periodStart, end: periodEnd })) return false;
      if (budget.categoryId && t.categoryId !== budget.categoryId) return false;
      return true;
    });

    const amount = convertFromUSD(budget.amount, currency);
    const spent = convertFromUSD(
      relevant.reduce((sum, t) => sum + t.amount, 0),
      currency
    );
    const remaining = amount - spent;
    const percentage = amount > 0 ? (spent / amount) * 100 : 0;
    const status: BudgetStatus["status"] =
      percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "onTrack";

    return { budget, amount, spent, remaining, percentage, status };
  });
}

export interface Insight {
  icon: string;
  tone: "positive" | "negative" | "neutral";
  title: string;
  description: string;
}

export function generateInsights(
  txs: Transaction[],
  categories: Category[],
  currency: CurrencyCode
): Insight[] {
  const now = new Date();
  const thisMonth = inRange(txs, startOfMonth(now), endOfMonth(now));
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const lastMonth = inRange(txs, lastMonthStart, lastMonthEnd);

  const thisSummary = summarize(thisMonth);
  const lastSummary = summarize(lastMonth);
  const breakdown = categoryBreakdown(thisMonth, categories, currency);
  const insights: Insight[] = [];

  // Highest category
  if (breakdown.length > 0) {
    const top = breakdown[0]!;
    insights.push({
      icon: "Trophy",
      tone: "neutral",
      title: `${top.category.name}: ${top.percentage.toFixed(0)}%`,
      description: "insight.highestCategory",
    });
  }

  // Average daily spending
  const dayCount = Math.max(
    1,
    eachDayOfInterval({ start: startOfMonth(now), end: now }).length
  );
  const avgDaily = convertFromUSD(thisSummary.expenses / dayCount, currency);
  insights.push({
    icon: "CalendarDays",
    tone: "neutral",
    title: avgDaily.toFixed(0),
    description: "insight.avgDaily",
  });

  // MoM change
  const mom = lastSummary.expenses > 0
    ? ((thisSummary.expenses - lastSummary.expenses) / lastSummary.expenses) * 100
    : 0;
  insights.push({
    icon: mom <= 0 ? "TrendingDown" : "TrendingUp",
    tone: mom <= 0 ? "positive" : "negative",
    title: `${Math.abs(mom).toFixed(0)}%`,
    description: mom <= 0 ? "insight.spendingDown" : "insight.spendingUp",
  });

  // Savings opportunity: second highest category
  if (breakdown.length > 1) {
    insights.push({
      icon: "PiggyBank",
      tone: "positive",
      title: breakdown[1]!.category.name,
      description: "insight.saveMore",
    });
  }

  return insights;
}

/** Upcoming recurring transactions in the next N days. */
export function upcomingRecurring(txs: Transaction[], days = 7) {
  const now = new Date();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + days);
  return txs
    .filter((t) => t.recurrence !== "none")
    .filter((t) => {
      const d = parseISO(t.date);
      return isAfter(d, now) || isBefore(d, subMonths(now, 1));
    })
    .slice(0, 5);
}
