import type { CurrencyCode } from "./types";

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  /** Native label */
  label: string;
  /** Locale used for number formatting */
  locale: string;
  /** Number of decimal places */
  decimals: number;
  /** Approximate conversion rate relative to USD (base = 1). Used for demo conversion. */
  rateFromUSD: number;
}

/**
 * Central currency registry.
 * Adding a new currency = adding one entry here. UI & formatting derive from this.
 */
export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: {
    code: "USD",
    symbol: "$",
    label: "US Dollar",
    locale: "en-US",
    decimals: 2,
    rateFromUSD: 1,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    label: "Euro",
    locale: "de-DE",
    decimals: 2,
    rateFromUSD: 0.92,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    label: "British Pound",
    locale: "en-GB",
    decimals: 2,
    rateFromUSD: 0.79,
  },
  SAR: {
    code: "SAR",
    symbol: "ر.س",
    label: "Saudi Riyal",
    locale: "ar-SA",
    decimals: 2,
    rateFromUSD: 3.75,
  },
  AED: {
    code: "AED",
    symbol: "د.إ",
    label: "UAE Dirham",
    locale: "ar-AE",
    decimals: 2,
    rateFromUSD: 3.67,
  },
  YER: {
    code: "YER",
    symbol: "﷼",
    label: "Yemeni Rial",
    locale: "ar-YE",
    decimals: 0,
    rateFromUSD: 250,
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    label: "Japanese Yen",
    locale: "ja-JP",
    decimals: 0,
    rateFromUSD: 156,
  },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

export function getCurrency(code: CurrencyCode): CurrencyMeta {
  return CURRENCIES[code] ?? CURRENCIES.USD;
}

/**
 * Convert an amount stored in USD into the target currency.
 * In a real app this would call an FX service; here we use static demo rates.
 */
export function convertFromUSD(amountUSD: number, to: CurrencyCode): number {
  const meta = getCurrency(to);
  return Number((amountUSD * meta.rateFromUSD).toFixed(meta.decimals));
}

/** Convert an amount from one currency to another via USD as the base. */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  const inUSD = amount / getCurrency(from).rateFromUSD;
  return convertFromUSD(inUSD, to);
}
