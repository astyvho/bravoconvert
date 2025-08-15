"use client";
import { X, Gift, Zap, Star } from "lucide-react";
import { useState } from "react";

interface AnchorAdProps {
  slot: string;
  isEnabled?: boolean;
}

const ANCHOR_ADS = [
  {
    title: "🎉 Special Discount Event",
    subtitle: "50% off your first purchase when you sign up now!",
    bg: "bg-gradient-to-r from-red-500 to-pink-600",
    button: "Get Discount",
    icon: Gift
  },
  {
    title: "⚡ Fast Shipping Service",
    subtitle: "Order today, arrive tomorrow! Free shipping",
    bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
    button: "Order Now",
    icon: Zap
  },
  {
    title: "⭐ Premium Membership",
    subtitle: "$9.99/month for unlimited access to all features",
    bg: "bg-gradient-to-r from-purple-500 to-blue-600",
    button: "Join Now",
    icon: Star
  }
];

export default function AnchorAd({ slot, isEnabled = true }: AnchorAdProps) {
  // Do not show anchor ads until AdSense approval
  return null;
} 