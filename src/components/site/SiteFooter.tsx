import Link from "next/link";
import type { Locale } from "@/lib/locale";

const LINK = "hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300";

const TOOLS: Record<Locale, { href: string; label: string }[]> = {
  en: [
    { href: "/view/exif/", label: "EXIF Viewer" },
    { href: "/convert/img/", label: "Image Converter" },
    { href: "/convert/pdf/", label: "PDF to Image Converter" },
    { href: "/edit/image/", label: "Image Editor" },
    { href: "/edit/pdf/", label: "Merge & Split PDF" },
  ],
  ko: [
    { href: "/ko/view/exif/", label: "EXIF 뷰어" },
    { href: "/convert/img/?lang=ko", label: "이미지 변환기" },
    { href: "/convert/pdf/", label: "PDF → 이미지" },
    { href: "/edit/image/?lang=ko", label: "이미지 편집기" },
    { href: "/edit/pdf/", label: "PDF 병합·분할" },
  ],
};

const PAGES: Record<Locale, { href: string; label: string }[]> = {
  en: [
    { href: "/how-to-use/", label: "How to Use" },
    { href: "/guides/", label: "Guides" },
    { href: "/faq/", label: "FAQ" },
    { href: "/changelog/", label: "Changelog" },
    { href: "/privacy-policy/", label: "Privacy Policy" },
    { href: "/terms/", label: "Terms of Service" },
    { href: "/about/", label: "About" },
    { href: "/contact/", label: "Contact" },
  ],
  ko: [
    { href: "/ko/guides/", label: "가이드" },
    { href: "/faq/", label: "FAQ" },
    { href: "/privacy-policy/", label: "개인정보처리방침" },
    { href: "/terms/", label: "이용약관" },
    { href: "/about/", label: "소개" },
    { href: "/contact/", label: "문의" },
  ],
};

export default function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <div className="w-full px-4 pt-8 pb-6">
      <footer className="max-w-6xl mx-auto text-center text-xs text-black py-8 bg-white/70 rounded-3xl shadow-lg shadow-gray-200/20 border border-gray-100/50 backdrop-blur-sm">
        <div className="mb-4">
          {/* 도구 링크 — 모든 페이지의 정적 HTML에 포함되어야 크롤러가 따라갈 수 있다 */}
          <nav aria-label={locale === "ko" ? "도구" : "Tools"} className="mb-4 flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm font-medium">
            {TOOLS[locale].map((item) => (
              <Link key={item.href} href={item.href} className={LINK}>{item.label}</Link>
            ))}
          </nav>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {PAGES[locale].map((item) => (
              <Link key={item.href} href={item.href} className={LINK}>{item.label}</Link>
            ))}
          </div>
          {locale === "ko" && (
            <p className="mt-4 text-gray-500">
              EXIF 뷰어와 개인정보 가이드는 한국어로, 나머지 도구와 안내 페이지는 영어로 제공됩니다.
            </p>
          )}
        </div>
        <div className="text-black font-medium">© {new Date().getFullYear()} BravoConvert</div>
      </footer>
    </div>
  );
}
