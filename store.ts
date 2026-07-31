import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type {
  AppNotification,
  Budget,
  Category,
  Goal,
  Settings,
  Transaction,
} from "./types";
import { SEED_BUDGETS, SEED_CATEGORIES, SEED_GOALS, SEED_TRANSACTIONS } from "./data";
import { uid } from "./utils";
import { verifyLicense, type LicenseInfo } from "./license";
import { getDeviceCode } from "./device";

const DEFAULT_SETTINGS: Settings = {
  currency: "USD",
  language: "en",
  dateFormat: "MM/DD/YYYY",
  notifications: {
    budgetAlerts: true,
    recurringReminders: true,
    monthlyReport: true,
  },
};

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: uid("ntf"),
    type: "report_ready",
    titleKey: "Monthly report ready",
    description: "Your June summary is available in Reports.",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uid("ntf"),
    type: "upcoming_recurring",
    titleKey: "Upcoming payment",
    description: "Netflix subscription renews tomorrow.",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uid("ntf"),
    type: "milestone",
    titleKey: "Milestone reached",
    description: "You've reached 64% of your Emergency Fund goal.",
    read: true,
    createdAt: new Date().toISOString(),
  },
];

interface StoreState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  notifications: AppNotification[];
  settings: Settings;
  hasHydrated: boolean;

  // licensing
  licenseKey: string | null;
  trialStartedAt: number | null;

  // lifecycle
  setHasHydrated: (v: boolean) => void;
  resetData: () => void;

  // transactions
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;
  duplicateTransaction: (id: string) => void;
  toggleFavorite: (id: string) => void;

  // categories
  addCategory: (cat: Omit<Category, "id" | "order">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (ids: string[]) => void;

  // budgets
  addBudget: (budget: Omit<Budget, "id" | "createdAt">) => void;
  updateBudget: (id: string, patch: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // goals
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  // settings & notifications
  updateSettings: (patch: Partial<Settings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // licensing
  activateLicense: (key: string) => Promise<LicenseInfo>;
  deactivate: () => void;
  ensureTrial: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      transactions: SEED_TRANSACTIONS,
      categories: SEED_CATEGORIES,
      budgets: SEED_BUDGETS,
      goals: SEED_GOALS,
      notifications: SEED_NOTIFICATIONS,
      settings: DEFAULT_SETTINGS,
      hasHydrated: false,
      licenseKey: null,
      trialStartedAt: null,

      setHasHydrated: (v) => set({ hasHydrated: v }),
      resetData: () =>
        set({
          transactions: SEED_TRANSACTIONS,
          categories: SEED_CATEGORIES,
          budgets: SEED_BUDGETS,
          goals: SEED_GOALS,
          notifications: SEED_NOTIFICATIONS,
          settings: DEFAULT_SETTINGS,
          licenseKey: null,
          trialStartedAt: null,
        }),

      addTransaction: (tx) =>
        set((s) => ({
          transactions: [
            { ...tx, id: uid("tx"), createdAt: new Date().toISOString() },
            ...s.transactions,
          ],
        })),
      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        })),
      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        })),
      deleteTransactions: (ids) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => !ids.includes(t.id)),
        })),
      duplicateTransaction: (id) =>
        set((s) => {
          const orig = s.transactions.find((t) => t.id === id);
          if (!orig) return s;
          return {
            transactions: [
              {
                ...orig,
                id: uid("tx"),
                createdAt: new Date().toISOString(),
                merchant: `${orig.merchant} (copy)`,
              },
              ...s.transactions,
            ],
          };
        }),
      toggleFavorite: (id) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
          ),
        })),

      addCategory: (cat) =>
        set((s) => {
          const sameType = s.categories.filter((c) => c.type === cat.type);
          const order = Math.max(0, ...sameType.map((c) => c.order)) + 1;
          return {
            categories: [...s.categories, { ...cat, id: uid("cat"), order }],
          };
        }),
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => !(c.id === id && !c.isDefault)),
        })),
      reorderCategories: (ids) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            const idx = ids.indexOf(c.id);
            return idx === -1 ? c : { ...c, order: idx };
          }),
        })),

      addBudget: (budget) =>
        set((s) => ({
          budgets: [
            ...s.budgets,
            { ...budget, id: uid("bud"), createdAt: new Date().toISOString() },
          ],
        })),
      updateBudget: (id, patch) =>
        set((s) => ({
          budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      deleteBudget: (id) =>
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      addGoal: (goal) =>
        set((s) => ({
          goals: [
            ...s.goals,
            { ...goal, id: uid("goal"), createdAt: new Date().toISOString() },
          ],
        })),
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      contributeToGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) }
              : g
          ),
        })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      activateLicense: async (key) => {
        const deviceCode = await getDeviceCode();
        const info = verifyLicense(key, deviceCode);
        if (info.valid) {
          set({ licenseKey: key.trim() });
        }
        return info;
      },
      deactivate: () => set({ licenseKey: null }),
      ensureTrial: () =>
        set((s) => {
          if (s.trialStartedAt || s.licenseKey) return s;
          return { trialStartedAt: Date.now() };
        }),
    }),
    {
      name: "spending-tracker-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        goals: state.goals,
        notifications: state.notifications,
        settings: state.settings,
        licenseKey: state.licenseKey,
        trialStartedAt: state.trialStartedAt,
      }),
    }
  )
);
