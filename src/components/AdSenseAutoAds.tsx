"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, ConsentChoice, readConsent } from "./ConsentManager";

const ADSENSE_CLIENT = "ca-pub-6552891879490275";
const ADSENSE_HOSTS = new Set(["bravoconvert.com", "www.bravoconvert.com"]);

export default function AdSenseAutoAds() {
  const [isOfficialHost, setIsOfficialHost] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setIsOfficialHost(ADSENSE_HOSTS.has(window.location.hostname));
    setHasConsent(readConsent() === "granted");
    const onConsent = (event: Event) => setHasConsent((event as CustomEvent<ConsentChoice>).detail === "granted");
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  if (!isOfficialHost || !hasConsent) return null;

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
