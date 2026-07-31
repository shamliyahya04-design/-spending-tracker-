import type { Category } from "./types";

/**
 * Default category catalog. Stable IDs so transactions reference them reliably.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: "cat_salary", name: "Salary", nameKey: "category.salary", type: "income", icon: "Wallet", color: "chart-2", order: 0, isDefault: true },
  { id: "cat_freelance", name: "Freelance", nameKey: "category.freelance", type: "income", icon: "Laptop", color: "chart-1", order: 1, isDefault: true },
  { id: "cat_investments", name: "Investments", nameKey: "category.investments", type: "income", icon: "TrendingUp", color: "chart-4", order: 2, isDefault: true },
  { id: "cat_gifts_in", name: "Gifts", nameKey: "category.gifts", type: "income", icon: "Gift", color: "chart-3", order: 3, isDefault: true },

  // Expense
  { id: "cat_food", name: "Food", nameKey: "category.food", type: "expense", icon: "UtensilsCrossed", color: "chart-3", order: 10, isDefault: true },
  { id: "cat_transport", name: "Transport", nameKey: "category.transport", type: "expense", icon: "Car", color: "chart-5", order: 11, isDefault: true },
  { id: "cat_shopping", name: "Shopping", nameKey: "category.shopping", type: "expense", icon: "ShoppingBag", color: "chart-1", order: 12, isDefault: true },
  { id: "cat_bills", name: "Bills", nameKey: "category.bills", type: "expense", icon: "FileText", color: "chart-6", order: 13, isDefault: true },
  { id: "cat_entertainment", name: "Entertainment", nameKey: "category.entertainment", type: "expense", icon: "Clapperboard", color: "chart-4", order: 14, isDefault: true },
  { id: "cat_health", name: "Health", nameKey: "category.health", type: "expense", icon: "HeartPulse", color: "chart-6", order: 15, isDefault: true },
  { id: "cat_education", name: "Education", nameKey: "category.education", type: "expense", icon: "GraduationCap", color: "chart-1", order: 16, isDefault: true },
  { id: "cat_travel", name: "Travel", nameKey: "category.travel", type: "expense", icon: "Plane", color: "chart-5", order: 17, isDefault: true },
  { id: "cat_subscriptions", name: "Subscriptions", nameKey: "category.subscriptions", type: "expense", icon: "Repeat", color: "chart-4", order: 18, isDefault: true },
  { id: "cat_rent", name: "Rent", nameKey: "category.rent", type: "expense", icon: "Home", color: "chart-6", order: 19, isDefault: true },
  { id: "cat_utilities", name: "Utilities", nameKey: "category.utilities", type: "expense", icon: "Zap", color: "chart-3", order: 20, isDefault: true },
  { id: "cat_other", name: "Other", nameKey: "category.other", type: "expense", icon: "MoreHorizontal", color: "chart-2", order: 21, isDefault: true },
];

/** Translation keys for category names */
export const CATEGORY_NAMES_AR: Record<string, string> = {
  "category.salary": "الراتب",
  "category.freelance": "العمل الحر",
  "category.investments": "الاستثمارات",
  "category.gifts": "الهدايا",
  "category.food": "الطعام",
  "category.transport": "المواصلات",
  "category.shopping": "التسوّق",
  "category.bills": "الفواتير",
  "category.entertainment": "الترفيه",
  "category.health": "الصحة",
  "category.education": "التعليم",
  "category.travel": "السفر",
  "category.subscriptions": "الاشتراكات",
  "category.rent": "الإيجار",
  "category.utilities": "المرافق",
  "category.other": "أخرى",
};

/** Color palette options for custom categories */
export const CATEGORY_COLORS = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
];

/** Available lucide icons for categories */
export const CATEGORY_ICONS = [
  "Wallet", "Laptop", "TrendingUp", "Gift", "UtensilsCrossed", "Car",
  "ShoppingBag", "FileText", "Clapperboard", "HeartPulse", "GraduationCap",
  "Plane", "Repeat", "Home", "Zap", "MoreHorizontal", "Coffee", "Dumbbell",
  "BookOpen", "Smartphone", "Gamepad2", "Pizza", "Baby", "Palette",
];
