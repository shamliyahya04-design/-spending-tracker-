"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/hooks";
import { todayISO, cn } from "@/lib/utils";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/lib/validation";
import { PAYMENT_METHODS, RECURRENCE_OPTIONS } from "@/lib/form-options";
import type { Transaction } from "@/lib/types";

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export function TransactionDialog({
  open,
  onClose,
  transaction,
}: TransactionDialogProps) {
  const { t } = useI18n();
  const categories = useStore((s) => s.categories);
  const currency = useStore((s) => s.settings.currency);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);

  const isEdit = Boolean(transaction);

  const defaultValues: TransactionFormValues = React.useMemo(
    () => ({
      type: transaction?.type ?? "expense",
      amount: transaction?.amount ?? 0,
      currency: transaction?.currency ?? currency,
      categoryId: transaction?.categoryId ?? "",
      date: transaction?.date ?? todayISO(),
      time: transaction?.time ?? "12:00",
      merchant: transaction?.merchant ?? "",
      notes: transaction?.notes ?? "",
      paymentMethod: transaction?.paymentMethod ?? "card",
      tags: transaction?.tags.join(", ") ?? "",
      status: transaction?.status ?? "completed",
      recurrence: transaction?.recurrence ?? "none",
      isFavorite: transaction?.isFavorite ?? false,
    }),
    [transaction, currency]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, defaultValues, reset]);

  const type = watch("type");
  const isFavorite = watch("isFavorite");

  const onSubmit = (values: TransactionFormValues) => {
    const payload = {
      ...values,
      tags: values.tags
        ? values.tags.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      notes: values.notes || undefined,
    };
    if (isEdit && transaction) {
      updateTransaction(transaction.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? t("transactions.edit") : t("transactions.add")}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
          {(["expense", "income"] as const).map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => {
                setValue("type", tp);
                setValue("categoryId", "");
              }}
              className={cn(
                "rounded-lg py-2 text-sm font-medium transition-all",
                type === tp
                  ? tp === "income"
                    ? "bg-positive text-positive-foreground shadow-soft"
                    : "bg-destructive text-destructive-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(tp === "income" ? "transactions.income" : "transactions.expense")}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("field.amount")} error={errors.amount?.message}>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                {...register("amount")}
                className="ps-3 pe-12 text-lg font-semibold"
                placeholder="0.00"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                {currency}
              </span>
            </div>
          </Field>

          <Field label={t("field.category")} error={errors.categoryId?.message}>
            <Select {...register("categoryId")}>
              <option value="">{t("transactions.allCategories")}</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("field.date")} error={errors.date?.message}>
            <Input type="date" {...register("date")} />
          </Field>

          <Field label={t("field.time")} error={errors.time?.message}>
            <Input type="time" {...register("time")} />
          </Field>

          <Field label={t("field.merchant")} error={errors.merchant?.message}>
            <Input {...register("merchant")} placeholder="e.g. Amazon" />
          </Field>

          <Field label={t("field.paymentMethod")}>
            <Select {...register("paymentMethod")}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {t(m.labelKey)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("field.recurrence")}>
            <Select {...register("recurrence")}>
              {RECURRENCE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.labelKey)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("field.status")}>
            <Select {...register("status")}>
              <option value="completed">{t("status.completed")}</option>
              <option value="pending">{t("status.pending")}</option>
              <option value="failed">{t("status.failed")}</option>
            </Select>
          </Field>
        </div>

        <Field label={t("field.notes")}>
          <Textarea {...register("notes")} placeholder={t("field.notes")} />
        </Field>

        <Field label={t("field.tags")}>
          <Input {...register("tags")} placeholder="work, recurring" />
        </Field>

        {/* Favorite toggle */}
        <button
          type="button"
          onClick={() => setValue("isFavorite", !isFavorite)}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Star
            className={cn(
              "size-4 transition-colors",
              isFavorite && "fill-amber-400 text-amber-400"
            )}
          />
          {t("transactions.favorite")}
        </button>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            {isEdit ? t("common.saveChanges") : t("common.add")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
