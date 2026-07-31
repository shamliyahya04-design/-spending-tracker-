"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Trash2,
  Copy,
  Star,
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionDialog } from "./transaction-dialog";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/hooks";
import {
  cn,
  formatCurrency,
  formatDate,
  relativeDateLabel,
  exportToCSV,
  exportToExcel,
} from "@/lib/utils";
import type { Transaction } from "@/lib/types";

type SortKey = "date" | "amount" | "merchant";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

export function TransactionTable({ initialQuery }: { initialQuery?: string }) {
  const { t, language } = useI18n();
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const dateFormat = useStore((s) => s.settings.dateFormat);
  const deleteTransactions = useStore((s) => s.deleteTransactions);
  const duplicateTransaction = useStore((s) => s.duplicateTransaction);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const [search, setSearch] = React.useState(initialQuery ?? "");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [editing, setEditing] = React.useState<Transaction | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (categoryFilter !== "all" && tx.categoryId !== categoryFilter) return false;
      if (!q) return true;
      const cat = categories.find((c) => c.id === tx.categoryId);
      return (
        tx.merchant.toLowerCase().includes(q) ||
        (tx.notes ?? "").toLowerCase().includes(q) ||
        cat?.name.toLowerCase().includes(q) ||
        tx.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        String(tx.amount).includes(q)
      );
    });
  }, [transactions, search, typeFilter, categoryFilter, categories]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "amount") cmp = a.amount - b.amount;
      else if (sortKey === "merchant") cmp = a.merchant.localeCompare(b.merchant);
      else cmp = (a.date + a.time).localeCompare(b.date + b.time);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageItems = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  React.useEffect(() => setPage(1), [search, typeFilter, categoryFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allOnPageSelected =
    pageItems.length > 0 && pageItems.every((tx) => selected.has(tx.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageItems.forEach((tx) => next.delete(tx.id));
      } else {
        pageItems.forEach((tx) => next.add(tx.id));
      }
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    deleteTransactions(Array.from(selected));
    setSelected(new Set());
  };

  const handleExport = (format: "csv" | "excel") => {
    const rows = sorted.map((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId);
      return {
        Date: tx.date,
        Time: tx.time,
        Type: tx.type,
        Merchant: tx.merchant,
        Category: cat?.name ?? "",
        Amount: tx.amount,
        Currency: tx.currency,
        Method: tx.paymentMethod,
        Status: tx.status,
        Notes: tx.notes ?? "",
        Tags: tx.tags.join("; "),
      };
    });
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "csv") exportToCSV(`transactions-${stamp}.csv`, rows);
    else exportToExcel(`transactions-${stamp}.xls`, rows);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setDialogOpen(true);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="size-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3" />
    ) : (
      <ArrowDown className="size-3" />
    );
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("transactions.search")}
              className="ps-9"
            />
          </div>
          <Select
            size="sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="w-auto"
          >
            <option value="all">{t("transactions.allTypes")}</option>
            <option value="income">{t("transactions.income")}</option>
            <option value="expense">{t("transactions.expense")}</option>
          </Select>
          <Select
            size="sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-auto"
          >
            <option value="all">{t("transactions.allCategories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="size-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
            <Download className="size-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-2.5"
          >
            <span className="text-sm font-medium">
              {selected.size} {t("transactions.selected")}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="size-4" />
              {t("transactions.delete")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {sorted.length === 0 ? (
        <EmptyState
          icon="Inbox"
          title={t("transactions.empty")}
          description={t("transactions.emptyHint")}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-start text-xs text-muted-foreground">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAll}
                      className="size-4 rounded border-border accent-primary"
                    />
                  </th>
                  <th className="px-2 py-3 text-start font-medium">
                    <button
                      onClick={() => toggleSort("merchant")}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      {t("transactions.merchant")} <SortIcon k="merchant" />
                    </button>
                  </th>
                  <th className="px-2 py-3 text-start font-medium">
                    {t("transactions.category")}
                  </th>
                  <th className="px-2 py-3 text-start font-medium">
                    <button
                      onClick={() => toggleSort("date")}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      {t("transactions.date")} <SortIcon k="date" />
                    </button>
                  </th>
                  <th className="px-2 py-3 text-end font-medium">
                    <button
                      onClick={() => toggleSort("amount")}
                      className="ms-auto flex items-center gap-1 hover:text-foreground"
                    >
                      {t("transactions.amount")} <SortIcon k="amount" />
                    </button>
                  </th>
                  <th className="w-24 px-4 py-3 text-end font-medium">
                    {t("common.edit")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const isIncome = tx.type === "income";
                  return (
                    <tr
                      key={tx.id}
                      className={cn(
                        "border-b border-border/40 transition-colors hover:bg-secondary/30",
                        selected.has(tx.id) && "bg-primary/[0.03]"
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${tx.merchant}`}
                          checked={selected.has(tx.id)}
                          onChange={() => toggleSelect(tx.id)}
                          className="size-4 rounded border-border accent-primary"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: cat
                                ? `hsl(var(--${cat.color}) / 0.12)`
                                : "hsl(var(--secondary))",
                              color: cat
                                ? `hsl(var(--${cat.color}))`
                                : "hsl(var(--muted-foreground))",
                            }}
                          >
                            <Icon name={cat?.icon ?? "Circle"} className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate font-medium">
                              {tx.merchant}
                              {tx.isFavorite && (
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {tx.notes || t(`method.${tx.paymentMethod}` as never)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        {tx.status !== "completed" ? (
                          <Badge
                            variant={
                              tx.status === "pending" ? "warning" : "destructive"
                            }
                          >
                            {t(`status.${tx.status}` as never)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            {cat?.name}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        <span className="hidden sm:inline">
                          {formatDate(tx.date, dateFormat, language)}
                        </span>
                        <span className="sm:hidden">
                          {relativeDateLabel(tx.date, language)}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-end">
                        <span
                          className={cn(
                            "tabular font-semibold",
                            isIncome ? "text-positive" : "text-foreground"
                          )}
                        >
                          {formatCurrency(
                            isIncome ? tx.amount : -tx.amount,
                            currency
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <RowButton
                            label={t("transactions.favorite")}
                            onClick={() => toggleFavorite(tx.id)}
                          >
                            <Star
                              className={cn(
                                "size-3.5",
                                tx.isFavorite &&
                                  "fill-amber-400 text-amber-400"
                              )}
                            />
                          </RowButton>
                          <RowButton
                            label={t("transactions.duplicate")}
                            onClick={() => duplicateTransaction(tx.id)}
                          >
                            <Copy className="size-3.5" />
                          </RowButton>
                          <RowButton
                            label={t("common.edit")}
                            onClick={() => openEdit(tx)}
                          >
                            <Pencil className="size-3.5" />
                          </RowButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {t("transactions.rowCount", { count: sorted.length })}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={current <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </Button>
              <span className="px-2 text-xs tabular text-muted-foreground">
                {current} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={current >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                ›
              </Button>
            </div>
          </div>
        </div>
      )}

      <TransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        transaction={editing}
      />
    </div>
  );
}

function RowButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </button>
  );
}
