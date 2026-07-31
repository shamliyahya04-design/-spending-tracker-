import type { TranslationKey } from "@/lib/i18n";

export interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: string;
}

export interface NavSection {
  titleKey: TranslationKey;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    titleKey: "nav.main",
    items: [
      { href: "/", labelKey: "nav.dashboard", icon: "LayoutDashboard" },
      { href: "/transactions", labelKey: "nav.transactions", icon: "ArrowLeftRight" },
      { href: "/calendar", labelKey: "nav.calendar", icon: "CalendarDays" },
      { href: "/reports", labelKey: "nav.reports", icon: "BarChart3" },
    ],
  },
  {
    titleKey: "nav.tools",
    items: [
      { href: "/budgets", labelKey: "nav.budgets", icon: "Wallet" },
      { href: "/goals", labelKey: "nav.goals", icon: "Target" },
      { href: "/categories", labelKey: "nav.categories", icon: "Tags" },
      { href: "/settings", labelKey: "nav.settings", icon: "Settings" },
    ],
  },
];
