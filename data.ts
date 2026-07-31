import {
  addDays,
  format,
  setHours,
  setMinutes,
  subDays,
  subMonths,
} from "date-fns";

import type {
  Budget,
  Category,
  Goal,
  PaymentMethod,
  RecurrenceFrequency,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "./types";
import { DEFAULT_CATEGORIES } from "./constants";

// ---- Deterministic pseudo-random for reproducible seed data ----
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260731);
const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)] as T;
const between = (min: number, max: number) =>
  Math.round((min + rng() * (max - min)) * 100) / 100;

const EXPENSE_MERCHANTS: Record<string, { merchant: string; min: number; max: number; method: PaymentMethod }[]> = {
  cat_food: [
    { merchant: "Carrefour", min: 25, max: 180, method: "card" },
    { merchant: "Starbucks", min: 4, max: 18, method: "wallet" },
    { merchant: "McDonald's", min: 6, max: 24, method: "card" },
    { merchant: "Local Market", min: 10, max: 60, method: "cash" },
  ],
  cat_transport: [
    { merchant: "Uber", min: 6, max: 42, method: "wallet" },
    { merchant: "Fuel Station", min: 30, max: 90, method: "card" },
    { merchant: "Metro", min: 2, max: 8, method: "wallet" },
  ],
  cat_shopping: [
    { merchant: "Amazon", min: 15, max: 320, method: "card" },
    { merchant: "Zara", min: 40, max: 240, method: "card" },
    { merchant: "IKEA", min: 20, max: 400, method: "card" },
  ],
  cat_bills: [
    { merchant: "Internet Provider", min: 35, max: 70, method: "bank_transfer" },
    { merchant: "Mobile Plan", min: 15, max: 45, method: "bank_transfer" },
  ],
  cat_entertainment: [
    { merchant: "Cinema", min: 12, max: 40, method: "card" },
    { merchant: "Steam", min: 10, max: 60, method: "card" },
    { merchant: "Concert", min: 30, max: 150, method: "card" },
  ],
  cat_health: [
    { merchant: "Pharmacy", min: 8, max: 60, method: "card" },
    { merchant: "Gym Membership", min: 25, max: 80, method: "bank_transfer" },
    { merchant: "Clinic", min: 40, max: 200, method: "card" },
  ],
  cat_education: [
    { merchant: "Udemy", min: 12, max: 80, method: "card" },
    { merchant: "Bookstore", min: 15, max: 90, method: "card" },
  ],
  cat_travel: [
    { merchant: "Booking.com", min: 80, max: 600, method: "card" },
    { merchant: "Airlines", min: 120, max: 800, method: "card" },
  ],
  cat_subscriptions: [
    { merchant: "Netflix", min: 11, max: 16, method: "card" },
    { merchant: "Spotify", min: 6, max: 11, method: "card" },
    { merchant: "iCloud", min: 1, max: 10, method: "card" },
  ],
  cat_rent: [{ merchant: "Landlord", min: 900, max: 900, method: "bank_transfer" }],
  cat_utilities: [
    { merchant: "Electricity Co.", min: 40, max: 140, method: "bank_transfer" },
    { merchant: "Water Authority", min: 12, max: 35, method: "bank_transfer" },
  ],
  cat_other: [
    { merchant: "Misc", min: 5, max: 50, method: "cash" },
  ],
};

const INCOME_MERCHANTS: Record<string, { merchant: string; min: number; max: number; method: PaymentMethod }> = {
  cat_salary: { merchant: "Acme Corp Payroll", min: 3200, max: 3200, method: "bank_transfer" },
  cat_freelance: { merchant: "Upwork Client", min: 250, max: 1800, method: "bank_transfer" },
  cat_investments: { merchant: "Dividend Payout", min: 40, max: 320, method: "bank_transfer" },
  cat_gifts_in: { merchant: "Family", min: 50, max: 300, method: "wallet" },
};

const TAGS_POOL = ["work", "personal", "family", "essential", "lifestyle", "reimbursable", "urgent", "recurring"];
const NOTE_POOL = ["", "", "Weekly groceries", "Project bonus", "Business expense", "Reimburse later", "", ""];

