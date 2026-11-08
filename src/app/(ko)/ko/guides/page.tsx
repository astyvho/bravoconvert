import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Fingerprint, FileText } from "lucide-react";
import exifDemo from "@/data/exif-demo.json";
import pdfMetaDemo from "@/data/pdf-metadata-demo.json";
import { alternatesFor } from "@/lib/locale";

export const metadata: Metadata = {
  title: "가이드: 파일이 드러내는 정보를 직접 측정했습니다 | BravoConvert",
  description:
    "사진의 EXIF 위치정보와 PDF의 작성자·메모가 변환 후에도 남는지, 사이트가 쓰는 것과 같은 브라우저 엔진에서 직접 실험한 결과를 정리했습니다.",
  alternates: alternatesFor("/guides/", "ko"),
  openGraph: {
    title: "가이드: 파일이 드러내는 정보를 직접 측정했습니다",
    description: "짐작이 아니라 측정입니다. 시험 파일도 공개해 직접 확인할 수 있습니다.",
    type: "website",
    locale: "ko_KR",
  },
};

const guides = [
  {
    href: "/ko/guides/exif-metadata-privacy/",
    icon: Fingerprint,
    title: "사진 EXIF와 개인정보",
    summary: "GPS 좌표, 카메라 모델, 촬영 시각을 넣은 사진을 변환한 뒤 필드별로 다시 읽었습니다. 메타데이터를 지워도 막을 수 없는 것도 다룹니다.",
    finding: `${exifDemo.before.length}개 필드 중 변환 후 남은 것: ${exifDemo.after.filter((f) => f.value !== null).length}개`,
  },
  {
    href: "/ko/guides/pdf-metadata-privacy/",
    icon: FileText,
    title: "PDF가 드러내는 것",
    summary: "작성자, 초안 제목, 키워드, XMP, 검토자 메모를 넣은 PDF를 병합·추출·분할·이미지 변환했습니다. 속성은 사라졌지만 메모는 남았습니다.",
    finding: pdfMetaDemo.coveredText.extractableAfterExtract
      ? "검은 상자로 가린 글자: 추출 후에도 그대로 읽힘"
      : "검은 상자로 가린 글자: 추출 후 읽히지 않음",
  },
];

const english = [
  { href: "/guides/jpg-png-webp-comparison/", title: "JPG, PNG, WebP 비교" },
  { href: "/guides/reduce-image-file-size/", title: "이미지 용량 줄이기" },
  { href: "/guides/pdf-to-image-use-cases/", title: "PDF를 이미지로 바꿀 때의 해상도와 용량" },
  { href: "/guides/troubleshooting/", title: "문제 해결" },
  { href: "/guides/glossary/", title: "용어 정리" },
];

export default function KoreanGuidesIndex() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <BookOpen className="mr-4 h-14 w-14 flex-shrink-0 text-gray-700" aria-hidden="true" />
            가이드
          </h1>
          <p className="text-lg text-gray-700">
            &ldquo;변환하면 지워진다&rdquo;를 짐작으로 쓰지 않고 직접 측정했습니다. 시험에 쓴 파일도 공개해 두었습니다.
          </p>
        </header>

        <div className="space-y-6">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.href}
                href={guide.href}
                className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gray-400 hover:shadow-xl"
              >
                <div className="mb-2 flex items-center gap-3">
                  <Icon className="h-8 w-8 flex-shrink-0 text-gray-700" aria-hidden="true" />
                  <h2 className="text-2xl font-bold text-black group-hover:underline">{guide.title}</h2>
                </div>
                <p className="leading-7 text-gray-700">{guide.summary}</p>
                <p className="mt-3 inline-block rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-black">{guide.finding}</p>
              </Link>
            );
          })}
        </div>

        <section className="mt-12 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-2 text-xl font-bold text-black">영어로만 있는 가이드</h2>
          <p className="mb-4 text-sm leading-6 text-gray-600">
            형식 비교와 용량에 관한 측정은 아직 영어로만 제공됩니다. 표와 수치는 언어와 관계없이 읽을 수 있습니다.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {english.map((item) => (
              <li key={item.href}>
                <Link href={item.href} hrefLang="en" className="underline font-medium text-black">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
