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
  banner: { width: 728, height: 90, name: '리더보드' },
  rectangle: { width: 300, height: 250, name: '중형 직사각형' },
  leaderboard: { width: 970, height: 90, name: '슈퍼 리더보드' },
  skyscraper: { width: 160, height: 600, name: '와이드 스카이스크래퍼' },
  mobile: { width: 320, height: 50, name: '모바일 배너' },
  responsive: { width: '100%', height: 280, name: '반응형' },
  square: { width: 336, height: 280, name: '대형 직사각형' },
};

// 다양한 가짜 광고 콘텐츠
const FAKE_ADS = [
  {
    title: "최신 스마트폰 50% 할인!",
    subtitle: "지금 구매하면 무료 배송",
    icon: ShoppingCart,
    bg: "bg-gradient-to-br from-blue-500 to-purple-600",
    color: "text-white",
    button: "지금 구매",
    emoji: "📱"
  },
  {
    title: "무료 온라인 강의",
    subtitle: "프로그래밍 마스터하기",
    icon: Play,
    bg: "bg-gradient-to-br from-green-500 to-teal-600",
    color: "text-white",
    button: "무료 수강",
    emoji: "💻"
  },
  {
    title: "건강한 다이어트 솔루션",
    subtitle: "30일 무료 체험",
    icon: Heart,
    bg: "bg-gradient-to-br from-pink-500 to-rose-600",
    color: "text-white",
    button: "체험하기",
    emoji: "💪"
  },
  {
    title: "AI 사진 편집기",
    subtitle: "1초만에 전문가급 보정",
    icon: Camera,
    bg: "bg-gradient-to-br from-orange-500 to-red-600",
    color: "text-white",
    button: "무료 체험",
    emoji: "📷"
  },
  {
    title: "투자의 기회",
    subtitle: "월 5% 수익률 보장",
    icon: Star,
    bg: "bg-gradient-to-br from-yellow-500 to-orange-600",
    color: "text-white",
    button: "투자하기",
    emoji: "💰"
  },
  {
    title: "빠른 배송 서비스",
    subtitle: "당일 배송 무료",
    icon: Zap,
    bg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    color: "text-white",
    button: "주문하기",
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
  // 애드센스 승인 전까지 광고를 표시하지 않음
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