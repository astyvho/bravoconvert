"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default function GoogleAnalytics() {
  useEffect(() => {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-2QXJN1E3TF';
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', 'G-2QXJN1E3TF');

    return () => {
      // Cleanup on unmount
      const scriptElement = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, []);

  return null;
}