"use client";

import { Star } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { cn, formatCurrency, relativeDateLabel } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/hooks";
import type { Transaction } from "@/lib/types";

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: () => void;
}

export function TransactionRow({ transaction: tx, onClick }: TransactionRowProps) {
  const { language, t } = useI18n();
  const currency = useStore((s) => s.settings.currency);
  const category = useStore((s) =>
    s.categories.find((c) => c.id === tx.categoryId)
  );

  const isIncome = tx.type === "income";

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-start transition-colors hover:bg-secondary/60"
    >
      <div
        className="relative flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: category
            ? `hsl(var(--${category.color}) / 0.12)`
            : "hsl(var(--secondary))",
          color: category ? `hsl(var(--${category.color}))` : "hsl(var(--muted-foreground))",
        }}
      >
        <Icon name={category?.icon ?? "Circle"} className="size-5" />
        {tx.isFavorite && (
          <Star className="absolute -end-1 -top-1 size-3.5 fill-amber-400 text-amber-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{tx.merchant}</p>
        <p className="truncate text-xs text-muted-foreground">
          {category?.name} · {relativeDateLabel(tx.date, language)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span
          className={cn(
            "tabular text-sm font-semibold",
            isIncome ? "text-positive" : "text-foreground"
          )}
        >
          {formatCurrency(isIncome ? tx.amount : -tx.amount, currency)}
        </span>
        {tx.status !== "completed" && (
          <span className="text-[10px] text-muted-foreground">
            {t(`status.${tx.status}` as never)}
          </span>
        )}
      </div>
    </button>
  );
}
