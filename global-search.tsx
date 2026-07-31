"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/hooks";
import { cn, formatCurrency, relativeDateLabel } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export function GlobalSearch() {
  const router = useRouter();
  const { t, language } = useI18n();
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return transactions
      .filter((tx) => {
        const cat = categories.find((c) => c.id === tx.categoryId);
        return (
          tx.merchant.toLowerCase().includes(q) ||
          (tx.notes ?? "").toLowerCase().includes(q) ||
          cat?.name.toLowerCase().includes(q) ||
          tx.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          String(tx.amount).includes(q)
        );
      })
      .slice(0, 6);
  }, [query, transactions, categories]);

  React.useEffect(() => setActiveIndex(0), [query]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Keyboard shortcut: ⌘K / Ctrl+K
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const onSelect = (txId: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/transactions?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && results[activeIndex]) {
              onSelect(results[activeIndex]!.id);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={t("common.search")}
          aria-label={t("common.search")}
          className="h-10 w-full rounded-xl border border-border bg-background/50 ps-9 pe-12 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <kbd className="pointer-events-none absolute end-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </div>

      <AnimatePresence>
        {open && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-elevated"
          >
            {results.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t("transactions.empty")}
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto no-scrollbar p-1.5">
                {results.map((tx, i) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  return (
                    <li key={tx.id}>
                      <button
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => onSelect(tx.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors",
                          i === activeIndex ? "bg-secondary" : "hover:bg-secondary/60"
                        )}
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          <Icon name={cat?.icon ?? "Circle"} className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {tx.merchant}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {cat?.name} · {relativeDateLabel(tx.date, language)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 tabular text-sm font-semibold",
                            tx.type === "income" ? "text-positive" : "text-foreground"
                          )}
                        >
                          {formatCurrency(
                            tx.type === "income" ? tx.amount : -tx.amount,
                            currency
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
                <li className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
                  <span>{t("transactions.rowCount", { count: results.length })}</span>
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="size-3" /> Enter
                  </span>
                </li>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
