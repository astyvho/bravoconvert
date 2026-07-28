"use client";

import { useEffect } from "react";
import { CONSENT_EVENT, ConsentChoice, readConsent } from "./ConsentManager";

export default function GoogleAnalytics() {
  useEffect(() => {
    const isOfficialHost = ["bravoconvert.com", "www.bravoconvert.com"].includes(window.location.hostname);
    if (!isOfficialHost) return;

    const loadAnalytics = (choice: ConsentChoice | null) => {
      if (choice !== "granted" || document.getElementById("google-analytics")) return;
      const script = document.createElement("script");
      script.id = "google-analytics";
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-2QXJN1E3TF";
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", "G-2QXJN1E3TF", { anonymize_ip: true });
    };

    const onConsent = (event: Event) => loadAnalytics((event as CustomEvent<ConsentChoice>).detail);
    loadAnalytics(readConsent());
    window.addEventListener(CONSENT_EVENT, onConsent);

    return () => {
      window.removeEventListener(CONSENT_EVENT, onConsent);
    };
  }, []);

  return null;
}
