"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { FileSearch } from "lucide-react";
import type { Locale } from "@/lib/locale";
import { putHandoff, withHandoff } from "@/lib/file-handoff";
import { Button, buttonVariants } from "@/components/ui/button";
import DropZone from "@/components/tool/drop-zone";

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
    drop: "사진을 여기로 끌어오면 바로 확인해요",
    choose: "사진 확인하기",
    sample: "샘플로 먼저 해보기",
    note: "JPG, PNG, WebP · 여러 장 가능 · 서버로 올라가지 않아요",
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

  // The input is in the static HTML, so a photo can be chosen before React attaches
  // onChange (slow phones, slow networks). Pick up anything chosen in that window.
  useEffect(() => {
    const input = inputRef.current;
    if (input?.files?.length) {
      go(input.files);
      input.value = "";
    }
    // Runs once after hydration; `go` is recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    go(event.dataTransfer.files);
  };

  return (
    <DropZone
      data-home-drop
      className="mx-auto max-w-[760px]"
      title={t.drop}
      note={t.note}
      icon={FileSearch}
      dragging={dragging}
      busy={busy}
      onDragEnter={event => { event.preventDefault(); setDragging(true); }}
      onDragOver={event => event.preventDefault()}
      onDragLeave={event => { if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={onDrop}
      actions={
        <>
          <Button type="button" size="lg" onClick={() => inputRef.current?.click()} disabled={busy}>
            <FileSearch aria-hidden="true" />
            {t.choose}
          </Button>
          <Link href={`${t.viewer}?sample=1`} className={buttonVariants({ variant: "secondary", size: "lg" })}>
            {t.sample}
          </Link>
        </>
      }
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={t.inputLabel}
        onChange={(event: ChangeEvent<HTMLInputElement>) => { go(event.target.files); event.target.value = ""; }}
      />
    </DropZone>
  );
}
