"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/types";

export function LanguageToggle() {
  const language = useStore((s) => s.settings.language);
  const updateSettings = useStore((s) => s.updateSettings);
  const { t } = useI18n();

  const next: Language = language === "en" ? "ar" : "en";

  return (
    <button
      onClick={() => updateSettings({ language: next })}
      aria-label={t("action.toggleLang")}
      title={language === "en" ? "العربية" : "English"}
      className="flex items-center gap-1.5 rounded-xl border border-border bg-background/50 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary"
    >
      <Languages className="size-4 text-muted-foreground" />
      <span className={cn(language === "ar" && "font-arabic")}>
        {language === "en" ? "ع" : "EN"}
      </span>
    </button>
  );
}
