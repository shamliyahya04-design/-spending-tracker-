"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

/**
 * Accessible modal dialog with backdrop blur, focus management and Escape-to-close.
 * Rendered through a portal so it overlays the whole app.
 */
export function Dialog({
  open,
  onClose,
  children,
  className,
  title,
  description,
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // focus first focusable element
    const t = setTimeout(() => {
      const focusable = contentRef.current?.querySelector<HTMLElement>(
        "input, textarea, select, button, [tabindex]:not([tabindex='-1'])"
      );
      focusable?.focus();
    }, 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={cn(
              "relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto",
              "no-scrollbar rounded-3xl border border-border/60 bg-card p-6 shadow-elevated",
              className
            )}
          >
            {(title || description) && (
              <div className="mb-5 pe-8">
                {title && (
                  <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute end-5 top-5 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
