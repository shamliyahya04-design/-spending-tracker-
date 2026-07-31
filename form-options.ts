import type { PaymentMethod, RecurrenceFrequency } from "./types";
import type { TranslationKey } from "./i18n";

export const PAYMENT_METHODS: { value: PaymentMethod; labelKey: TranslationKey }[] = [
  { value: "card", labelKey: "method.card" },
  { value: "cash", labelKey: "method.cash" },
  { value: "bank_transfer", labelKey: "method.bank_transfer" },
  { value: "wallet", labelKey: "method.wallet" },
  { value: "crypto", labelKey: "method.crypto" },
  { value: "other", labelKey: "method.other" },
];

export const RECURRENCE_OPTIONS: {
  value: RecurrenceFrequency;
  labelKey: TranslationKey;
}[] = [
  { value: "none", labelKey: "recurrence.none" },
  { value: "daily", labelKey: "recurrence.daily" },
  { value: "weekly", labelKey: "recurrence.weekly" },
  { value: "monthly", labelKey: "recurrence.monthly" },
  { value: "quarterly", labelKey: "recurrence.quarterly" },
  { value: "yearly", labelKey: "recurrence.yearly" },
];
