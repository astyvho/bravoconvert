"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { HANDOFF_PARAM } from "@/lib/file-handoff";

// EXIF 뷰어·한국어 페이지에서 변환기/편집기로 넘어온 경우, 변환하면 위치·시간·기기 정보가 지워진다는 것을
// 도구 화면 맨 위에서 바로 알려 준다. 링크에 ?from=exif, ?lang=ko, ?handoff=1(사진을 그대로 넘김)이 붙어 온다.
// 정적 내보내기라 useSearchParams 대신 마운트 후 location 을 읽는다(검색 엔진용 HTML 에는 나오지 않음).
// 색은 "완료"로 읽히는 초록 대신 중립적인 파랑을 쓴다 — 할 일을 알려 주는 안내이기 때문이다.
type Tool = "converter" | "editor";

const TEXT = {
  en: {
    title: "Saving here leaves the photo's hidden information behind",
    body: "Files are rebuilt from their pixels, so GPS location, capture time, device model and other EXIF fields are not copied into them.",
    next: (tool: Tool, handed: boolean) =>
      handed
        ? tool === "converter" ? "The photos you were checking are already added below." : "The photo you were checking is already open below."
        : tool === "converter" ? "Add the photo below, convert it, then check the result in the EXIF viewer." : "Open the photo below, export it, then check the result in the EXIF viewer.",
    back: "Back to the EXIF viewer",
    href: "/view/exif/",
  },
  ko: {
    title: "여기서 저장한 사진에는 위치·시간 정보가 안 들어가요",
    body: "사진을 새로 그려서 저장하기 때문에 GPS 위치, 찍은 시간, 기기 이름 같은 정보는 따라오지 않아요. (이 화면은 영어예요)",
    next: (tool: Tool, handed: boolean) =>
      handed
        ? tool === "converter" ? "보던 사진은 아래에 이미 넣어 뒀어요. 형식을 고르고 'Convert All'을 누르세요." : "보던 사진을 아래에 열어 뒀어요. 손본 다음 내보내기 버튼으로 받으세요."
        : tool === "converter" ? "'Select Images'로 사진을 고르고 'Convert All'을 누르세요. 받은 파일은 EXIF 뷰어에서 다시 확인할 수 있어요." : "아래에서 사진을 열고 내보내세요. 받은 파일은 EXIF 뷰어에서 다시 확인할 수 있어요.",
    back: "EXIF 뷰어로 돌아가기",
    href: "/ko/view/exif/",
  },
};

export default function MetadataRemovalNotice({ tool }: { tool: Tool }) {
  const [state, setState] = useState<{ locale: "en" | "ko"; handed: boolean } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ko = params.get("lang") === "ko";
    if (ko || params.get("from") === "exif") setState({ locale: ko ? "ko" : "en", handed: params.get(HANDOFF_PARAM) === "1" });
  }, []);

  if (!state) return null;
  const t = TEXT[state.locale];
  return (
    <aside
      lang={state.locale}
      data-metadata-notice
      className="mx-auto mb-6 mt-2 flex max-w-4xl items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-brand-900 break-keep"
    >
      <ShieldCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-brand-600" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-bold">{t.title}</p>
        <p className="mt-1 text-sm leading-6">{t.body} {t.next(tool, state.handed)}</p>
        <Link href={t.href} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t.back}
        </Link>
      </div>
    </aside>
  );
}