function buildTransaction(
  categoryId: string,
  type: TransactionType,
  date: Date,
  forceStatus: TransactionStatus = "completed"
): Transaction {
  const pool = type === "expense" ? EXPENSE_MERCHANTS[categoryId] : undefined;
  const incomeEntry = INCOME_MERCHANTS[categoryId];

  let merchant: string;
  let amount: number;
  let method: PaymentMethod;

  if (type === "expense" && pool) {
    const entry = pick(pool);
    merchant = entry.merchant;
    amount = between(entry.min, entry.max);
    method = entry.method;
  } else if (incomeEntry) {
    merchant = incomeEntry.merchant;
    amount = between(incomeEntry.min, incomeEntry.max);
    method = incomeEntry.method;
  } else {
    merchant = "Unknown";
    amount = between(10, 100);
    method = "card";
  }

  // Recurring salary/rent/subscriptions
  let recurrence: RecurrenceFrequency = "none";
  if (categoryId === "cat_salary") recurrence = "monthly";
  if (categoryId === "cat_rent") recurrence = "monthly";
  if (categoryId === "cat_subscriptions") recurrence = "monthly";

  const timed = setMinutes(setHours(date, 8 + Math.floor(rng() * 12)), Math.floor(rng() * 60));

  const tagCount = Math.floor(rng() * 3);
  const tags = Array.from({ length: tagCount }, () => pick(TAGS_POOL));

  return {
    id: `tx_${date.getTime()}_${Math.floor(rng() * 1e6)}`,
    type,
    amount: Number(amount.toFixed(2)),
    currency: "USD",
    categoryId,
    date: format(date, "yyyy-MM-dd"),
    time: format(timed, "HH:mm"),
    merchant,
    notes: pick(NOTE_POOL),
    paymentMethod: method,
    tags: Array.from(new Set(tags)),
    status: forceStatus,
    isFavorite: rng() < 0.08,
    recurrence,
    createdAt: date.toISOString(),
  };
}

export function generateTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const today = new Date();
  const start = subMonths(today, 4);

  // Guaranteed recurring income + rent for each month
  for (let m = 0; m <= 4; m++) {
    const monthDate = subMonths(today, 4 - m);
    const salaryDay = Math.min(1, monthDate.getDate()); // 1st of month
    const salaryDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), salaryDay);
    if (salaryDate <= today) {
      transactions.push(buildTransaction("cat_salary", "income", salaryDate));
      transactions.push(buildTransaction("cat_rent", "expense", salaryDate));
    }
  }

  // Randomized transactions across the period
  const days = Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  for (let i = 0; i < days; i++) {
    const day = subDays(today, i);
    const dailyCount = Math.floor(rng() * 4); // 0-3 per day
    for (let j = 0; j < dailyCount; j++) {
      const expenseCategories = DEFAULT_CATEGORIES.filter(
        (c) => c.type === "expense" && c.id !== "cat_rent"
      );
      const cat = pick(expenseCategories);
      transactions.push(buildTransaction(cat.id, "expense", day));
    }
    // Occasional freelance/dividend income
    if (rng() < 0.06) {
      const incomeCats = DEFAULT_CATEGORIES.filter(
        (c) => c.type === "income" && c.id !== "cat_salary"
      );
      transactions.push(buildTransaction(pick(incomeCats).id, "income", day));
    }
  }

  // A few upcoming/pending to show status variety in the current period
  transactions.push(buildTransaction("cat_subscriptions", "expense", addDays(today, 1), "pending"));
  transactions.push(buildTransaction("cat_shopping", "expense", subDays(today, 2), "pending"));

  return transactions.sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
}

export const SEED_CATEGORIES: Category[] = DEFAULT_CATEGORIES.map((c) => ({ ...c }));

export const SEED_BUDGETS: Budget[] = [
  { id: "bud_global", name: "Monthly Overall", amount: 2600, period: "monthly", createdAt: new Date().toISOString() },
  { id: "bud_food", name: "Food & Dining", amount: 600, period: "monthly", categoryId: "cat_food", createdAt: new Date().toISOString() },
  { id: "bud_transport", name: "Transport", amount: 250, period: "monthly", categoryId: "cat_transport", createdAt: new Date().toISOString() },
  { id: "bud_shopping", name: "Shopping", amount: 400, period: "monthly", categoryId: "cat_shopping", createdAt: new Date().toISOString() },
  { id: "bud_entertainment", name: "Entertainment", amount: 150, period: "monthly", categoryId: "cat_entertainment", createdAt: new Date().toISOString() },
];

export const SEED_GOALS: Goal[] = [
  {
    id: "goal_emergency",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 6400,
    deadline: format(subMonths(new Date(), -6), "yyyy-MM-dd"),
    color: "chart-2",
    icon: "ShieldCheck",
    createdAt: new Date().toISOString(),
  },
  {
    id: "goal_travel",
    name: "Japan Trip",
    targetAmount: 5000,
    currentAmount: 1850,
    deadline: format(subMonths(new Date(), -4), "yyyy-MM-dd"),
    color: "chart-5",
    icon: "Plane",
    createdAt: new Date().toISOString(),
  },
  {
    id: "goal_laptop",
    name: "New Laptop",
    targetAmount: 2400,
    currentAmount: 2400,
    deadline: format(subMonths(new Date(), -1), "yyyy-MM-dd"),
    color: "chart-1",
    icon: "Laptop",
    createdAt: new Date().toISOString(),
  },
];

export const SEED_TRANSACTIONS = generateTransactions();
