import type { Metadata } from "next";
import { BarChart3, Fingerprint, FileText, Files, LifeBuoy, Library, Minimize2 } from "lucide-react";
import ContentHeader from "@/components/content/content-header";
import ToolCard from "@/components/home/tool-card";
import type { IconTileTone } from "@/components/tool/icon-tile";
import benchmarks from "@/data/format-benchmarks.json";
import exifDemo from "@/data/exif-demo.json";
import pdfMetaDemo from "@/data/pdf-metadata-demo.json";
import { alternatesFor } from "@/lib/locale";

export const metadata: Metadata = {
  title: "가이드: 이미지와 PDF에 관해 직접 측정한 답 | BravoConvert",
  description:
    "사진의 EXIF 위치정보와 PDF의 작성자·메모가 변환 후에도 남는지, JPG·PNG·WebP 중 무엇이 작은지, PDF를 이미지로 바꾸면 해상도가 얼마인지. 사이트가 쓰는 것과 같은 브라우저 엔진에서 직접 측정한 가이드 7편입니다.",
  alternates: alternatesFor("/guides/", "ko"),
  openGraph: {
    title: "가이드: 이미지와 PDF에 관해 직접 측정한 답",
    description: "짐작이 아니라 측정입니다. 시험 파일도 공개해 직접 확인할 수 있습니다.",
    type: "website",
    locale: "ko_KR",
  },
};

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;
const photo = benchmarks.samples.find((s) => s.id === "photo")!;
const detail = benchmarks.samples.find((s) => s.id === "detail")!;
const half = benchmarks.resize.rows.find((r) => r.scale === 0.5)!;
const at = (s: typeof photo, codec: "jpeg" | "webp", q: number) => s[codec].find((e) => e.quality === q)!.bytes;
const pdfJpg95 = benchmarks.pdfPage.jpeg.find((e) => e.quality === 0.95)!.bytes;

