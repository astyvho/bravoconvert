"use client";

import { Button } from "@/components/ui/button";
import { useConsentBanner } from "./consent-context";

/** Footer button that reopens the consent banner. Replaces the floating pill that used to sit bottom-left. */
export default function PrivacyChoicesButton({ label }: { label: string }) {
  const { setOpen } = useConsentBanner();
  return (
    <Button type="button" variant="link" size="sm" className="text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={() => setOpen(true)}>
      {label}
    </Button>
  );
}
