"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

// Whether the cookie-consent banner is currently open. ConsentManager owns the banner and sets it;
// the footer's "Privacy choices" button reopens it; tool pages read it so a fixed bottom action bar
// never sits under the banner on phones (spec §6.3, §7.1).
type ConsentBannerState = { open: boolean; setOpen: (open: boolean) => void };

const ConsentBannerContext = createContext<ConsentBannerState>({ open: false, setOpen: () => {} });

export function ConsentBannerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <ConsentBannerContext.Provider value={value}>{children}</ConsentBannerContext.Provider>;
}

export function useConsentBanner(): ConsentBannerState {
  return useContext(ConsentBannerContext);
}
