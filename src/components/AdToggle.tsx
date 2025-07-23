"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export function useAdToggle() {
  const [isAdEnabled, setIsAdEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("adSenseEnabled");
    setIsAdEnabled(saved === "true");
  }, []);

  const toggleAd = () => {
    const newState = !isAdEnabled;
    setIsAdEnabled(newState);
    localStorage.setItem("adSenseEnabled", newState.toString());
  };

  return { isAdEnabled, toggleAd };
}

export default function AdToggle() {
  // 애드센스 승인 전까지 광고 토글을 표시하지 않음
  return null;
} 