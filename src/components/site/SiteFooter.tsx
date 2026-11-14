import Link from "next/link";
import type { Locale } from "@/lib/locale";
import PageContainer from "./page-container";
import PrivacyChoicesButton from "./privacy-choices-button";

const LINK = "text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground";

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

const PRIVACY_CHOICES: Record<Locale, string> = { en: "Privacy choices", ko: "개인정보 선택" };

export default function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-16 border-t border-border">
      <PageContainer className="py-10">
        {/* Tool links are in every page's static HTML so crawlers can follow them without the menu. */}
        <nav aria-label={locale === "ko" ? "도구" : "Tools"} className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {TOOLS[locale].map((item) => (
            <Link key={item.href} href={item.href} className={LINK}>{item.label}</Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {PAGES[locale].map((item) => (
            <Link key={item.href} href={item.href} className={LINK}>{item.label}</Link>
          ))}
        </div>
        {locale === "ko" && (
          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            EXIF 뷰어와 가이드는 한국어로, 나머지 도구와 안내 페이지는 영어로 제공됩니다.
          </p>
        )}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm font-semibold text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} BravoConvert</span>
          <PrivacyChoicesButton label={PRIVACY_CHOICES[locale]} />
        </div>
      </PageContainer>
    </footer>
  );
}
