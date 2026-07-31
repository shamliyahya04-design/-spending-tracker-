/**
 * Tiny hex/UTF-8 helpers shared by the license tool (Node) and the app (browser).
 * Hex is used deliberately for binary-safe encoding with no base64 pitfalls.
 */

export function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i]!.toString(16).padStart(2, "0");
  }
  return out;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.length % 2 ? "0" + hex : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

export function utf8ToBytes(str: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }
  // Node fallback
  return Uint8Array.from(Buffer.from(str, "utf8"));
}

export function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(bytes).toString("utf8");
}

export function randomHex(byteLength: number): string {
  const arr = new Uint8Array(byteLength);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    // Node fallback
    (require("crypto") as typeof import("crypto")).randomFillSync(arr);
  }
  return bytesToHex(arr);
}
