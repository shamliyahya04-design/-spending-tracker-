/**
 * Device identification for license binding.
 * - On Android (Capacitor) → uses the platform device identifier.
 * - On web/preview → a stable UUID persisted in localStorage.
 */

const DEVICE_ID_KEY = "st-device-id";

export async function getDeviceId(): Promise<string> {
  // Native Android via Capacitor
  if (typeof window !== "undefined") {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor;
    if (cap?.isNativePlatform?.()) {
      try {
        const mod = await import("@capacitor/device");
        const info = await mod.Device.getId();
        if (info.identifier) return info.identifier;
      } catch {
        // fall through to web fallback
      }
    }
  }

  // Web fallback
  if (typeof localStorage !== "undefined") {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `web-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }
  return "unknown-device";
}

/** Short, human-friendly code shown on the activation screen. */
export async function getDeviceCode(): Promise<string> {
  const id = await getDeviceId();
  // 8-char hex hash of the device id
  let h1 = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h1 ^= id.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(16).toUpperCase().padStart(8, "0");
}
