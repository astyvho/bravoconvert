import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import IconTile from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";
import Link from "next/link";
import { AlertTriangle, Monitor, Presentation, Printer, Ruler, ScanEye, Share2, Sheet } from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";
import { alternatesFor } from "@/lib/locale";

const PUBLISHED = "2026-11-14";
const UPDATED = benchmarks.generatedAt;
const pdf = benchmarks.pdfPage;

export const metadata: Metadata = {
  title: "PDF를 이미지로 바꾸면: 해상도는 얼마이고 PNG와 JPG 중 무엇이 나을까 | BravoConvert",
  description:
    "PDF 페이지를 이미지로 바꾸면 144 DPI로 그려집니다. 그게 용량과 선명도에 어떤 의미인지, 그리고 글자 위주 문서에서는 왜 PNG가 JPG보다 작은지 직접 재 봤습니다.",
  alternates: alternatesFor("/guides/pdf-to-image-use-cases/", "ko"),
  openGraph: {
    title: "PDF를 이미지로 바꾸면: 해상도와 PNG·JPG 비교",
    description: "A4 한 페이지를 실제로 변환해 잰 용량과, 이미지로 바꾸는 게 맞는 경우를 정리했습니다.",
    type: "article",
    locale: "ko_KR",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;
const jpegAt = (q: number) => pdf.jpeg.find((e) => e.quality === q)!.bytes;

/** The quality PDFConverter passes to toDataURL for JPG output. */
const CONVERTER_JPG_QUALITY = 0.95;
const jpgActual = jpegAt(CONVERTER_JPG_QUALITY);

const pageSizes = [
  { name: "A4", w: 595, h: 842 },
  { name: "B5 (JIS)", w: 516, h: 729 },
  { name: "US Letter", w: 612, h: 792 },
  { name: "A3", w: 842, h: 1191 },
];

const cases = [
  {
    icon: Share2,
    title: "문서 전체 대신 한 페이지만 보낼 때",
    body: "18쪽짜리 보고서에서 4쪽만 필요한 사람에게 파일 전체를 보내면 찾느라 헤맵니다. 이미지 한 장은 카카오톡이든 메일이든 PDF 뷰어 없이 바로 열립니다.",
  },
  {
    icon: Presentation,
    title: "발표 자료나 문서에 페이지를 넣을 때",
    body: "파워포인트, 한글, 워드는 PDF를 끼워 넣는 것보다 이미지를 훨씬 안정적으로 다룹니다. PDF를 넣으면 글꼴이 깨지거나 아예 보이지 않는 경우가 있습니다.",
  },
  {
    icon: Printer,
    title: "이미지만 받는 곳에 올릴 때",
    body: "키오스크, 디지털 사이니지, 일부 신분 확인·서류 제출 양식은 JPG나 PNG만 받고 PDF는 거부합니다. 페이지를 이미지로 바꾸면 이런 제한을 피할 수 있습니다.",
  },
  {
    icon: ScanEye,
    title: "보고서에서 표나 그래프만 떼어 낼 때",
    body: "그림 하나만 이미지로 뽑는 편이 PDF의 벡터 요소와 씨름하는 것보다 대개 간단합니다. 원본이 스캔한 PDF라면 이 방법밖에 없습니다.",
  },
  {
    icon: Sheet,
    title: "PDF 업로드를 막아 둔 양식",
    body: "일부 온라인 편집기와 접수 양식은 이미지 업로드만 받습니다. 필요한 페이지만 이미지로 바꾸면 프로그램을 설치하지 않고도 올릴 수 있습니다.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "PDF를 이미지로 바꾸면: 해상도는 얼마이고 PNG와 JPG 중 무엇이 나을까",
  description: "A4 PDF 페이지를 144 DPI 이미지로 변환해 측정한 결과와, 글자 위주 문서에서 PNG가 JPG보다 작은 이유.",
  inLanguage: "ko",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://bravoconvert.com/ko/guides/pdf-to-image-use-cases/" },
  image: "https://bravoconvert.com/guides/pdf-page-render.webp",
};

export default function KoreanPdfUseCasesGuide() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 break-keep sm:px-6">
        <ContentHeader label="가이드" title="PDF를 이미지로 바꾸기">
          <p className="mt-3 text-lg leading-relaxed text-foreground">실제로 무엇을 얻고, 언제 바꾸는 게 맞을까</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            결과 해상도, 형식 고르기, 그리고 이미지가 PDF보다 나은 경우
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            게시 <time dateTime={PUBLISHED}>{PUBLISHED}</time> · 측정 <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </ContentHeader>

        <Prose as="article" className="mt-10 max-w-[720px] space-y-10">
          <p>
            PDF는 페이지 배치와 인쇄를 위한 형식입니다. 페이지를 이미지로 바꾸면 글자 선택, 검색, 아무리 확대해도 선명한
            벡터를 잃는 대신 어디서나 바로 열리는 파일을 얻습니다. 이 거래가 좋은지는 파일이 그다음 어디로 가느냐에 달려
            있습니다. 그리고 대부분의 안내 글이 말하지 않는 결과 해상도에도 달려 있습니다.
          </p>

          <section>
            <h2>
              <IconTile icon={Ruler} size="sm" tone="blue" className="hidden sm:inline-flex" />
              실제로 나오는 해상도
            </h2>
            <p>
              PDF 페이지는 포인트 단위로 크기를 재고, 1인치는 72포인트입니다.{" "}
              <Link href="/convert/pdf/">PDF 변환기 (영문)</Link>는 각 페이지를 <strong>{pdf.scale}배</strong>로 그리는데, 이는{" "}
              <strong>{pdf.dpi} DPI</strong>에 해당합니다. 그래서 일반 A4 한 페이지는 {pdf.pixelSize.width}×
              {pdf.pixelSize.height} 픽셀이 됩니다.
            </p>
            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">용지</th>
                    <th className="p-3 font-bold">포인트</th>
                    <th className="p-3 font-bold">{pdf.dpi} DPI 결과 픽셀</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {pageSizes.map((size) => (
                    <tr key={size.name} className="border-t border-border">
                      <td className="p-3 font-medium text-foreground">{size.name}</td>
                      <td className="p-3">
                        {size.w} × {size.h}
                      </td>
                      <td className="p-3">
                        {Math.round(size.w * pdf.scale)} × {Math.round(size.h * pdf.scale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-field bg-muted p-4 text-sm text-muted-foreground">
              <strong>{pdf.dpi} DPI는 화면용 해상도이지 인쇄용이 아닙니다.</strong> 모니터나 휴대폰에서는 충분히 선명하고 발표
              자료, 메신저, 웹에는 문제없습니다. 인쇄소는 보통 300 DPI를 요구하니, 인쇄할 거라면 변환한 이미지 대신 원본 PDF를
              보내세요.
            </div>
          </section>

          <section>
            <h2>
              <IconTile icon={Monitor} size="sm" tone="blue" className="hidden sm:inline-flex" />
              PNG일까 JPG일까: 흔한 답과 다릅니다
            </h2>
            <p>
              사진에서는 JPG가 훨씬 작아서 습관처럼 JPG를 고르게 됩니다. 하지만 문서 페이지는 사진이 아닙니다. 대부분 하얀
              바탕에 경계가 또렷한 검은 글자이고, 이건 JPG가 가장 못하고 PNG가 가장 잘하는 종류의 이미지입니다.
            </p>
            <p>아래 보고서 형식의 테스트 페이지를 변환기가 만드는 크기 그대로 그려서 두 결과를 재 봤습니다.</p>

            <img
              src="/guides/pdf-page-render.webp"
              width={pdf.pixelSize.width}
              height={pdf.pixelSize.height}
              alt={`제목, 본문, 표, 막대그래프가 있는 테스트 보고서 페이지를 ${pdf.pixelSize.width}×${pdf.pixelSize.height} 픽셀로 그린 이미지`}
              className="mx-auto h-auto w-full max-w-sm rounded-field"
              loading="lazy"
            />

            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">결과</th>
                    <th className="p-3 font-bold">용량</th>
                    <th className="p-3 font-bold">비고</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t border-border bg-muted font-semibold">
                    <td className="p-3 font-medium text-foreground">PNG</td>
                    <td className="p-3 font-medium text-foreground">{kb(pdf.png)}</td>
                    <td className="p-3">무손실, 글자 가장자리가 깨끗함</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-3 font-medium text-foreground">
                      JPG <span className="text-muted-foreground">(화질 {CONVERTER_JPG_QUALITY})</span>
                    </td>
                    <td className="p-3 font-medium text-foreground">{kb(jpgActual)}</td>
                    <td className="p-3">PNG보다 {(jpgActual / pdf.png).toFixed(1)}배 크고 손실 압축</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-field bg-primary-soft p-5 text-foreground">
              <strong>글자 위주 문서라면 PNG를 고르세요.</strong> 이 페이지에서 JPG는 PNG보다 {(jpgActual / pdf.png).toFixed(1)}배
              큰 데다 글자마다 주변에 얼룩이 생겼습니다. 용량은 더 쓰고 글자는 더 나빠지는 셈입니다. JPG가 유리해지는 건
              페이지 대부분이 사진일 때뿐입니다.
            </div>

            <p>
              참고로 변환기는 JPG를 화질 {CONVERTER_JPG_QUALITY}로 저장합니다. 화질을 낮추면 작아지긴 합니다(화질 0.6에서{" "}
              {kb(jpegAt(0.6))}). 하지만 글자가 눈에 띄게 뭉개져서, 사람이 읽으라고 문서를 변환하는 의미가 없어집니다.
            </p>
          </section>

          <section>
            <h2>이미지로 바꾸는 게 맞는 경우</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {cases.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-field bg-muted p-5">
                    <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
                      <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                      {item.title}
                    </div>
                    <p className="!my-0 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2>
              <IconTile icon={AlertTriangle} size="sm" tone="blue" className="hidden sm:inline-flex" />
              PDF 그대로 두는 게 나은 경우
            </h2>
            <ul className="space-y-3">
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                <strong>받는 사람이 글자를 검색하거나 복사해야 할 때.</strong> 이미지로 바꾸면 모든 게 픽셀이 됩니다. 선택하거나
                검색하거나 화면 낭독기로 읽을 글자가 남지 않습니다.
              </li>
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                <strong>인쇄소에 보낼 때.</strong> {pdf.dpi} DPI는 인쇄하면 흐릿해 보입니다. 원본 PDF의 벡터 글자는 어떤 크기로
                인쇄해도 선명합니다.
              </li>
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                <strong>문서가 길 때.</strong> 40쪽 보고서는 이미지 40장이 됩니다. ZIP 하나로 받긴 하지만 받는 사람은 한 장씩
                열어 봐야 합니다.
              </li>
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                <strong>계약서처럼 원본 자체가 증빙일 때.</strong> 서명한 문서를 찍은 이미지는 서명된 PDF와 같은 자료가
                아닙니다.
              </li>
            </ul>
          </section>

          <section>
            <h2>현실적인 한계</h2>
            <p>
              PDF 변환기는 <strong>50 MB</strong>까지의 파일을 받고 모든 작업을 브라우저 안에서 처리해서, 문서가 어디에도
              업로드되지 않습니다. 비밀번호가 걸리거나 암호화된 PDF는 열 수 없으니, 파일을 만든 프로그램에서 먼저 비밀번호를
              풀어 주세요. 페이지가 많거나 그래픽이 복잡한 문서는 서버가 아니라 여러분의 기기가 한 장씩 그리기 때문에 시간과
              메모리가 더 듭니다. 휴대폰에서 큰 보고서를 다룬다면{" "}
              <Link href="/edit/pdf/">PDF 병합·분할 (영문)</Link>로 필요한 페이지만 먼저 뽑아 두세요. 이 도구는 페이지를
              다시 그리지 않고 그대로 복사합니다. 변환이 멈추면{" "}
              <Link href="/ko/guides/troubleshooting/">문제 해결 가이드</Link>를 참고하세요.
            </p>
          </section>

          <div className="rounded-field bg-muted p-6">
            <p className="!my-0">
              문서 변환은 <Link href="/convert/pdf/">PDF 변환기 (영문)</Link>에서 할 수 있습니다. 결과를 더 작게 만들고 싶다면
              PNG를 <Link href="/convert/img/">이미지 변환기 (영문)</Link>에서 WebP로 바꿔 보세요. 같은 페이지가 측정에서{" "}
              {kb(pdf.webp.find((w) => w.quality === 0.8)!.bytes)}까지 줄었습니다.
            </p>
          </div>
        </Prose>
      </div>
    </main>
  );
}
