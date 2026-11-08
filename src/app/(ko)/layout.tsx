import type { Metadata } from "next";
import "../globals.css";
import Navigation from "@/components/Navigation";
import ConsentManager from "@/components/ConsentManager";
import SiteHead from "@/components/site/SiteHead";
import SiteFooter from "@/components/site/SiteFooter";

// 한국어판 루트 레이아웃. <html lang="ko"> 를 정적 HTML에 넣으려면 영어판과 별도의 루트 레이아웃이 필요하다.
export const metadata: Metadata = {
  metadataBase: new URL("https://bravoconvert.com"),
  title: "BravoConvert - 사진을 보내기 전에 위치·기기 정보 확인하고 지우기",
  description: "사진에 촬영 위치(GPS), 시간, 기기 정보가 들어 있는지 확인하고, 변환해서 지우세요. 파일은 브라우저 안에서만 처리되고 업로드되지 않습니다.",
  openGraph: {
    title: "BravoConvert - 사진이 무엇을 드러내는지 공유 전에 확인하세요",
    description: "사진 속 GPS 위치, 촬영 시간, 기기 정보를 확인하고 변환으로 지웁니다. 모든 처리는 브라우저 안에서 이루어집니다.",
    type: "website",
    locale: "ko_KR",
    url: "https://bravoconvert.com/ko/",
  },
  twitter: {
    card: "summary_large_image",
    title: "BravoConvert - 사진이 무엇을 드러내는지 공유 전에 확인하세요",
    description: "사진 속 GPS 위치, 촬영 시간, 기기 정보를 확인하고 지웁니다. 업로드는 없습니다.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function KoreanRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <SiteHead />
      </head>
      <body className="antialiased text-black break-keep">
        <ConsentManager locale="ko" />
        <Navigation locale="ko" />
        <div className="pt-8">
          {children}
        </div>
        <SiteFooter locale="ko" />
      </body>
    </html>
  );
}
