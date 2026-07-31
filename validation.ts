import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.enum(["USD", "EUR", "GBP", "SAR", "AED", "YER", "JPY"]),
  categoryId: z.string().min(1, "Select a category"),
  date: z.string().min(1, "Required"),
  time: z.string().min(1, "Required"),
  merchant: z.string().min(1, "Required").max(80),
  notes: z.string().max(280).optional().or(z.literal("")),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "wallet", "crypto", "other"]),
  tags: z.string().optional().or(z.literal("")),
  status: z.enum(["completed", "pending", "failed"]),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "quarterly", "yearly"]),
  isFavorite: z.boolean().optional(),
});
export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const budgetSchema = z.object({
  name: z.string().min(1, "Required").max(40),
  amount: z.coerce.number().positive("Must be greater than 0"),
  period: z.enum(["weekly", "monthly"]),
  categoryId: z.string().optional(),
});
export type BudgetFormValues = z.infer<typeof budgetSchema>;

export const goalSchema = z.object({
  name: z.string().min(1, "Required").max(40),
  targetAmount: z.coerce.number().positive("Must be greater than 0"),
  deadline: z.string().optional(),
  color: z.string().min(1),
  icon: z.string().min(1),
});
export type GoalFormValues = z.infer<typeof goalSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Required").max(30),
  type: z.enum(["income", "expense"]),
  icon: z.string().min(1),
  color: z.string().min(1),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;
