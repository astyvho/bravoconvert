"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Locale } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import { useConsentBanner } from "@/components/site/consent-context";

export const CONSENT_STORAGE_KEY = "bravoconvert-consent-v1";
export const CONSENT_EVENT = "bravoconvert:consent";

export type ConsentChoice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function applyConsent(choice: ConsentChoice) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "update", {
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  });
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }));
}

export function readConsent(): ConsentChoice | null {
  const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return saved === "granted" || saved === "denied" ? saved : null;
}

const TEXT = {
  en: {
    region: "Privacy choices",
    body: "Files stay in your browser. With your permission, Google Analytics and AdSense may store cookies for measurement and advertising.",
    policy: "Privacy Policy",
    reject: "Reject",
    accept: "Accept",
    reopen: "Privacy choices",
  },
  ko: {
    region: "개인정보 선택",
    body: "파일은 브라우저 안에서만 처리됩니다. 동의하시면 Google Analytics와 AdSense가 방문 통계와 광고를 위해 쿠키를 저장할 수 있습니다.",
    policy: "개인정보처리방침(영문)",
    reject: "거부",
    accept: "동의",
    reopen: "개인정보 선택",
  },
};

export default function ConsentManager({ locale = "en" }: { locale?: Locale }) {
  const t = TEXT[locale];
  // Open/closed lives in ConsentBannerContext so the footer can reopen it and tool pages can keep
  // their fixed action bar out from under it. The choice itself is persisted in localStorage.
  const { open, setOpen } = useConsentBanner();

  useEffect(() => {
    const saved = readConsent();
    setOpen(saved === null);
    if (saved) applyConsent(saved);
  }, [setOpen]);

  const saveChoice = (nextChoice: ConsentChoice) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, nextChoice);
    setOpen(false);
    applyConsent(nextChoice);
  };

  if (!open) return null;
  return (
    <section
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-card bg-card p-4 shadow-soft sm:flex sm:items-center sm:gap-4"
      role="region"
      aria-label={t.region}
    >
      <p className="flex-1 text-[13px] leading-5 text-muted-foreground">
        {t.body} <Link href="/privacy-policy/" className="font-semibold text-foreground underline underline-offset-4">{t.policy}</Link>
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <Button type="button" variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => saveChoice("denied")}>
          {t.reject}
        </Button>
        {/* Accept stays neutral (ink, not the point colour) on purpose so the banner does not nudge. */}
        <Button type="button" size="sm" className="flex-1 bg-foreground text-background shadow-none hover:bg-foreground/90 sm:flex-none" onClick={() => saveChoice("granted")}>
          {t.accept}
        </Button>
      </div>
    </section>
  );
}
