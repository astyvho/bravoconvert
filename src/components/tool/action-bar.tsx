"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useConsentBanner } from "@/components/site/consent-context";
import { cn } from "@/lib/utils";

const DESKTOP = "(min-width: 1024px)";

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const update = () => setDesktop(query.matches);
    update();
    // media-query-polyfill.ts gives Safari before 14 the addEventListener used here.
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return desktop;
}

/**
 * The panel's button row. On phones it is pinned to the bottom of the screen so the primary action
 * is always reachable — except while the consent banner is open, when it stays in the panel so the
 * two never overlap (spec §6.3). While pinned, the body gets bottom padding so nothing hides under it.
 */
export default function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  const { open } = useConsentBanner();
  const desktop = useIsDesktop();
  const fixed = !open && !desktop;

  useEffect(() => {
    if (!fixed) return;
    document.body.classList.add("has-action-bar");
    return () => document.body.classList.remove("has-action-bar");
  }, [fixed]);

  return (
    <div
      data-action-bar
      data-fixed={fixed ? "true" : "false"}
      className={cn(
        "flex flex-col gap-2",
        fixed
          ? "fixed inset-x-0 bottom-0 z-40 bg-card px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(120,70,20,0.08)]"
          : "pt-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
