"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  gridLayout?: boolean; // 2열 그리드 레이아웃 옵션
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  className = "",
  size = "md",
  placeholder = "선택하세요",
  gridLayout = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* 드롭다운 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          bg-gray-50 border border-gray-300 rounded-2xl
          font-bold text-black text-left
          hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:border-gray-500
          transition-all duration-200 outline-none
          ${sizeClasses[size]}
          ${isOpen ? 'ring-2 ring-gray-400 border-gray-500' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`ml-2 h-5 w-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* 드롭다운 옵션 리스트 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
            role="listbox"
          >
            <div className="max-h-80 overflow-y-auto">
              {gridLayout ? (
                // 2열 그리드 레이아웃
                <div className="grid grid-cols-2 gap-1 p-2">
                {options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option.value)}
                    className={`
                      w-full px-3 py-2.5 text-center font-medium rounded-xl
                      hover:bg-gray-200 focus:bg-gray-200 focus:outline-none
                      transition-colors duration-150
                      ${option.value === value ? 'bg-gray-300 text-black font-bold' : 'text-gray-700'}
                    `}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              ) : (
                // 세로 리스트 레이아웃 (기존)
                options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option.value)}
                    className={`
                      w-full px-4 py-3 text-left font-medium
                      hover:bg-gray-200 focus:bg-gray-200 focus:outline-none
                      transition-colors duration-150 flex items-center justify-between
                      ${option.value === value ? 'bg-gray-300 text-black font-bold' : 'text-gray-700'}
                      ${index === 0 ? '' : 'border-t border-gray-100'}
                    `}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    <span>{option.label}</span>
                    {option.value === value && (
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 