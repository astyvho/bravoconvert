"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const ADSENSE_CLIENT = "ca-pub-6552891879490275";
const ADSENSE_HOSTS = new Set(["bravoconvert.com", "www.bravoconvert.com"]);

export default function AdSenseAutoAds() {
  const [isOfficialHost, setIsOfficialHost] = useState(false);

  useEffect(() => {
    setIsOfficialHost(ADSENSE_HOSTS.has(window.location.hostname));
  }, []);

  if (!isOfficialHost) return null;

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
