"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Wallet2, Copy, Check, KeyRound, ExternalLink, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { LicenseInfo } from "@/lib/license";

const ERROR_KEYS: Record<string, string> = {
  bad_format: "license.err.format",
  bad_signature: "license.err.signature",
  expired: "license.err.expired",
  device_mismatch: "license.err.device",
};

export function ActivationScreen() {
  const { t } = useI18n();
  const activateLicense = useStore((s) => s.activateLicense);

  const [key, setKey] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [device, setDevice] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    import("@/lib/device").then(({ getDeviceCode }) =>
      getDeviceCode().then((c) => active && setDevice(c))
    );
    return () => {
      active = false;
    };
  }, []);

  const handleActivate = async () => {
    setError(null);
    setLoading(true);
    const info: LicenseInfo = await activateLicense(key);
    setLoading(false);
    if (info.valid) {
      setSuccess(true);
    } else {
      setError(t(ERROR_KEYS[info.reason ?? "bad_signature"] ?? "license.err.signature"));
    }
  };

  const copyDevice = async () => {
    try {
      await navigator.clipboard.writeText(device);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 start-1/3 size-[500px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-0 end-0 size-[400px] rounded-full bg-chart-2/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-premium w-full max-w-md rounded-3xl p-8"
      >
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-glow">
            <Wallet2 className="size-8" />
          </div>
          <h1 className="font-display text-xl font-bold">{t("license.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("license.subtitle")}
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-6 text-center"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-positive/10 text-positive">
              <ShieldCheck className="size-7" />
            </div>
            <p className="font-medium text-positive">{t("license.success")}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Key input */}
            <div>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute start-3 top-4 size-4 text-muted-foreground" />
                <textarea
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={t("license.keyPlaceholder")}
                  rows={3}
                  dir="ltr"
                  className="w-full resize-none rounded-xl border border-input bg-background/50 ps-9 p-3 text-xs leading-relaxed transition-colors placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            </div>

            <Button
              variant="gradient"
              className="w-full"
              onClick={handleActivate}
              disabled={loading || !key.trim()}
            >
              {loading ? "…" : t("license.activate")}
            </Button>

            {/* Device code */}
            <div className="rounded-xl bg-secondary/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("license.deviceCode")}
                </span>
                <button
                  onClick={copyDevice}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {copied ? (
                    <>
                      <Check className="size-3" /> ✓
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" /> copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 tabular text-base font-bold tracking-wider">
                {device || "·······"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t("license.deviceCodeHint")}
              </p>
            </div>

            {/* Buy CTA */}
            <a
              href="/landing"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {t("license.buy")}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/** Small badge shown in the app while on the free trial. */
export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const { t } = useI18n();
  return (
    <a
      href="/landing"
      className={cn(
        "mx-auto mb-4 flex max-w-7xl items-center justify-center gap-2 rounded-xl",
        "border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-300",
        "transition-colors hover:bg-amber-500/15"
      )}
    >
      ⏳ {t("license.trialBadge", { days: daysLeft })}
      <span className="font-semibold underline">{t("license.trialActivate")}</span>
    </a>
  );
}
