"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/hooks";

const OPTIONS = [
  { value: "light", icon: Sun, labelKey: "settings.theme.light" as const },
  { value: "dark", icon: Moon, labelKey: "settings.theme.dark" as const },
  { value: "system", icon: Monitor, labelKey: "settings.theme.system" as const },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div
      className="flex items-center gap-0.5 rounded-xl border border-border bg-background/50 p-0.5"
      role="radiogroup"
      aria-label={t("action.toggleTheme")}
    >
      {OPTIONS.map((opt) => {
        const active = mounted && theme === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            title={t(opt.labelKey)}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
