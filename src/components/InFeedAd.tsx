"use client";
import { ShoppingBag, Sparkles, Crown } from "lucide-react";

interface InFeedAdProps {
  slot: string;
  className?: string;
}

const INFEED_ADS = [
  {
    title: "프리미엄 헤드셋 출시!",
    description: "노이즈 캔슬링 + 무선 충전. 지금 구매하면 30% 할인",
    price: "₩199,000",
    originalPrice: "₩285,000",
    bg: "bg-gradient-to-r from-purple-600 to-blue-600",
    emoji: "🎧",
    badge: "신제품"
  },
  {
    title: "온라인 쇼핑몰 창업",
    description: "월 100만원 수익 가능! 완전 자동화 시스템으로 쉽게 시작하세요",
    price: "무료 체험",
    originalPrice: "",
    bg: "bg-gradient-to-r from-green-500 to-emerald-600",
    emoji: "🛍️",
    badge: "인기"
  },
  {
    title: "AI 영어 과외",
    description: "1:1 맞춤 학습으로 3개월 만에 영어 마스터! 첫 달 무료",
    price: "월 ₩59,000",
    originalPrice: "월 ₩99,000",
    bg: "bg-gradient-to-r from-orange-500 to-pink-600",
    emoji: "📚",
    badge: "추천"
  }
];

export default function InFeedAd({ slot, className = "" }: InFeedAdProps) {
  // 애드센스 승인 전까지 인피드 광고를 표시하지 않음
  return null;
} 