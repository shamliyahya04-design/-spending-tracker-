"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "./store";
import { translate, type TranslationKey } from "./i18n";
import type { Language } from "./types";
import { verifyLicense, type LicenseInfo } from "./license";
import { getDeviceCode } from "./device";
import { LICENSE_CONFIG } from "./license-config";

/**
 * Convenience hook: returns current language + a `t()` bound to it.
 */
export function useI18n() {
  const language = useStore((s) => s.settings.language);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>) =>
      translate(language as Language, key as string, params),
    [language]
  );

  return { t, language, isRTL: language === "ar" };
}

/** Selector for current settings + currency meta */
export function useSettings() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  return { settings, updateSettings };
}

export type LicenseStatus = "licensed" | "trial" | "locked";

/** Computes the current license/trial state, re-verifying against the device. */
export function useLicenseStatus() {
  const licenseKey = useStore((s) => s.licenseKey);
  const trialStartedAt = useStore((s) => s.trialStartedAt);
  const ensureTrial = useStore((s) => s.ensureTrial);
  const [deviceCode, setDeviceCode] = useState("");
  const [info, setInfo] = useState<LicenseInfo | null>(null);

  // Start trial on first launch
  useEffect(() => {
    ensureTrial();
  }, [ensureTrial]);

  // Resolve device code + verify the stored key
  useEffect(() => {
    let active = true;
    (async () => {
      const code = await getDeviceCode();
      if (!active) return;
      setDeviceCode(code);
      if (licenseKey) {
        setInfo(verifyLicense(licenseKey, code));
      } else {
        setInfo(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [licenseKey]);

  const isLicensed = Boolean(info?.valid);

  const trialDaysLeft =
    trialStartedAt != null
      ? Math.max(
          0,
          LICENSE_CONFIG.trialDays -
            Math.floor((Date.now() - trialStartedAt) / 86_400_000)
        )
      : 0;
  const trialExpired = trialStartedAt != null && trialDaysLeft <= 0;

  let status: LicenseStatus;
  if (!LICENSE_CONFIG.required || isLicensed) {
    status = "licensed";
  } else if (trialStartedAt != null && !trialExpired) {
    status = "trial";
  } else {
    status = "locked";
  }

  return { status, info, deviceCode, trialDaysLeft, isLicensed };
}
