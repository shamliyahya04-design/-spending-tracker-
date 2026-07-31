"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./lang-toggle";
import { NotificationsMenu } from "./notifications";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onOpenMobileNav: () => void;
  onQuickAdd: () => void;
}

export function Topbar({ onOpenMobileNav, onQuickAdd }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onOpenMobileNav}
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-background/50 text-muted-foreground transition-colors hover:bg-secondary lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex-1">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="gradient"
          onClick={onQuickAdd}
          className="hidden sm:inline-flex"
        >
          + New
        </Button>
        <LanguageToggle />
        <ThemeToggle />
        <NotificationsMenu />
      </div>
    </header>
  );
}
