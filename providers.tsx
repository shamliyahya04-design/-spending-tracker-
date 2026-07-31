"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useStore } from "@/lib/store";

/**
 * Root providers:
 * - next-themes for light/dark/system
 * - syncs <html dir/lang> with the active language (RTL for Arabic)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const language = useStore((s) => s.settings.language);
  const hasHydrated = useStore((s) => s.hasHydrated);

  React.useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* Avoid theme/dir flash before hydration */}
      <div suppressHydrationWarning>
        {hasHydrated ? children : children}
      </div>
    </NextThemesProvider>
  );
}
