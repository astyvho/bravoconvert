"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/locale";

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
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = readConsent();
    setChoice(saved);
    setIsOpen(saved === null);
    if (saved) applyConsent(saved);
  }, []);

  const saveChoice = (nextChoice: ConsentChoice) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, nextChoice);
    setChoice(nextChoice);
    setIsOpen(false);
    applyConsent(nextChoice);
  };

  return (
    <>
      {isOpen && (
        <section
          className="fixed inset-x-2 bottom-2 z-[100] mx-auto flex max-w-4xl flex-col gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-xl sm:flex-row sm:items-center sm:gap-4"
          role="region"
          aria-label={t.region}
        >
          <p className="flex-1 text-xs leading-5 text-gray-700">
            {t.body} <Link href="/privacy-policy/" className="font-medium underline">{t.policy}</Link>
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => saveChoice("denied")} className="flex-1 whitespace-nowrap rounded-lg border border-black bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-gray-100 sm:flex-none">
              {t.reject}
            </button>
            <button type="button" onClick={() => saveChoice("granted")} className="flex-1 whitespace-nowrap rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 sm:flex-none">
              {t.accept}
            </button>
          </div>
        </section>
      )}

      {!isOpen && choice !== null && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-3 left-3 z-[90] rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-black shadow-md hover:bg-gray-100"
        >
          {t.reopen}
        </button>
      )}
    </>
  );
}
