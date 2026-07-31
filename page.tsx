"use client";

import * as React from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { Plus, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { InsightsList } from "@/components/dashboard/insights-list";
import { ChartCard } from "@/components/charts/chart-card";
import { AreaTrendChart } from "@/components/charts/area-trend";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { CategoryPieChart } from "@/components/charts/category-pie";
import { WeeklyBarChart } from "@/components/charts/weekly-bar";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/hooks";
import { cn, formatCurrency, percentChange } from "@/lib/utils";
import {
  inRange,
  summarize,
  monthlySeries,
  categoryBreakdown,
  weeklySeries,
  budgetStatuses,
  generateInsights,
  type BudgetStatus,
} from "@/lib/calculations";
import type { CurrencyCode } from "@/lib/types";

export default function DashboardPage() {
  const { t } = useI18n();
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const budgets = useStore((s) => s.budgets);
  const currency = useStore((s) => s.settings.currency);

  const [addOpen, setAddOpen] = React.useState(false);

  const now = new Date();

  const monthly = React.useMemo(
    () => monthlySeries(transactions, 6),
    [transactions]
  );

  const thisMonth = React.useMemo(
    () => inRange(transactions, startOfMonth(now), endOfMonth(now)),
    [transactions] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const lastMonth = React.useMemo(
    () =>
      inRange(
        transactions,
        startOfMonth(subMonths(now, 1)),
        endOfMonth(subMonths(now, 1))
      ),
    [transactions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const thisSummary = summarize(thisMonth);
  const lastSummary = summarize(lastMonth);

  const breakdown = React.useMemo(
    () => categoryBreakdown(thisMonth, categories, currency),
    [thisMonth, categories, currency]
  );

  const weekly = React.useMemo(
    () => weeklySeries(transactions, 8),
    [transactions]
  );

  const budgets_ = React.useMemo(
    () => budgetStatuses(budgets, transactions, currency),
    [budgets, transactions, currency]
  );

  const insights = React.useMemo(
    () => generateInsights(thisMonth, categories, currency),
    [thisMonth, categories, currency]
  );

  const recent = transactions.slice(0, 6);

  // Sparkline series per summary card
  const sparkIncome = monthly.map((m) => m.income);
  const sparkExpenses = monthly.map((m) => m.expenses);
  const sparkBalance = monthly.map((m) => m.net);
  const sparkSavings = monthly.map((m) => Math.max(0, m.net));

  // Budget remaining for the global (monthly) budget
  const globalBudget = budgets_.find((b) => !b.budget.categoryId);
  const budgetRemaining = globalBudget
    ? Math.max(0, globalBudget.budget.amount - globalBudget.spent)
    : 0;
  const budgetChange = percentChange(thisSummary.expenses, lastSummary.expenses);

  return (
    <>
      <PageHeader title={t("dashboard.overview")} description={t("dashboard.subtitle")}>
        <Button variant="gradient" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">{t("transactions.add")}</span>
        </Button>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label={t("summary.balance")}
          value={thisSummary.balance}
          currency={currency}
          icon="Wallet"
          color="chart-1"
          change={percentChange(thisSummary.balance, lastSummary.balance)}
          spark={sparkBalance}
          delay={0}
        />
        <SummaryCard
          label={t("summary.income")}
          value={thisSummary.income}
          currency={currency}
          icon="ArrowDownToLine"
          color="chart-2"
          change={percentChange(thisSummary.income, lastSummary.income)}
          spark={sparkIncome}
          delay={0.05}
        />
        <SummaryCard
          label={t("summary.expenses")}
          value={thisSummary.expenses}
          currency={currency}
          icon="ArrowUpFromLine"
          color="chart-6"
          change={budgetChange}
          spark={sparkExpenses}
          delay={0.1}
        />
        <SummaryCard
          label={t("summary.savings")}
          value={thisSummary.savings}
          currency={currency}
          icon="PiggyBank"
          color="chart-4"
          change={percentChange(thisSummary.savings, lastSummary.savings)}
          spark={sparkSavings}
          delay={0.15}
        />
        <SummaryCard
          label={t("summary.budgetRemaining")}
          value={budgetRemaining}
          currency={currency}
          icon="Gauge"
          color="chart-3"
          change={globalBudget ? 100 - globalBudget.percentage : null}
          spark={sparkExpenses.map((v) => -v)}
          delay={0.2}
        />
      </div>

      {/* Main charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title={t("dashboard.spendingTrend")}
          description={t("dashboard.incomeVsExpense")}
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[hsl(var(--chart-2))]" />
                {t("transactions.income")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[hsl(var(--chart-1))]" />
                {t("transactions.expense")}
              </span>
            </div>
          }
        >
          <AreaTrendChart data={monthly} />
        </ChartCard>

        <ChartCard title={t("dashboard.categoryBreakdown")} description={t("dashboard.subtitle")}>
          {breakdown.length === 0 ? (
            <EmptyState icon="PieChart" title={t("transactions.empty")} />
          ) : (
            <>
              <CategoryPieChart
                data={breakdown.slice(0, 6).map((b) => ({
                  name: b.category.name,
                  value: b.total,
                  color: b.category.color,
                }))}
              />
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {breakdown.slice(0, 6).map((b) => (
                  <div key={b.category.id} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: `hsl(var(--${b.category.color}))` }}
                    />
                    <span className="truncate text-muted-foreground">
                      {b.category.name}
                    </span>
                    <span className="ms-auto tabular font-medium">
                      {b.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Secondary row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title={t("dashboard.weeklySpending")}>
          <WeeklyBarChart data={weekly} />
        </ChartCard>

        <ChartCard title={t("dashboard.budgetProgress")} action={<BudgetBadge />}>
          <div className="space-y-3 pt-1">
            {budgets_.slice(0, 4).map((b) => (
              <BudgetProgressRow key={b.budget.id} status={b} currency={currency} />
            ))}
            {budgets_.length === 0 && (
              <EmptyState
                icon="Wallet"
                title={t("budgets.empty")}
                description={t("budgets.emptyHint")}
              />
            )}
          </div>
        </ChartCard>

        <ChartCard title={t("dashboard.insights")} description="✨ AI-ready">
          <InsightsList insights={insights} />
        </ChartCard>
      </div>

      {/* Recent transactions + income/expense bars */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title={t("dashboard.recentTransactions")}
          className="lg:col-span-2"
          contentClassName="pt-2"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/transactions">
                {t("dashboard.viewAll")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          }
        >
          {recent.length === 0 ? (
            <EmptyState
              icon="Receipt"
              title={t("transactions.empty")}
              description={t("transactions.emptyHint")}
            />
          ) : (
            <div className="divide-y divide-border/50">
              {recent.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title={t("dashboard.cashFlow")} description={t("dashboard.incomeVsExpense")}>
          <IncomeExpenseChart data={monthly} height={240} />
        </ChartCard>
      </div>

      <TransactionDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function BudgetBadge() {
  const { t } = useI18n();
  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
      {t("budgets.monthly")}
    </span>
  );
}

function BudgetProgressRow({
  status,
  currency,
}: {
  status: BudgetStatus;
  currency: CurrencyCode;
}) {
  const { t } = useI18n();
  const indicatorColor =
    status.status === "exceeded"
      ? "bg-destructive"
      : status.status === "warning"
        ? "bg-amber-500"
        : "bg-positive";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{status.budget.name}</span>
        <span className="tabular text-xs text-muted-foreground">
          {formatCurrency(status.spent, currency)} {t("budgets.of")}{" "}
          {formatCurrency(status.amount, currency)}
        </span>
      </div>
      <Progress
        value={status.percentage}
        indicatorClassName={cn(indicatorColor)}
      />
    </div>
  );
}
