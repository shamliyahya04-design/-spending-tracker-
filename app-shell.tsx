"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Wallet2 } from "lucide-react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { ActivationScreen, TrialBanner } from "@/components/license/activation-screen";
import { useLicenseStatus } from "@/lib/hooks";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const { status, trialDaysLeft } = useLicenseStatus();

  // Avoid a flash of the lock screen before trial/license state resolves.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-glow"
        >
          <Wallet2 className="size-7 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  // License gate — only the activation screen until unlocked.
  if (status === "locked") {
    return <ActivationScreen />;
  }

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 start-1/4 size-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 end-0 size-[500px] rounded-full bg-chart-2/10 blur-[120px]" />
      </div>

      <Sidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onQuickAdd={() => setQuickAddOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {status === "trial" && <TrialBanner daysLeft={trialDaysLeft} />}
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <TransactionDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </div>
  );
}
