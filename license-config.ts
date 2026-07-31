/**
 * Licensing configuration.
 *
 * - required: when true the app gates behind a license after the trial.
 * - trialDays: how long the free trial lasts (from first launch).
 *
 * For development/preview you can set `required: false` to bypass the gate.
 */
export const LICENSE_CONFIG = {
  required: true,
  trialDays: 7,
} as const;