const groups = [
  {
    heading: "파일이 드러내는 정보",
    blurb: "사진과 PDF 안에 함께 다니는 정보, 그리고 그걸 지우려면 무엇이 필요한지. 짐작하지 않고 시험했습니다.",
    items: [
      {
        href: "/ko/guides/exif-metadata-privacy/",
        icon: Fingerprint,
        title: "사진 EXIF와 개인정보",
        description:
          "GPS 좌표, 카메라 모델, 촬영 시각을 넣은 사진을 변환한 뒤 필드별로 다시 읽었습니다. 메타데이터를 지워도 막을 수 없는 것도 다룹니다.",
        finding: `${exifDemo.before.length}개 필드 중 변환 후 남은 것: ${exifDemo.after.filter((f) => f.value !== null).length}개`,
      },
      {
        href: "/ko/guides/pdf-metadata-privacy/",
        icon: FileText,
        title: "PDF가 드러내는 것",
        description:
          "작성자, 초안 제목, 키워드, XMP, 검토자 메모를 넣은 PDF를 병합·추출·분할·이미지 변환했습니다. 속성은 사라졌지만 메모는 남았습니다.",
        finding: pdfMetaDemo.coveredText.extractableAfterExtract
          ? "검은 상자로 가린 글자: 추출 후에도 그대로 읽힘"
          : "검은 상자로 가린 글자: 추출 후 읽히지 않음",
      },
    ],
  },
  {
    heading: "형식과 용량 고르기",
    blurb: "파일을 가장 크게 바꾸는 두 가지 결정과, 그 뒤에 있는 숫자.",
    items: [
      {
        href: "/ko/guides/jpg-png-webp-comparison/",
        icon: BarChart3,
        title: "JPG, PNG, WebP 비교",
        description:
          "테스트 이미지 세 장을 화질 네 단계로 저장하고 용량을 모두 공개했습니다. 투명 배경, 호환성, 각 형식이 맞지 않는 경우까지 다룹니다.",
        finding: `WebP가 항상 작진 않습니다. 촘촘한 질감을 화질 0.4로 저장하니 JPG ${kb(at(detail, "jpeg", 0.4))}, WebP ${kb(
          at(detail, "webp", 0.4)
        )}`,
      },
      {
        href: "/ko/guides/reduce-image-file-size/",
        icon: Minimize2,
        title: "이미지 용량 줄이기",
        description:
          "형식, 크기, 화질, 메타데이터를 같은 사진 한 장으로 비교했습니다. 어떤 방법부터 쓰는 게 효과적인지 숫자로 볼 수 있습니다.",
        finding: `형식과 크기만 바꿔도 ${kb(photo.png)} → ${kb(half.webp)}. 가로세로를 절반으로 줄이면 픽셀은 4분의 1, 용량은 5분의 1도 안 남습니다.`,
      },
    ],
  },
  {
    heading: "PDF 다루기",
    blurb: "문서를 이미지로 바꾸면 실제로 무엇이 나오는지.",
    items: [
      {
        href: "/ko/guides/pdf-to-image-use-cases/",
        icon: Files,
        title: "PDF를 이미지로 바꾸기",
        description: "아무도 알려 주지 않는 결과 해상도, 용지별 픽셀 크기 표, 그리고 PDF 그대로 두는 게 나은 경우.",
        finding: `페이지는 ${benchmarks.pdfPage.dpi} DPI로 그려져 A4가 ${benchmarks.pdfPage.pixelSize.width}×${
          benchmarks.pdfPage.pixelSize.height
        }가 됩니다. 글자 문서에서는 JPG가 PNG보다 ${(pdfJpg95 / benchmarks.pdfPage.png).toFixed(1)}배 컸습니다.`,
      },
    ],
  },
  {
    heading: "참고 자료",
    blurb: "뭔가 잘 안 될 때, 또는 용어 뜻이 헷갈릴 때.",
    items: [
      {
        href: "/ko/guides/troubleshooting/",
        icon: LifeBuoy,
        title: "변환이 안 될 때",
        description:
          "파일이 거부되는 이유, 작업이 멈추는 이유, 다운로드가 사라지는 이유를 해결법과 원인까지 함께. 모든 도구의 실제 형식·용량 한도도 정리했습니다.",
        finding: "실패는 대부분 한 가지로 설명됩니다. 작업이 내 기기에서 돌아가니, 한도는 서버가 아니라 내 메모리입니다.",
      },
      {
        href: "/ko/guides/glossary/",
        icon: Library,
        title: "이미지·PDF 용어 정리",
        description: "해상도, DPI, 손실·무손실, 투명 채널, 크로마 서브샘플링, 벡터와 래스터를 쉬운 말로, 실제로 무엇이 달라지는지와 함께.",
        finding: "가나다순이 아니라 주제별로 묶어서, 필요한 묶음만 읽으면 됩니다.",
      },
    ],
  },
];

const TONES: IconTileTone[] = ["blue", "yellow", "green", "pink", "peach"];

export default function KoreanGuidesIndex() {
  return (
    <main>
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 break-keep sm:px-6">
        <ContentHeader label="가이드" title="가이드">
          <p className="mt-3 text-lg leading-relaxed text-foreground">
            &ldquo;변환하면 지워진다&rdquo;, &ldquo;WebP가 더 작다&rdquo;를 짐작으로 쓰지 않고 직접 측정했습니다. 시험에 쓴
            파일도 공개해 두었습니다.
          </p>
        </ContentHeader>

        <div className="mt-12 space-y-12">
          {groups.map((group, groupIndex) => (
            <section key={group.heading}>
              <h2 className="text-h2 text-foreground">{group.heading}</h2>
              <p className="mt-2 max-w-[720px] text-muted-foreground">{group.blurb}</p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {group.items.map((item, itemIndex) => (
                  <ToolCard
                    key={item.href}
                    icon={item.icon}
                    tone={TONES[(groupIndex * 2 + itemIndex) % TONES.length]}
                    title={item.title}
                    body={item.description}
                    note={
                      <>
                        <strong className="text-foreground">측정 결과:</strong> {item.finding}
                      </>
                    }
                    href={item.href}
                    cta="가이드 읽기"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
