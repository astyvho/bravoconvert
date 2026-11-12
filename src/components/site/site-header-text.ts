import type { Locale } from "@/lib/locale";

export type NavItem = { href: string; label: string; note?: string };

export type HeaderText = {
  tools: string;
  toggle: string;
  menuTitle: string;
  switchLabel: string;
  cta: string;
  ctaHref: string;
  toolItems: NavItem[];
  /** Shown in the desktop pill navigation next to the Tools menu. */
  primaryLinks: NavItem[];
  /** Everything else, shown in the mobile sheet (and the footer). */
  links: NavItem[];
};

// Moved from the old Navigation.tsx unchanged, with the CTA and sheet title added.
export const HEADER_TEXT: Record<Locale, HeaderText> = {
  en: {
    tools: "Tools",
    toggle: "Toggle menu",
    menuTitle: "Menu",
    switchLabel: "한국어",
    cta: "Check a photo",
    ctaHref: "/view/exif/",
    toolItems: [
      { href: "/view/exif/", label: "EXIF Viewer", note: "See a photo's hidden metadata" },
      { href: "/convert/img/", label: "Image Converter", note: "PNG, JPG, WEBP, PDF & more" },
      { href: "/convert/pdf/", label: "PDF to Image", note: "Convert PDF to JPG, PNG" },
      { href: "/edit/image/", label: "Image Editor", note: "Resize, rotate and flip" },
      { href: "/edit/pdf/", label: "Merge & Split PDF", note: "Combine PDFs or extract pages" },
    ],
    primaryLinks: [
      { href: "/guides/", label: "Guides" },
      { href: "/faq/", label: "FAQ" },
      { href: "/about/", label: "About" },
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
    menuTitle: "메뉴",
    switchLabel: "English",
    cta: "사진 확인하기",
    ctaHref: "/ko/view/exif/",
    toolItems: [
      { href: "/ko/view/exif/", label: "EXIF 뷰어", note: "사진에 숨은 위치·시간·기기 정보 확인" },
      { href: "/convert/img/?lang=ko", label: "이미지 변환기", note: "JPG·PNG·WebP 변환, 메타데이터 제거 (영문)" },
      { href: "/convert/pdf/", label: "PDF → 이미지", note: "PDF 페이지를 JPG·PNG로 (영문)" },
      { href: "/edit/image/?lang=ko", label: "이미지 편집기", note: "크기 조절, 회전, 반전 (영문)" },
      { href: "/edit/pdf/", label: "PDF 병합·분할", note: "PDF 합치기, 페이지 추출 (영문)" },
    ],
    primaryLinks: [
      { href: "/ko/guides/", label: "가이드" },
      { href: "/faq/", label: "FAQ" },
      { href: "/about/", label: "소개" },
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
