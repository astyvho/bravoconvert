import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import IconTile from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";
import Link from "next/link";
import { FlaskConical, Gauge, Layers, SlidersHorizontal, Tag } from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";
import { alternatesFor } from "@/lib/locale";

const PUBLISHED = "2026-11-14";
const UPDATED = benchmarks.generatedAt;

export const metadata: Metadata = {
  title: "이미지 용량 줄이기: 네 가지 방법을 직접 재 봤습니다 | BravoConvert",
  description:
    "형식, 크기(해상도), 화질, 메타데이터. 이미지 용량을 줄이는 네 가지 방법은 효과가 전혀 다릅니다. 같은 사진 한 장으로 각각 측정했고, 크기를 줄일 때는 흔한 계산보다 더 많이 줄어든다는 결과도 나왔습니다.",
  alternates: alternatesFor("/guides/reduce-image-file-size/", "ko"),
  openGraph: {
    title: "이미지 용량 줄이기: 직접 잰 결과",
    description: "형식, 크기, 화질, 메타데이터를 같은 사진으로 바이트 단위까지 비교했습니다.",
    type: "article",
    locale: "ko_KR",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const photo = benchmarks.samples.find((s) => s.id === "photo")!;
const resize = benchmarks.resize;
const full = resize.rows[0];

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;
const pct = (part: number, whole: number) => `${Math.round((1 - part / whole) * 100)}%`;

const jpegAt = (q: number) => photo.jpeg.find((e) => e.quality === q)!.bytes;
const webpAt = (q: number) => photo.webp.find((e) => e.quality === q)!.bytes;

const half = resize.rows.find((r) => r.scale === 0.5)!;

const cascade = [
  { step: "원본을 PNG로 저장", detail: `${photo.width}×${photo.height}, 무손실`, bytes: photo.png },
  { step: "형식을 WebP로 변경", detail: "화질 0.8, 크기는 그대로", bytes: webpAt(0.8) },
  { step: "가로세로도 절반으로", detail: `${half.width}×${half.height}, 화질 0.8`, bytes: half.webp },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "이미지 용량 줄이는 방법",
  description: "형식 선택, 해상도 줄이기, 화질 낮추기, 메타데이터 제거. 네 가지 방법을 같은 사진으로 측정한 결과.",
  inLanguage: "ko",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://bravoconvert.com/ko/guides/reduce-image-file-size/" },
  step: [
    {
      "@type": "HowToStep",
      name: "알맞은 형식 고르기",
      text: `샘플 사진을 PNG에서 WebP 화질 0.8로 바꾸자 ${kb(photo.png)}에서 ${kb(webpAt(0.8))}가 되었습니다.`,
    },
    {
      "@type": "HowToStep",
      name: "가로세로 크기 줄이기",
      text: `가로세로를 절반으로 줄이면 픽셀은 25%가 남지만 용량은 ${Math.round((half.webp / full.webp) * 100)}%만 남았습니다.`,
    },
    {
      "@type": "HowToStep",
      name: "화질 설정 낮추기",
      text: `화질을 0.8에서 0.6으로 낮추자 JPG가 ${kb(jpegAt(0.8))}에서 ${kb(jpegAt(0.6))}가 되었습니다.`,
    },
    {
      "@type": "HowToStep",
      name: "메타데이터 빼기",
      text: "Canvas로 다시 저장하면 원본의 EXIF 정보가 결과 파일에 따라오지 않습니다.",
    },
  ],
};

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {n}
    </span>
  );
}

