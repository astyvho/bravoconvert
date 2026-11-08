"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileSearch } from "lucide-react";
import type { Locale } from "@/lib/locale";
import { putHandoff, withHandoff } from "@/lib/file-handoff";

// 홈 첫 화면에서 바로 사진을 놓으면 EXIF 뷰어로 넘겨 곧장 결과를 보여 준다. 파일 선택은 이 한 번뿐이다.
const TEXT = {
  en: {
    drop: "Drop photos here to check them",
    choose: "Check a photo",
    sample: "Try a sample first",
    note: "JPG, PNG or WebP · several at once · read by your browser, never uploaded",
    inputLabel: "Choose photos to check",
    viewer: "/view/exif/",
  },
  ko: {
    drop: "사진을 여기에 놓으면 바로 확인합니다",
    choose: "사진 확인하기",
    sample: "샘플로 먼저 해보기",
    note: "JPG, PNG, WebP · 여러 장 가능 · 내 브라우저가 읽고, 업로드는 없습니다",
    inputLabel: "확인할 사진 선택",
    viewer: "/ko/view/exif/",
  },
};

export default function HomePhotoDrop({ locale = "en" }: { locale?: Locale }) {
  const t = TEXT[locale];
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const go = async (list: FileList | null | undefined) => {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    setBusy(true);
    const handed = await putHandoff(files);
    router.push(handed ? withHandoff(t.viewer) : t.viewer);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    go(event.dataTransfer.files);
  };

  return (
    <div
      data-home-drop
      className={`mx-auto max-w-2xl rounded-3xl border-2 border-dashed px-6 py-8 transition ${dragging ? "border-black bg-gray-200" : "border-gray-300 bg-gray-50"}`}
      onDragEnter={event => { event.preventDefault(); setDragging(true); }}
      onDragOver={event => event.preventDefault()}
      onDragLeave={event => { if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={onDrop}
    >
      <p className="hidden text-lg font-bold text-black sm:block">{t.drop}</p>
      <div className="flex flex-col items-stretch justify-center gap-3 sm:mt-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 font-bold text-white shadow-lg transition hover:bg-gray-800 disabled:opacity-50"
        >
          <FileSearch className="h-5 w-5" aria-hidden="true" />
          {t.choose}
        </button>
        <Link
          href={`${t.viewer}?sample=1`}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 font-bold text-black transition hover:bg-gray-200"
        >
          {t.sample}
        </Link>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={t.inputLabel}
        onChange={(event: ChangeEvent<HTMLInputElement>) => { go(event.target.files); event.target.value = ""; }}
      />
      <p className="mt-4 text-sm text-gray-500">{t.note}</p>
    </div>
  );
}
