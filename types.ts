/**
 * Domain types for the Spending Tracker.
 * Single source of truth for all entities. Business logic depends only on these.
 */

export type TransactionType = "income" | "expense";

export type TransactionStatus = "completed" | "pending" | "failed";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "wallet"
  | "crypto"
  | "other";

export type RecurrenceFrequency =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Category {
  id: string;
  name: string;
  /** Translation key, falls back to name */
  nameKey?: string;
  type: TransactionType;
  icon: string; // lucide icon name
  color: string; // tailwind/hsl chart token, e.g. "chart-1"
  /** Sort order for manual reordering */
  order: number;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  /** ISO date string (yyyy-MM-dd) */
  date: string;
  /** ISO time string (HH:mm) */
  time: string;
  merchant: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  /** Receipt attachment URL (mock) */
  attachment?: string;
  status: TransactionStatus;
  isFavorite?: boolean;
  /** Recurrence metadata */
  recurrence: RecurrenceFrequency;
  recurringParentId?: string;
  createdAt: string;
}

export type BudgetPeriod = "weekly" | "monthly";

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: BudgetPeriod;
  /** Optional category scope. Global budget if undefined. */
  categoryId?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  /** ISO date string (yyyy-MM-dd) */
  deadline?: string;
  color: string;
  icon: string;
  createdAt: string;
}

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "SAR"
  | "AED"
  | "YER"
  | "JPY";

export type Language = "en" | "ar";

export type ThemeMode = "light" | "dark" | "system";

export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

export interface AppNotification {
  id: string;
  type: "budget_exceeded" | "upcoming_recurring" | "report_ready" | "milestone";
  titleKey: string;
  description: string;
  read: boolean;
  createdAt: string;
}

export interface Settings {
  currency: CurrencyCode;
  language: Language;
  dateFormat: DateFormat;
  notifications: {
    budgetAlerts: boolean;
    recurringReminders: boolean;
    monthlyReport: boolean;
  };
}

/** Derived analytics shape */
export interface CategoryTotal {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}

export interface PeriodSummary {
  income: number;
  expenses: number;
  balance: number;
  savings: number;
  savingsRate: number;
  transactionCount: number;
}
