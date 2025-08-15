"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dropdown menu close timer
  const startCloseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsConverterOpen(false);
    }, 300); // 300ms 지연
  };

  // Open dropdown menu
  const openDropdown = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsConverterOpen(true);
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="sticky top-0 w-full px-4 pt-6 pb-4 z-50 bg-white/80 backdrop-blur-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5 bg-white/95 rounded-3xl shadow-xl shadow-gray-200/30 border border-gray-200 hover:border-gray-300 transition-all duration-300 backdrop-blur-md relative">
        {/* Additional shadow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
        
        <Link href="/" className="font-bold text-xl text-black relative z-10">BravoConvert</Link>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6 text-sm relative z-10">
          {/* Converter tools dropdown */}
          <div 
            ref={dropdownRef}
            className="relative"
            onMouseEnter={openDropdown}
            onMouseLeave={startCloseTimer}
          >
            <button
              className="flex items-center gap-1 hover:text-black text-black transition-all duration-300 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-200 hover:shadow-sm"
            >
              Converters
              <ChevronDown size={16} className={`transition-transform duration-200 ${isConverterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {isConverterOpen && (
              <div 
                className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                onMouseEnter={openDropdown}
                onMouseLeave={startCloseTimer}
              >
                {/* Top virtual padding area - expand mouse over area */}
                <div className="h-4 bg-transparent"></div>
                <Link href="/convert/img" className="block px-4 py-3 text-black hover:bg-gray-100 transition-all duration-200 border-b border-gray-100">
                  <div className="font-medium">Image Converter</div>
                  <div className="text-xs text-gray-600">PNG, JPG, WEBP, PDF & more</div>
                </Link>
                <Link href="/convert/pdf" className="block px-4 py-3 text-black hover:bg-gray-100 transition-all duration-200 border-b border-gray-100 last:border-b-0">
                  <div className="font-medium">PDF to Image</div>
                  <div className="text-xs text-gray-600">Convert PDF to JPG, PNG</div>
                </Link>
                {/* Bottom virtual padding area - expand mouse over area */}
                <div className="h-4 bg-transparent"></div>
              </div>
            )}
          </div>
          
          <a href="/how-to-use" className="hover:text-black text-black transition-all duration-300 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-200 hover:shadow-sm">How to Use</a>
          <a href="/faq" className="hover:text-black text-black transition-all duration-300 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-200 hover:shadow-sm">FAQ</a>
          <a href="/privacy-policy" className="hover:text-black text-black transition-all duration-300 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-200 hover:shadow-sm">Privacy Policy</a>
          <a href="/terms" className="hover:text-black text-black transition-all duration-300 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-200 hover:shadow-sm">Terms of Service</a>
        </div>

        {/* Mobile hamburger menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden relative z-10 p-2 text-black hover:text-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
          </div>
        </button>

        {/* Mobile dropdown menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden md:hidden">
            <div className="flex flex-col">
              <Link href="/convert/img" onClick={() => setIsMenuOpen(false)} className="hover:text-black text-black transition-all duration-300 font-medium px-6 py-4 hover:bg-gray-200 border-b border-gray-100">
                <div className="font-medium">Image Converter</div>
                <div className="text-xs text-gray-600">PNG, JPG, WEBP, PDF & more</div>
              </Link>
              <Link href="/convert/pdf" onClick={() => setIsMenuOpen(false)} className="hover:text-black text-black transition-all duration-300 font-medium px-6 py-4 hover:bg-gray-200 border-b border-gray-100">
                <div className="font-medium">PDF to Image</div>
                <div className="text-xs text-gray-600">Convert PDF to JPG, PNG</div>
              </Link>
              <a href="/how-to-use" onClick={() => setIsMenuOpen(false)} className="hover:text-black text-black transition-all duration-300 font-medium px-6 py-4 hover:bg-gray-200 border-b border-gray-100">How to Use</a>
              <a href="/faq" onClick={() => setIsMenuOpen(false)} className="hover:text-black text-black transition-all duration-300 font-medium px-6 py-4 hover:bg-gray-200 border-b border-gray-100">FAQ</a>
              <a href="/privacy-policy" onClick={() => setIsMenuOpen(false)} className="hover:text-black text-black transition-all duration-300 font-medium px-6 py-4 hover:bg-gray-200 border-b border-gray-100">Privacy Policy</a>
              <a href="/terms" onClick={() => setIsMenuOpen(false)} className="hover:text-black text-black transition-all duration-300 font-medium px-6 py-4 hover:bg-gray-200 border-b border-gray-100 last:border-b-0">Terms of Service</a>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
} 