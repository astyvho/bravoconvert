"use client";
import { ShoppingCart, Zap, Star, Heart, Play, Camera } from "lucide-react";

interface AdSenseProps {
  slot: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  type?: 'banner' | 'rectangle' | 'leaderboard' | 'skyscraper' | 'mobile' | 'responsive' | 'square';
}

const AD_SIZES = {
  banner: { width: 728, height: 90, name: 'Leaderboard' },
  rectangle: { width: 300, height: 250, name: 'Medium Rectangle' },
  leaderboard: { width: 970, height: 90, name: 'Super Leaderboard' },
  skyscraper: { width: 160, height: 600, name: 'Wide Skyscraper' },
  mobile: { width: 320, height: 50, name: 'Mobile Banner' },
  responsive: { width: '100%', height: 280, name: 'Responsive' },
  square: { width: 336, height: 280, name: 'Large Rectangle' },
};

// Various fake ad content
const FAKE_ADS = [
  {
    title: "Latest Smartphone 50% Off!",
    subtitle: "Free shipping when you buy now",
    icon: ShoppingCart,
    bg: "bg-gradient-to-br from-blue-500 to-purple-600",
    color: "text-white",
    button: "Buy Now",
    emoji: "📱"
  },
  {
    title: "Free Online Course",
    subtitle: "Master Programming",
    icon: Play,
    bg: "bg-gradient-to-br from-green-500 to-teal-600",
    color: "text-white",
    button: "Start Free",
    emoji: "💻"
  },
  {
    title: "Healthy Diet Solution",
    subtitle: "30-day free trial",
    icon: Heart,
    bg: "bg-gradient-to-br from-pink-500 to-rose-600",
    color: "text-white",
    button: "Try Now",
    emoji: "💪"
  },
  {
    title: "AI Photo Editor",
    subtitle: "Professional editing in 1 second",
    icon: Camera,
    bg: "bg-gradient-to-br from-orange-500 to-red-600",
    color: "text-white",
    button: "Try Free",
    emoji: "📷"
  },
  {
    title: "Investment Opportunity",
    subtitle: "5% monthly return guaranteed",
    icon: Star,
    bg: "bg-gradient-to-br from-yellow-500 to-orange-600",
    color: "text-white",
    button: "Invest Now",
    emoji: "💰"
  },
  {
    title: "Fast Delivery Service",
    subtitle: "Same-day delivery for free",
    icon: Zap,
    bg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    color: "text-white",
    button: "Order Now",
    emoji: "⚡"
  }
];

export default function AdSense({ 
  slot, 
  width, 
  height, 
  className = "", 
  type = 'rectangle' 
}: AdSenseProps) {
  // Do not show ads until AdSense approval
  return null;
}

// 특정 광고 유형별 컴포넌트들
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