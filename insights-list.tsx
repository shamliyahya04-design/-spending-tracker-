"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { cn, formatCurrency } from "@/lib/utils";
import { useI18n } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import type { Insight } from "@/lib/calculations";

const TONE_STYLES: Record<Insight["tone"], string> = {
  positive: "bg-positive/10 text-positive",
  negative: "bg-destructive/10 text-destructive",
  neutral: "bg-primary/10 text-primary",
};

export function InsightsList({ insights }: { insights: Insight[] }) {
  const { t } = useI18n();
  const currency = useStore((s) => s.settings.currency);

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-secondary/50"
        >
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              TONE_STYLES[insight.tone]
            )}
          >
            <Icon name={insight.icon} className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="tabular text-sm font-semibold">{insight.title}</p>
            <p className="text-xs text-muted-foreground">
              {t(insight.description)}
            </p>
          </div>
        </motion.div>
      ))}
      <p className="px-2 pt-1 text-[11px] text-muted-foreground/70">
        {formatCurrency(0, currency).replace(/[\d.,]+/, "")} · AI-ready insights
      </p>
    </div>
  );
}
