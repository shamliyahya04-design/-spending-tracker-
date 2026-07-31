"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/hooks";
import { cn, relativeDateLabel } from "@/lib/utils";
import { parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

const TYPE_STYLES: Record<string, string> = {
  budget_exceeded: "bg-destructive/10 text-destructive",
  upcoming_recurring: "bg-amber-500/15 text-amber-500",
  report_ready: "bg-primary/10 text-primary",
  milestone: "bg-positive/10 text-positive",
};

const TYPE_ICONS: Record<string, string> = {
  budget_exceeded: "AlertTriangle",
  upcoming_recurring: "Clock",
  report_ready: "FileBarChart",
  milestone: "Trophy",
};

export function NotificationsMenu() {
  const { t, language } = useI18n();
  const notifications = useStore((s) => s.notifications);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);
  const markRead = useStore((s) => s.markNotificationRead);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("action.notifications")}
        className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-background/50 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-elevated"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">{t("action.notifications")}</span>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Check className="size-3" />
                  {t("action.markAllRead")}
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {t("action.noNotifications")}
                </p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-start transition-colors hover:bg-secondary/50",
                      !n.read && "bg-primary/[0.03]"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                        TYPE_STYLES[n.type]
                      )}
                    >
                      <Bell className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">
                        {n.titleKey}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {n.description}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        {relativeDateLabel(parseISO(n.createdAt).toISOString().slice(0, 10), language)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