export default function KoreanReduceFileSizeGuide() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 break-keep sm:px-6">
        <ContentHeader label="가이드" title="이미지 용량 줄이기">
          <p className="mt-3 text-lg leading-relaxed text-foreground">네 가지 방법, 효과를 나란히 재 봤습니다</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            같은 사진 한 장에 방법을 하나씩 적용하고, 결과 파일의 용량을 모두 적었습니다
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            게시 <time dateTime={PUBLISHED}>{PUBLISHED}</time> · 측정 <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </ContentHeader>

        <Prose as="article" className="mt-10 max-w-[720px] space-y-10">
          <p>
            사진이 너무 크면 업로드 제한에 걸리고, 메일 첨부가 안 되고, 블로그 글이 느려집니다. 용량을 바꾸는 요소는 네
            가지입니다. 형식, 가로세로 크기, 화질 설정, 그리고 사진에 붙어 있는 메타데이터. 이 넷은 효과가 비슷하지
            않아서, 어떤 순서로 손대느냐가 중요합니다.
          </p>

          <div className="rounded-field bg-primary-soft p-5 text-foreground">
            <strong>짧게 말하면:</strong> 형식과 크기가 대부분을 해결합니다. 테스트 사진은 PNG에서 WebP로 바꾸기만 해도{" "}
            {pct(webpAt(0.8), photo.png)}가 줄었고, 가로세로를 절반으로 줄이니 거기서 {pct(half.webp, webpAt(0.8))}가 더
            줄었습니다. 화질은 그다음의 미세 조정이고, 메타데이터 때문에 파일이 큰 경우는 거의 없습니다.
          </div>

          <section>
            <h2>
              <IconTile icon={FlaskConical} size="sm" tone="blue" className="hidden sm:inline-flex" />
              숫자를 어떻게 얻었나
            </h2>
            <p>
              아래 숫자는 모두 {photo.width}×{photo.height} 크기의 고정된 테스트 사진 한 장을 Chromium {benchmarks.engine}의
              Canvas <code>toBlob</code> API로 저장해 {UPDATED}에 측정한 것입니다.{" "}
              <Link href="/convert/img/">이미지 변환기 (영문)</Link>가 브라우저에서 실제로 쓰는 것과 같은 경로입니다. 절대값은
              사진마다 다르지만 방법 사이의 차이는 그대로 적용됩니다. 측정 방법과 원본 파일은{" "}
              <Link href="/ko/guides/jpg-png-webp-comparison/">JPG, PNG, WebP 비교</Link>에 자세히 있습니다.
            </p>
          </section>

          <section>
            <h2>
              <StepNumber n={1} />
              형식부터 고르세요
            </h2>
            <p>
              사진이라면 이게 가장 효과가 크고, 눈에 보이는 손해도 없습니다. 테스트 사진은 PNG로 {kb(photo.png)}입니다.
              PNG는 무손실이라 센서 노이즈 한 알까지 정확히 기록해야 하기 때문입니다. 같은 사진을 화질 0.8로 저장하면 JPG는{" "}
              {kb(jpegAt(0.8))}, WebP는 {kb(webpAt(0.8))}입니다.
            </p>
            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">형식</th>
                    <th className="p-3 font-bold">용량</th>
                    <th className="p-3 font-bold">PNG 대비 감소</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t border-border">
                    <td className="p-3 font-medium text-foreground">PNG</td>
                    <td className="p-3">{kb(photo.png)}</td>
                    <td className="p-3">—</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-3 font-medium text-foreground">JPG, 화질 0.8</td>
                    <td className="p-3">{kb(jpegAt(0.8))}</td>
                    <td className="p-3">{pct(jpegAt(0.8), photo.png)}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-3 font-medium text-foreground">WebP, 화질 0.8</td>
                    <td className="p-3">{kb(webpAt(0.8))}</td>
                    <td className="p-3">{pct(webpAt(0.8), photo.png)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              투명 배경이 필요하면 JPG는 쓸 수 없지만, WebP는 투명도를 지키면서도 PNG보다 훨씬 작습니다. PNG가 정답인 경우는
              단색 위주의 그래픽과 화면 캡처 정도입니다. 이런 이미지는 무손실이 오히려 더 작고 깨끗합니다.
            </p>
          </section>

          <section>
            <h2>
              <StepNumber n={2} />
              가로세로 크기 줄이기: 생각보다 더 줄어듭니다
            </h2>
            <p>
              흔히 용량은 픽셀 수에 비례한다고 합니다. 가로세로를 절반으로 줄이면 픽셀이 4분의 1이 되니 용량도 4분의 1쯤
              되리라는 계산입니다. 실제로 재 보니 그보다 더 줄었습니다.
            </p>
            <img
              src="/guides/resize-ladder.webp"
              width={1554}
              height={292}
              alt="같은 사진을 900×600, 675×450, 450×300, 225×150 픽셀로 줄여 실제 비율대로 나란히 놓고 각 용량을 적은 이미지"
              className="h-auto w-full rounded-field"
              loading="lazy"
            />
            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">배율</th>
                    <th className="p-3 font-bold">크기</th>
                    <th className="p-3 font-bold">남은 픽셀</th>
                    <th className="p-3 font-bold">JPG 남은 용량</th>
                    <th className="p-3 font-bold">WebP 남은 용량</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {resize.rows.map((row) => (
                    <tr key={row.scale} className="border-t border-border">
                      <td className="p-3 font-medium text-foreground">{Math.round(row.scale * 100)}%</td>
                      <td className="p-3">
                        {row.width}×{row.height}
                      </td>
                      <td className="p-3">{Math.round((row.pixels / full.pixels) * 100)}%</td>
                      <td className="p-3">
                        {kb(row.jpeg)} <span>({Math.round((row.jpeg / full.jpeg) * 100)}%)</span>
                      </td>
                      <td className="p-3">
                        {kb(row.webp)} <span>({Math.round((row.webp / full.webp) * 100)}%)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              75%로 줄이면 픽셀은 {Math.round((resize.rows[1].pixels / full.pixels) * 100)}%가 남는데 JPG 용량은{" "}
              {Math.round((resize.rows[1].jpeg / full.jpeg) * 100)}%만 남습니다. 50%로 줄이면 픽셀은 4분의 1, 용량은 5분의 1도
              안 됩니다.
            </p>
            <p>
              이유는 크기를 줄일 때 이웃한 픽셀을 평균 내기 때문입니다. 이 평균 과정이 압축하기 가장 비싼 자잘한 노이즈를
              지워 줍니다. 픽셀 수만 줄어드는 게 아니라, 남은 픽셀도 더 잘 압축되는 셈입니다. 이 효과는 JPG보다 WebP에서 더
              큽니다.
            </p>
            <div className="rounded-field bg-muted p-4 text-sm text-muted-foreground">
              줄인 크기는 되돌릴 수 없으니 원본은 따로 두고 사본으로 작업하세요.{" "}
              <Link href="/edit/image/">이미지 편집기 (영문)</Link>에서는 일부러 늘리려는 게 아니라면 비율 고정을 켜 두고, 아무
              크기로나 줄이기보다 사진이 실제로 보일 크기에 맞추는 게 좋습니다.
            </div>
          </section>

          <section>
            <h2>
              <StepNumber n={3} />
              화질 설정 낮추기
            </h2>
            <p>
              화질은 미세 조정입니다. 슬라이더 위쪽에서는 용량이 크게 움직이고 아래쪽에서는 덜 움직입니다. 보통 사람들이
              화질을 만지는 방식과는 반대입니다.
            </p>
            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">화질</th>
                    <th className="p-3 font-bold">JPG</th>
                    <th className="p-3 font-bold">WebP</th>
                    <th className="p-3 font-bold">0.95 대비</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {photo.jpeg.map((entry) => (
                    <tr key={entry.quality} className="border-t border-border">
                      <td className="p-3 font-medium text-foreground">{entry.quality}</td>
                      <td className="p-3">{kb(entry.bytes)}</td>
                      <td className="p-3">{kb(webpAt(entry.quality))}</td>
                      <td className="p-3">{entry.quality === 0.95 ? "—" : `−${pct(entry.bytes, jpegAt(0.95))}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              0.95에서 0.8로 내리면 대부분 눈으로 구분하지 못하는 차이로 {pct(jpegAt(0.8), jpegAt(0.95))}가 줄어듭니다. 0.6까지
              내리면 모두 {pct(jpegAt(0.6), jpegAt(0.95))}가 줄고, 0.4쯤 되면 인코더가 디테일을 눈에 띄게 뭉갭니다. 보통 0.8
              언저리가 적당하고, 0.6 아래로 내릴 때는 숫자를 믿기보다 결과를 직접 확인하세요.
            </p>
          </section>

          <section>
            <h2>
              <StepNumber n={4} />
              메타데이터 빼기
            </h2>
            <p>
              휴대폰 사진에는 카메라 설정, 촬영 시각, 때로는 GPS 좌표가 담긴 EXIF 정보가 붙어 있습니다. 지우는 게 좋지만 이유를
              분명히 해 둘 필요가 있습니다. EXIF는 보통 몇 KB 수준이라 수백 KB짜리 사진의 용량 문제를 해결해 주지 못합니다.
              BravoConvert로 변환하면 Canvas로 픽셀을 다시 저장하기 때문에 원본의 EXIF가 결과 파일에 따라오지 않는데, 이건
              용량보다{" "}
              <Link href="/ko/guides/exif-metadata-privacy/">개인정보 측면에서 더 중요합니다</Link>.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={Gauge} size="sm" tone="blue" className="hidden sm:inline-flex" />
              방법을 겹쳐 쓰면
            </h2>
            <p>같은 사진에 차례로 적용해 보면 앞의 두 방법만으로 거의 모든 감소가 일어납니다.</p>
            <div className="space-y-3">
              {cascade.map((row, index) => (
                <div
                  key={row.step}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-muted p-4"
                >
                  <div>
                    <div className="font-medium text-foreground">{row.step}</div>
                    <div className="text-sm text-muted-foreground">{row.detail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">{kb(row.bytes)}</div>
                    {index > 0 && (
                      <div className="text-sm text-muted-foreground">원본보다 {pct(row.bytes, cascade[0].bytes)} 작음</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p>
              {kb(cascade[0].bytes)}에서 {kb(cascade[2].bytes)}로, {pct(cascade[2].bytes, cascade[0].bytes)}가 줄었습니다. 화질
              슬라이더는 0.8 아래로 한 번도 내리지 않았습니다.
            </p>
          </section>

          <section>
            <h2>상황별 추천</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-field bg-muted p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
                  <SlidersHorizontal className="h-5 w-5" aria-hidden="true" /> 블로그·웹페이지용 사진
                </div>
                <p className="!my-0 text-sm">
                  WebP 화질 0.8, 페이지에 실제로 보이는 너비에 맞춰 줄이기. 800px 자리에 4000px 사진을 올리면 용량 대부분이
                  낭비입니다.
                </p>
              </div>
              <div className="rounded-field bg-muted p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
                  <Tag className="h-5 w-5" aria-hidden="true" /> 용량 제한이 있는 업로드
                </div>
                <p className="!my-0 text-sm">
                  먼저 크기를 줄이고, 그래도 넘으면 그때 화질을 낮추세요. 원래 크기에서 강하게 압축하는 것보다 크기를 줄이는
                  편이 선명해 보입니다.
                </p>
              </div>
              <div className="rounded-field bg-muted p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
                  <Layers className="h-5 w-5" aria-hidden="true" /> 투명 배경 로고·캡처
                </div>
                <p className="!my-0 text-sm">
                  받아 주는 곳이면 WebP, 아니면 PNG. JPG는 안 됩니다. 투명한 부분을 저장할 수 없어 단색으로 채워 버립니다.
                </p>
              </div>
              <div className="rounded-field bg-muted p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
                  <Gauge className="h-5 w-5" aria-hidden="true" /> 메일 첨부
                </div>
                <p className="!my-0 text-sm">
                  JPG 화질 0.8, 긴 변 1600px 안팎. 어디서나 열리고 일반적인 첨부 용량 제한에도 여유 있게 들어갑니다.
                </p>
              </div>
            </div>
          </section>

          <div className="rounded-field bg-muted p-6">
            <p className="!my-0">
              형식과 화질은 <Link href="/convert/img/">이미지 변환기 (영문)</Link>에서, 크기 줄이기는{" "}
              <Link href="/edit/image/">이미지 편집기 (영문)</Link>에서 할 수 있습니다. 둘 다 브라우저 안에서만 동작해서 파일이
              기기 밖으로 나가지 않습니다.
            </p>
          </div>
        </Prose>
      </div>
    </main>
  );
}
