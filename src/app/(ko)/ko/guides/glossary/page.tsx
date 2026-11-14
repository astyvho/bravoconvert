import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import Prose from "@/components/tool/prose";
import Link from "next/link";
import benchmarks from "@/data/format-benchmarks.json";
import { alternatesFor } from "@/lib/locale";

const PUBLISHED = "2026-11-14";
const UPDATED = benchmarks.generatedAt;

export const metadata: Metadata = {
  title: "이미지·PDF 용어 정리 | BravoConvert",
  description:
    "해상도, DPI, 손실 압축, 투명 채널, EXIF, 크로마 서브샘플링처럼 이미지와 PDF를 변환할 때 나오는 용어를 쉬운 말로 풀고, 실제로 파일에 어떤 차이를 만드는지 정리했습니다.",
  alternates: alternatesFor("/guides/glossary/", "ko"),
  openGraph: {
    title: "이미지·PDF 용어 정리",
    description: "용어의 뜻과, 그게 변환 결과를 어떻게 바꾸는지.",
    type: "article",
    locale: "ko_KR",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const photo = benchmarks.samples.find((s) => s.id === "photo")!;
const jpegAt = (q: number) => photo.jpeg.find((e) => e.quality === q)!.bytes;
const qualityJump = (jpegAt(0.95) / jpegAt(0.8)).toFixed(1);
const pngVsJpeg = Math.round(photo.png / jpegAt(0.8));

type Group = { id: string; name: string };

const GROUPS: Group[] = [
  { id: "size", name: "크기와 모양" },
  { id: "compression", name: "용량이 줄어드는 원리" },
  { id: "colour", name: "색과 투명도" },
  { id: "metadata", name: "메타데이터와 개인정보" },
  { id: "pdf", name: "PDF" },
  { id: "files", name: "파일 다루기" },
];

type Term = { term: string; group: Group["id"]; body: string; practical?: string };

const terms: Term[] = [
  {
    term: "픽셀",
    group: "size",
    body: "이미지를 이루는 가장 작은 단위로, 한 가지 색으로 칠해진 작은 칸 하나입니다. 이 페이지의 나머지 용어는 결국 픽셀이 몇 개인지, 어떻게 저장되는지, 얼마나 충실하게 재현되는지에 관한 이야기입니다.",
  },
  {
    term: "해상도",
    group: "size",
    body: "이미지의 가로세로 픽셀 수로, 1920×1080처럼 씁니다. 파일이 담을 수 있는 디테일의 양을 뜻할 뿐, 실제 물리적 크기와는 관계가 없습니다.",
    practical: "형식 다음으로 용량을 가장 크게 좌우합니다. 가로세로를 절반으로 줄이면 픽셀의 4분의 3이 사라집니다.",
  },
  {
    term: "메가픽셀(화소)",
    group: "size",
    body: "100만 픽셀입니다. 가로×세로를 100만으로 나누면 됩니다. 4000×3000 사진은 1,200만 화소입니다.",
    practical:
      "메모리 부담을 가늠할 때 쓸모 있습니다. 처리하는 동안 1메가픽셀마다 약 4 MB의 메모리가 필요해서, 아주 큰 사진은 휴대폰에서 실패하곤 합니다.",
  },
  {
    term: "화면비(가로세로 비율)",
    group: "size",
    body: "16:9, 4:3처럼 가로와 세로의 비율입니다. 해상도가 전혀 달라도 화면비는 같을 수 있습니다.",
    practical: "크기를 바꿀 때 일부러 늘리려는 게 아니라면 비율 고정을 켜 두세요. 사진이 납작하게 찌그러지는 건 대개 이걸 풀었기 때문입니다.",
  },
  {
    term: "DPI (인치당 점 수)",
    group: "size",
    body: "이미지를 특정 크기로 인쇄할 때 픽셀이 얼마나 촘촘하게 찍히는지를 나타냅니다. 파일이 아니라 인쇄의 속성이라, DPI 숫자만 바꿔서는 디테일이 늘지 않습니다.",
    practical: `PDF 변환기는 페이지를 ${benchmarks.pdfPage.dpi} DPI로 그려서 화면에서는 선명합니다. 인쇄소는 보통 300 DPI를 요구합니다.`,
  },

  {
    term: "손실 압축",
    group: "compression",
    body: "이미지 디테일 일부를 영구히 버려서 파일을 작게 만드는 방식입니다. JPG와 손실 WebP가 이렇게 동작하고, 눈이 가장 덜 알아채는 부분을 골라 버립니다.",
    practical: "다시 저장할 때마다 조금씩 더 잃습니다. JPG를 편집하고 저장하기를 반복하면 손상이 쌓이니, 가능하면 원본에서 작업하세요.",
  },
  {
    term: "무손실 압축",
    group: "compression",
    body: "손실 없이 파일을 줄이는 방식으로, 압축을 풀면 원래 픽셀이 정확히 그대로 돌아옵니다. PNG와 무손실 WebP가 이렇게 동작합니다.",
    practical: `무손실이라고 더 작은 건 아닙니다. 테스트 사진은 PNG가 같은 사진의 JPG(화질 0.8)보다 약 ${pngVsJpeg}배 컸습니다.`,
  },
  {
    term: "화질 설정",
    group: "compression",
    body: "손실 형식에서 디테일을 얼마나 과감하게 버릴지 정하는 값으로, 보통 0~1이나 0~100으로 표시합니다.",
    practical: `눈금이 고르지 않습니다. 테스트 사진에서 화질을 0.8에서 0.95로 올리자, 대부분 구분하지 못하는 차이 때문에 용량이 약 ${qualityJump}배가 됐습니다.`,
  },
  {
    term: "압축 깨짐(아티팩트)",
    group: "compression",
    body: "손실 압축이 남기는 눈에 보이는 손상입니다. 부드러운 그러데이션의 깍두기 무늬, 또렷한 경계 주변의 번짐, 뭉개진 질감 같은 것들입니다.",
    practical: "깨짐은 글자와 선명한 선 주변에서 먼저 보입니다. 그래서 손실 형식은 사진에는 맞고 화면 캡처에는 잘 맞지 않습니다.",
  },
  {
    term: "크로마 서브샘플링",
    group: "compression",
    body: "JPG가 쓰는 기법으로, 색 정보를 밝기 정보보다 낮은 해상도로 저장합니다. 사람 눈이 색보다 밝기의 디테일에 훨씬 민감하다는 점을 이용합니다.",
    practical: "가는 빨간 글씨가 PNG보다 JPG에서 탁해 보이는 이유 중 하나입니다.",
  },
  {
    term: "목표 용량",
    group: "compression",
    body: "원하는 용량을 KB로 정하면 변환기가 그 아래로 들어가는 화질 값을 찾는 기능입니다. 여러 번 다시 저장해 보고 가장 가까운 결과를 남깁니다.",
    practical: "계산이 아니라 다가가는 방식입니다. 노이즈가 많은 사진은 단순한 그래픽보다 도달할 수 있는 하한이 훨씬 높습니다.",
  },

  {
    term: "알파 채널(투명 채널)",
    group: "colour",
    body: "색과 함께 픽셀마다 저장되는 투명도 값입니다. 덕분에 로고가 흰 네모 없이 어떤 배경 위에도 깔끔하게 놓입니다.",
    practical: "PNG와 WebP에는 있고 JPG에는 없습니다. 투명한 이미지를 JPG로 바꾸면 투명한 부분이 단색으로 채워집니다.",
  },
  {
    term: "색 깊이",
    group: "colour",
    body: "픽셀 하나를 몇 비트로 표현하는지입니다. 보통의 웹 이미지는 채널당 8비트로 빨강, 초록, 파랑을 각각 256단계로 나타냅니다.",
    practical: "색 깊이가 낮으면 계단 현상(밴딩)이 생깁니다. 매끄러워야 할 그러데이션에 단계가 보이는 것으로, 하늘에서 특히 눈에 띕니다.",
  },
  {
    term: "색 프로필",
    group: "colour",
    body: "파일 속 숫자가 어떤 색 공간 기준인지 알려 주는 표시입니다. sRGB, Display P3 등이 있고, 같은 RGB 값도 색 공간에 따라 다른 색이 됩니다.",
    practical: "한 앱에서는 선명하고 다른 앱에서는 밋밋해 보인다면, 변환 문제라기보다 대개 프로필이 맞지 않아서입니다.",
  },

  {
    term: "EXIF 메타데이터",
    group: "metadata",
    body: "카메라와 휴대폰이 사진 안에 함께 적어 두는 정보입니다. 촬영 시각, 기종, 노출 설정, 방향 정보, 그리고 자주 GPS 좌표가 들어갑니다.",
    practical: "사진에는 보이지 않지만 흔한 도구로 쉽게 읽힙니다. 변환 뒤에 무엇이 남는지는 사진 위치 정보 가이드에서 직접 확인했습니다.",
  },
  {
    term: "방향 정보(Orientation)",
    group: "metadata",
    body: "사진을 어느 쪽이 위로 오게 보여 줄지 알려 주는 EXIF 항목입니다. 휴대폰은 픽셀을 돌리지 않고 찍힌 그대로 저장한 뒤 이 정보만 적는 경우가 많습니다.",
    practical: "이 정보를 무시하는 프로그램에서는 사진이 옆으로 누워 보입니다. BravoConvert는 이를 읽어 회전을 픽셀에 반영하므로 결과에는 방향 정보가 필요 없습니다.",
  },

  {
    term: "렌더링(PDF)",
    group: "pdf",
    body: "PDF 페이지의 벡터 명령을 픽셀 캔버스에 그려 이미지로 저장할 수 있게 만드는 과정입니다. 페이지 자체 좌표계에 대해 정한 배율로 그립니다.",
    practical: "PDF는 1인치를 72포인트로 재므로, 배율 2로 그리면 144 DPI가 됩니다.",
  },
  {
    term: "벡터와 래스터",
    group: "pdf",
    body: "벡터는 어떤 크기로든 다시 그릴 수 있는 도형과 글자로 저장되고, 래스터는 고정된 픽셀 격자입니다. PDF의 글자는 대개 벡터이고, 이미지는 항상 래스터입니다.",
    practical: "PDF 페이지를 이미지로 바꾸면 벡터가 래스터가 됩니다. 그래서 확대하면 흐려지고 글자를 더는 선택할 수 없습니다.",
  },

  {
    term: "일괄 변환",
    group: "files",
    body: "여러 파일을 한 번에 같은 형식으로 바꾸는 것입니다.",
    practical: "파일이 두 개 이상이면 ZIP으로 받습니다. 아이폰에서는 ZIP을 한 번 눌러야 풀립니다.",
  },
  {
    term: "비파괴 편집",
    group: "files",
    body: "편집 내용을 작업용 사본에 대한 명령으로만 들고 있다가, 내보낼 때까지 원본을 건드리지 않는 방식입니다.",
    practical: "초기화를 누르면 원본이 그대로 돌아오고, 편집기에서 무엇을 해도 디스크의 파일이 바뀌지 않는 이유입니다.",
  },
  {
    term: "브라우저 안 처리(클라이언트 처리)",
    group: "files",
    body: "서버가 아니라 내 브라우저가 하는 작업입니다. 파일은 내 기기의 메모리로만 읽히고 어디로도 전송되지 않습니다.",
    practical: "그래서 용량 한도가 있고 속도가 기기 성능에 달려 있습니다. 그리고 그래서 파일이 어디에도 업로드되지 않습니다.",
  },
];

const glossarySchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "이미지·PDF 용어 정리",
  description: "BravoConvert에서 쓰는 이미지·PDF 용어의 뜻과, 각각이 실제로 바꾸는 것.",
  inLanguage: "ko",
  hasDefinedTerm: terms.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.body })),
};

