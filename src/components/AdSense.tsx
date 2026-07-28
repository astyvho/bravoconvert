"use client";

interface AdSenseProps {
  slot: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  type?: "banner" | "rectangle" | "leaderboard" | "skyscraper" | "mobile" | "responsive" | "square";
}

export default function AdSense({
  slot: _slot,
  width: _width,
  height: _height,
  className: _className = "",
  type: _type = "rectangle",
}: AdSenseProps) {
  // Ad placements remain disabled until the site is approved in AdSense.
  return null;
}

export function BannerAd({ slot, className }: { slot: string; className?: string }) {
  return <AdSense slot={slot} type="banner" className={className} />;
}

export function RectangleAd({ slot, className }: { slot: string; className?: string }) {
  return <AdSense slot={slot} type="rectangle" className={className} />;
}

export function MobileAd({ slot, className }: { slot: string; className?: string }) {
  return <AdSense slot={slot} type="mobile" className={className} />;
}

export function SkyscraperAd({ slot, className }: { slot: string; className?: string }) {
  return <AdSense slot={slot} type="skyscraper" className={className} />;
}

export function ResponsiveAd({ slot, className }: { slot: string; className?: string }) {
  return <AdSense slot={slot} type="responsive" className={className} />;
}
