import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration — wraps the statically-exported web app
 * (the `out/` folder) into a native Android app.
 *
 * Build flow:
 *   npm run build            # produces out/
 *   npx cap sync android     # copies out/ into the Android project
 *   cd android && ./gradlew assembleDebug    # builds the APK
 */
const config: CapacitorConfig = {
  appId: "com.spendingtracker.app",
  appName: "Spending Tracker",
  webDir: "out",
  // Bundle everything locally — the app runs fully offline, no server needed.
  server: {
    androidScheme: "https",
  },
  android: {
    // Allow the WebView to load bundled content
    allowMixedContent: false,
  },
};

export default config;
