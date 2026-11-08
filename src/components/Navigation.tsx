"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Languages } from "lucide-react";
import { koPath, stripKo, type Locale } from "@/lib/locale";

type Item = { href: string; label: string; note?: string };

const TEXT: Record<Locale, { tools: string; toggle: string; switchLabel: string; toolItems: Item[]; links: Item[] }> = {
  en: {
    tools: "Tools",
    toggle: "Toggle menu",
    switchLabel: "한국어",
    toolItems: [
      { href: "/view/exif/", label: "EXIF Viewer", note: "See a photo's hidden metadata" },
      { href: "/convert/img/", label: "Image Converter", note: "PNG, JPG, WEBP, PDF & more" },
      { href: "/convert/pdf/", label: "PDF to Image", note: "Convert PDF to JPG, PNG" },
      { href: "/edit/image/", label: "Image Editor", note: "Resize, rotate and flip" },
      { href: "/edit/pdf/", label: "Merge & Split PDF", note: "Combine PDFs or extract pages" },
    ],
    links: [
      { href: "/how-to-use/", label: "How to Use" },
      { href: "/guides/", label: "Guides" },
      { href: "/faq/", label: "FAQ" },
      { href: "/privacy-policy/", label: "Privacy Policy" },
      { href: "/terms/", label: "Terms of Service" },
      { href: "/about/", label: "About" },
      { href: "/contact/", label: "Contact" },
    ],
  },
  ko: {
    tools: "도구",
    toggle: "메뉴 열기",
    switchLabel: "English",
    toolItems: [
      { href: "/ko/view/exif/", label: "EXIF 뷰어", note: "사진에 숨은 위치·시간·기기 정보 확인" },
      { href: "/convert/img/?lang=ko", label: "이미지 변환기", note: "JPG·PNG·WebP 변환, 메타데이터 제거 (영문)" },
      { href: "/convert/pdf/", label: "PDF → 이미지", note: "PDF 페이지를 JPG·PNG로 (영문)" },
      { href: "/edit/image/?lang=ko", label: "이미지 편집기", note: "크기 조절, 회전, 반전 (영문)" },
      { href: "/edit/pdf/", label: "PDF 병합·분할", note: "PDF 합치기, 페이지 추출 (영문)" },
    ],
    links: [
      { href: "/ko/guides/", label: "가이드" },
      { href: "/faq/", label: "FAQ" },
      { href: "/privacy-policy/", label: "개인정보처리방침" },
      { href: "/about/", label: "소개" },
      { href: "/contact/", label: "문의" },
    ],
  },
};

export default function Navigation({ locale = "en" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const pathname = usePathname() ?? "/";
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  // 같은 페이지의 다른 언어판으로 보낸다. 한국어판이 없는 영어 페이지에서는 한국어 홈으로.
  const switchHref = locale === "ko" ? stripKo(normalized) : koPath(normalized) ?? "/ko/";
  const home = locale === "ko" ? "/ko/" : "/";

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

  const desktopLink = "hover:text-black text-black transition-all duration-300 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-200 hover:shadow-sm";
  const mobileLink = "hover:text-black text-black transition-all duration-300 font-medium px-6 py-4 hover:bg-gray-200 border-b border-gray-100";
  const switchLink = (
    <Link
      href={switchHref}
      hrefLang={locale === "ko" ? "en" : "ko"}
      lang={locale === "ko" ? "en" : "ko"}
      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-black transition-all duration-300 hover:bg-gray-200"
    >
      <Languages size={16} aria-hidden="true" />
      {t.switchLabel}
    </Link>
  );

  return (
    <div className="sticky top-0 w-full px-4 pt-6 pb-4 z-50 bg-white/80 backdrop-blur-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5 bg-white/95 rounded-3xl shadow-xl shadow-gray-200/30 border border-gray-200 hover:border-gray-300 transition-all duration-300 backdrop-blur-md relative">
        {/* Additional shadow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

        <Link href={home} className="font-bold text-xl text-black relative z-10">BravoConvert</Link>

        {/* Desktop menu */}
        <div className="hidden lg:flex items-center gap-2 text-sm relative z-10">
          {/* Tools dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={openDropdown}
            onMouseLeave={startCloseTimer}
          >
            <button className={`flex items-center gap-1 ${desktopLink}`}>
              {t.tools}
              <ChevronDown size={16} className={`transition-transform duration-200 ${isConverterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu — always in the DOM so crawlers see the tool links; visibility is CSS only */}
            <div
              className={`absolute top-full left-0 mt-1 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 overflow-hidden transition-opacity duration-200 ${isConverterOpen ? 'opacity-100' : 'pointer-events-none invisible opacity-0'}`}
              onMouseEnter={openDropdown}
              onMouseLeave={startCloseTimer}
            >
              {/* Top virtual padding area - expand mouse over area */}
              <div className="h-4 bg-transparent"></div>
              {t.toolItems.map((item) => (
                <Link key={item.href} href={item.href} className="block px-4 py-3 text-black hover:bg-gray-100 transition-all duration-200 border-b border-gray-100">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-600">{item.note}</div>
                </Link>
              ))}
              {/* Bottom virtual padding area - expand mouse over area */}
              <div className="h-4 bg-transparent"></div>
            </div>
          </div>

          {t.links.filter((item) => item.href !== "/contact/").map((item) => (
            <Link key={item.href} href={item.href} className={desktopLink}>{item.label}</Link>
          ))}
          <div className="ml-2">{switchLink}</div>
        </div>

        {/* Mobile: language switch stays visible next to the menu button */}
        <div className="lg:hidden relative z-10 flex items-center gap-2">
          {switchLink}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-black hover:text-gray-700 transition-colors"
            aria-label={t.toggle}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile dropdown menu — always in the DOM so crawlers see the tool links; visibility is CSS only */}
        <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden lg:hidden ${isMenuOpen ? '' : 'pointer-events-none invisible opacity-0'}`}>
          <div className="flex flex-col">
            {t.toolItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className={mobileLink}>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-600">{item.note}</div>
              </Link>
            ))}
            {t.links.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className={`${mobileLink} last:border-b-0`}>{item.label}</Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
