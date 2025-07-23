"use client";
import { X, Gift, Zap, Star } from "lucide-react";
import { useState } from "react";

interface AnchorAdProps {
  slot: string;
  isEnabled?: boolean;
}

const ANCHOR_ADS = [
  {
    title: "🎉 특별 할인 이벤트",
    subtitle: "지금 가입하면 첫 구매 50% 할인!",
    bg: "bg-gradient-to-r from-red-500 to-pink-600",
    button: "할인받기",
    icon: Gift
  },
  {
    title: "⚡ 빠른 배송 서비스",
    subtitle: "오늘 주문하면 내일 도착! 무료 배송",
    bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
    button: "주문하기",
    icon: Zap
  },
  {
    title: "⭐ 프리미엄 멤버십",
    subtitle: "월 ₩9,900으로 모든 기능 무제한 이용",
    bg: "bg-gradient-to-r from-purple-500 to-blue-600",
    button: "가입하기",
    icon: Star
  }
];

export default function AnchorAd({ slot, isEnabled = true }: AnchorAdProps) {
  // 애드센스 승인 전까지 앵커 광고를 표시하지 않음
  return null;
} 