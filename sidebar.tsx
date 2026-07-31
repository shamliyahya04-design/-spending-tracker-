"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet2, X } from "lucide-react";

import { NAV_SECTIONS } from "./nav-config";
import { Icon } from "@/components/ui/icon";
import { cn, formatCurrency } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/hooks";
import { summarize, inRange } from "@/lib/calculations";
import { endOfMonth, startOfMonth } from "date-fns";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);

  const now = new Date();
  const monthTx = inRange(
    transactions,
    startOfMonth(now),
    endOfMonth(now)
  );
  const balance = summarize(monthTx).balance;

  const content = (
    <div className="flex h-full flex-col gap-2 p-4">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-xl px-2 py-2"
        onClick={onCloseMobile}
      >
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-glow">
          <Wallet2 className="size-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm font-semibold">
            {t("app.name")}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {t("app.tagline")}
          </span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="mt-3 flex-1 space-y-6 overflow-y-auto no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.titleKey}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {t(section.titleKey)}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-sidebar-accent text-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl ring-1 ring-primary/20"
                          transition={{ type: "spring", damping: 24, stiffness: 300 }}
                        />
                      )}
                      <Icon
                        name={item.icon}
                        className={cn(
                          "relative size-[18px] transition-colors",
                          active && "text-primary"
                        )}
                      />
                      <span className="relative">{t(item.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Balance mini-card */}
      <div className="card-premium rounded-2xl p-4">
        <p className="text-xs text-muted-foreground">{t("summary.balance")}</p>
        <p className="mt-0.5 tabular text-lg font-semibold">
          {formatCurrency(balance, currency)}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {t("dashboard.subtitle")}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-e border-sidebar-border bg-sidebar/50 backdrop-blur-xl lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              className="fixed inset-y-0 start-0 z-50 w-[280px] border-e border-sidebar-border bg-sidebar shadow-elevated lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <button
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="absolute end-3 top-3 z-10 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
              >
                <X className="size-5" />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
