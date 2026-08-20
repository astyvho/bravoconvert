"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function ConsentManager() {
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
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-gray-300 bg-white p-5 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-choices-title"
        >
          <h2 id="privacy-choices-title" className="text-lg font-bold text-black">Privacy choices</h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            BravoConvert processes selected files in your browser. With your permission, Google Analytics measures site usage and Google AdSense may store or access information for advertising. Rejecting optional storage does not affect the conversion tools. See the <Link href="/privacy-policy/" className="font-medium underline">Privacy Policy</Link>.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => saveChoice("denied")} className="rounded-xl border border-black bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-gray-100">
              Reject optional cookies
            </button>
            <button type="button" onClick={() => saveChoice("granted")} className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800">
              Accept optional cookies
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
          Privacy choices
        </button>
      )}
    </>
  );
}