export default function KoreanGlossaryPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(glossarySchema) }} />
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 break-keep sm:px-6">
        <ContentHeader label="가이드" title="용어 정리">
          <p className="mt-3 text-lg leading-relaxed text-foreground">용어 {terms.length}개를 쉬운 말로</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            뜻과 함께, 그게 내 파일에 실제로 어떤 차이를 만드는지 적었습니다
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            게시 <time dateTime={PUBLISHED}>{PUBLISHED}</time> · 측정 <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </ContentHeader>

        <Prose as="article" className="mt-10 max-w-[720px] space-y-10">
          <nav aria-label="분류" className="flex flex-wrap gap-2">
            {GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
              >
                {group.name}
              </a>
            ))}
          </nav>

          {GROUPS.map((group) => (
            <section key={group.id} id={group.id}>
              <h2>{group.name}</h2>
              <dl className="divide-y divide-border">
                {terms
                  .filter((t) => t.group === group.id)
                  .map((item) => (
                    <div key={item.term} className="py-5 first:pt-0 last:pb-0">
                      <dt className="mb-2 text-lg font-bold text-foreground">{item.term}</dt>
                      <dd className="leading-7 text-muted-foreground">
                        {item.body}
                        {item.practical && (
                          <span className="mt-2 block rounded-field border-l-4 border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
                            <strong>실제로는:</strong> {item.practical}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
              </dl>
            </section>
          ))}

          <div className="rounded-field bg-muted p-6">
            <p className="!my-0">
              이 중 여러 용어는 <Link href="/ko/guides/jpg-png-webp-comparison/">JPG, PNG, WebP 비교</Link>와{" "}
              <Link href="/ko/guides/reduce-image-file-size/">이미지 용량 줄이기</Link>에서 측정값으로 다룹니다. 전체 목록은{" "}
              <Link href="/ko/guides/">가이드 모음</Link>에서 볼 수 있습니다.
            </p>
          </div>
        </Prose>
      </div>
    </main>
  );
}
