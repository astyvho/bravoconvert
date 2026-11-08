"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

// EXIF 뷰어·한국어 페이지에서 변환기/편집기로 넘어온 경우, 변환하면 위치·시간·기기 정보가 지워진다는 것을
// 도구 화면 맨 위에서 바로 알려 준다. 링크에 ?from=exif, ?lang=ko 를 붙여 넘어온다.
// 정적 내보내기라 useSearchParams 대신 마운트 후 location 을 읽는다(검색 엔진용 HTML 에는 나오지 않음).
type Tool = "converter" | "editor";

const TEXT = {
  en: {
    title: "Converting removes the photo's hidden information",
    body: (tool: Tool) =>
      tool === "converter"
        ? "Files saved here are rebuilt from their pixels, so GPS location, capture time, device model and other EXIF fields are not copied into them. Choose the photo again, convert it, then open the result in the EXIF viewer to confirm."
        : "Exported images are rebuilt from their pixels, so GPS location, capture time, device model and other EXIF fields are not copied into them. Open the export in the EXIF viewer to confirm.",
    back: "Back to the EXIF viewer",
    href: "/view/exif/",
  },
  ko: {
    title: "변환하면 사진에 숨은 정보가 지워집니다",
    body: (tool: Tool) =>
      tool === "converter"
        ? "여기서 저장한 파일은 픽셀에서 새로 만들어지기 때문에 위치(GPS), 촬영 시간, 기기 모델 같은 EXIF 정보가 들어가지 않습니다. 화면은 영어입니다. 'Select Images'로 사진을 고르고, 형식을 정한 뒤 'Convert All'을 누르면 됩니다. 받은 파일은 EXIF 뷰어로 다시 확인하세요."
        : "내보낸 이미지는 픽셀에서 새로 만들어지기 때문에 위치(GPS), 촬영 시간, 기기 모델 같은 EXIF 정보가 들어가지 않습니다. 화면은 영어입니다. 내보낸 파일은 EXIF 뷰어로 다시 확인하세요.",
    back: "EXIF 뷰어로 돌아가기",
    href: "/ko/view/exif/",
  },
};

export default function MetadataRemovalNotice({ tool }: { tool: Tool }) {
  const [locale, setLocale] = useState<"en" | "ko" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ko = params.get("lang") === "ko";
    if (ko || params.get("from") === "exif") setLocale(ko ? "ko" : "en");
  }, []);

  if (!locale) return null;
  const t = TEXT[locale];
  return (
    <aside
      lang={locale}
      data-metadata-notice
      className="mx-auto mb-6 mt-2 flex max-w-4xl items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-900 break-keep"
    >
      <ShieldCheck className="mt-0.5 h-6 w-6 flex-shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-bold">{t.title}</p>
        <p className="mt-1 text-sm leading-6">{t.body(tool)}</p>
        <Link href={t.href} className="mt-2 inline-block text-sm font-semibold underline">{t.back}</Link>
      </div>
    </aside>
  );
}
