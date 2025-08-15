"use client";
import { ShoppingBag, Sparkles, Crown } from "lucide-react";

interface InFeedAdProps {
  slot: string;
  className?: string;
}

const INFEED_ADS = [
  {
    title: "Premium Headset Launch!",
    description: "Noise Cancelling + Wireless Charging. 30% off when you buy now",
    price: "$199",
    originalPrice: "$285",
    bg: "bg-gradient-to-r from-purple-600 to-blue-600",
    emoji: "🎧",
    badge: "New"
  },
  {
    title: "Start Your Online Store",
    description: "$10,000/month revenue possible! Easy start with fully automated system",
    price: "Free Trial",
    originalPrice: "",
    bg: "bg-gradient-to-r from-green-500 to-emerald-600",
    emoji: "🛍️",
    badge: "Popular"
  },
  {
    title: "AI English Tutoring",
    description: "Master English in 3 months with 1:1 personalized learning! First month free",
    price: "$59/month",
    originalPrice: "$99/month",
    bg: "bg-gradient-to-r from-orange-500 to-pink-600",
    emoji: "📚",
    badge: "Recommended"
  }
];

export default function InFeedAd({ slot, className = "" }: InFeedAdProps) {
  // Do not show in-feed ads until AdSense approval
  return null;
} 