import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import IconTile from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";
import Link from "next/link";
import { BarChart3, CheckCircle2, FlaskConical, Image as ImageIcon, Layers, Lightbulb, XCircle } from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";
import { alternatesFor } from "@/lib/locale";

const PUBLISHED = "2026-11-14";
const UPDATED = benchmarks.generatedAt;

export const metadata: Metadata = {
  title: "JPG, PNG, WebP 비교: 같은 사진을 직접 저장해 용량을 쟀습니다 | BravoConvert",
  description:
    "사진, 평면 그래픽, 미세한 질감 이미지 세 장을 화질 네 단계로 저장해 바이트 단위로 측정했습니다. WebP가 이기는 경우와 JPG에 지는 경우, PNG를 쓰면 안 되는 경우를 숫자로 정리했습니다.",
  alternates: alternatesFor("/guides/jpg-png-webp-comparison/", "ko"),
  openGraph: {
    title: "JPG, PNG, WebP 비교: 직접 잰 용량",
    description: "어림짐작이 아니라 브라우저 인코더로 직접 측정한 결과입니다. JPG가 WebP보다 작아지는 경우도 있습니다.",
    type: "article",
    locale: "ko_KR",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;

const sampleImages: Record<string, string> = {
  photo: "/guides/sample-photo.webp",
  graphic: "/guides/sample-graphic.webp",
  detail: "/guides/sample-detail.webp",
};

const SAMPLE_TEXT: Record<string, { label: string; description: string }> = {
  photo: { label: "사진", description: "부드러운 그러데이션과 노이즈. 휴대폰으로 찍은 사진과 비슷합니다." },
  graphic: { label: "평면 그래픽", description: "단색 면, 선명한 경계, 글자. 로고나 앱 화면 캡처와 비슷합니다." },
  detail: { label: "미세한 질감", description: "촘촘한 고주파 무늬. 어떤 형식에도 가장 어려운 이미지입니다." },
};

function at(sampleId: string, codec: "jpeg" | "webp", quality: number) {
  const sample = benchmarks.samples.find((s) => s.id === sampleId)!;
  return sample[codec].find((entry) => entry.quality === quality)!.bytes;
}

function pngOf(sampleId: string) {
  return benchmarks.samples.find((s) => s.id === sampleId)!.png;
}

const findings = [
  {
    title: `사진을 PNG로 저장하면 용량이 약 ${Math.round(pngOf("photo") / at("photo", "jpeg", 0.8))}배가 됩니다`,
    body: `사진 샘플은 PNG로 ${kb(pngOf("photo"))}, JPG 화질 0.8로 ${kb(at("photo", "jpeg", 0.8))}였습니다. 화면에서 보기에는 거의 차이가 없는데 용량은 몇 배입니다. PNG는 카메라 노이즈 한 알 한 알까지 그대로 기록해야 하고, JPG는 그 부분을 적당히 뭉갤 수 있기 때문입니다.`,
  },
  {
    title: "로고나 화면 캡처는 JPG로 바꿔도 얻는 게 거의 없습니다",
    body: `평면 그래픽 샘플은 PNG가 ${kb(pngOf("graphic"))}, JPG 화질 0.8이 ${kb(at("graphic", "jpeg", 0.8))}였습니다. 줄어드는 건 ${Math.round(
      (1 - at("graphic", "jpeg", 0.8) / pngOf("graphic")) * 100
    )}% 정도인데, 글자와 그래프 테두리에 번짐이 생깁니다. 같은 화질의 WebP는 ${kb(at("graphic", "webp", 0.8))}로, 이런 이미지에는 WebP가 답입니다.`,
  },
  {
    title: "WebP가 항상 더 작은 건 아닙니다",
    body: `미세한 질감 샘플을 화질 0.4로 저장하니 JPG는 ${kb(at("detail", "jpeg", 0.4))}, WebP는 ${kb(
      at("detail", "webp", 0.4)
    )}였습니다. WebP가 약 ${Math.round((at("detail", "webp", 0.4) / at("detail", "jpeg", 0.4) - 1) * 100)}% 더 컸습니다. 화질 0.8에서는 둘이 거의 같았습니다. WebP의 장점은 매끈하거나 단순한 이미지에서 크고, 노이즈가 많은 질감에서는 줄거나 뒤집힙니다.`,
  },
  {
    title: "화질 슬라이더 맨 위 구간은 비쌉니다",
    body: `사진 샘플의 JPG 화질을 0.8에서 0.95로 올리면 ${kb(at("photo", "jpeg", 0.8))}에서 ${kb(
      at("photo", "jpeg", 0.95)
    )}로, 약 ${(at("photo", "jpeg", 0.95) / at("photo", "jpeg", 0.8)).toFixed(1)}배가 됩니다. 늘어난 용량은 대부분 눈에 띄는 디테일이 아니라 노이즈를 보존하는 데 쓰입니다.`,
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "JPG, PNG, WebP 비교: 같은 사진을 직접 저장해 용량을 쟀습니다",
  description: "세 종류의 이미지를 JPG, PNG, WebP로 화질 네 단계씩 저장해 BravoConvert와 같은 브라우저 인코더로 측정한 용량 비교.",
  inLanguage: "ko",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://bravoconvert.com/ko/guides/jpg-png-webp-comparison/" },
  image: "https://bravoconvert.com/guides/jpeg-quality-ladder.webp",
};

export default function KoreanJpgPngWebpGuide() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 break-keep sm:px-6">
        <ContentHeader label="가이드" title="JPG, PNG, WebP 비교">
          <p className="mt-3 text-lg leading-relaxed text-foreground">짐작하지 않고 직접 쟀습니다</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            이 페이지의 숫자는 모두 BravoConvert가 브라우저에서 쓰는 인코더로 직접 만든 결과입니다
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            게시 <time dateTime={PUBLISHED}>{PUBLISHED}</time> · 측정 <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </ContentHeader>

        <Prose as="article" className="mt-10 max-w-[720px] space-y-10">
          <div className="rounded-field bg-primary-soft p-5 text-foreground">
            <strong>짧게 말하면:</strong> 어디에 올릴지 모르는 사진은 JPG, 투명 배경이나 정확한 픽셀이 필요하면 PNG, 내가
            관리하는 웹사이트에 올려서 용량을 최대한 줄이고 싶으면 WebP입니다. 아래 측정은 이 조언이 맞는 경우와 틀리는 경우를
            보여 줍니다.
          </div>

          <section>
            <h2>
              <IconTile icon={FlaskConical} size="sm" tone="blue" className="hidden sm:inline-flex" />
              숫자를 어떻게 얻었나
            </h2>
            <p>
              형식 비교 글은 대개 출처 없이 &ldquo;WebP가 30% 작다&rdquo; 같은 비율을 옮겨 적습니다. 여기 숫자는 이 프로젝트의
              스크립트가 {benchmarks.samples[0].width}×{benchmarks.samples[0].height} 크기의 테스트 이미지 세 장을 그리고, 각각을
              Canvas <code>toBlob</code> API로 화질 네 단계에 걸쳐 저장한 뒤 결과 파일의 바이트 수를 그대로 기록한 것입니다.
            </p>
            <p>
              중요한 건 <strong>이미지 변환기가 실제로 쓰는 경로와 같다</strong>는 점입니다. 이 페이지에 사진이 WebP로{" "}
              {kb(at("photo", "webp", 0.8))}이라고 적혀 있으면, BravoConvert에서 변환했을 때 실제로 받게 되는 크기입니다. 다른
              인코더를 쓰는 다른 도구의 숫자를 빌려 온 게 아닙니다.
            </p>
            <div className="rounded-field bg-muted p-4 text-sm text-muted-foreground">
              Chromium {benchmarks.engine}에서 {UPDATED}에 측정했습니다. 브라우저 버전에 따라 결과가 조금 달라질 수 있으니
              고정된 값이 아니라 대표값으로 봐 주세요. 테스트 이미지는 고정된 난수로 그린 합성 이미지라 언제 돌려도 같은
              결과가 나오지만, 여러분의 사진은 절대값이 다르게 나옵니다. 그대로 적용되는 건 <em>형식 사이의 관계</em>입니다.
            </div>
          </section>

          <section>
            <h2>
              <IconTile icon={Layers} size="sm" tone="blue" className="hidden sm:inline-flex" />
              세 형식은 왜 다르게 움직이나
            </h2>
            <p>
              PNG는 무손실 압축입니다. 같은 색이 이어지는 구간이나 바로 윗줄과 비슷한 줄처럼 짧게 적을 수 있는 패턴을 찾고,
              원본을 그대로 되살립니다. 버리는 게 없어서 백 번 다시 저장해도 똑같습니다. 대신 사진의 노이즈에는 패턴이 없어서
              거의 그대로 저장하게 됩니다.
            </p>
            <p>
              JPG는 손실 압축입니다. 이미지를 작은 블록으로 나눠 주파수 성분으로 바꾼 뒤, 눈이 덜 민감한 고주파 성분을 깎아
              냅니다. 화질 슬라이더는 얼마나 과감하게 깎을지를 정합니다. 부드러운 그러데이션에는 잘 맞지만 선명한 경계에는
              약해서, 평면 그래픽 테스트에서 글자와 선 주변에 번짐이 생겼습니다.
            </p>
            <p>
              WebP는 두 방식을 모두 지원하고, 같은 화질 숫자라면 대체로 JPG보다 똑똑하게 압축합니다. 다만 &ldquo;대체로&rdquo;라는
              말에 무게가 있다는 걸 미세한 질감 측정이 보여 줍니다.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={BarChart3} size="sm" tone="blue" className="hidden sm:inline-flex" />
              측정 결과
            </h2>
            <div className="space-y-10">
              {benchmarks.samples.map((sample) => {
                const text = SAMPLE_TEXT[sample.id] ?? { label: sample.label, description: sample.description };
                return (
                  <div key={sample.id}>
                    <h3 className="mb-1 text-xl font-bold text-foreground">{text.label}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{text.description}</p>
                    <img
                      src={sampleImages[sample.id]}
                      width={sample.width}
                      height={sample.height}
                      alt={`${text.label} 테스트 이미지: ${text.description}`}
                      className="mb-4 h-auto w-full rounded-field"
                      loading="lazy"
                    />
                    <div className="prose-wide">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-foreground">
                          <tr>
                            <th className="p-3 font-bold">화질</th>
                            <th className="p-3 font-bold">JPG</th>
                            <th className="p-3 font-bold">WebP</th>
                            <th className="p-3 font-bold">더 작은 쪽</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          {sample.jpeg.map((entry) => {
                            const webpBytes = sample.webp.find((w) => w.quality === entry.quality)!.bytes;
                            const webpWins = webpBytes < entry.bytes;
                            const delta = Math.abs(
                              Math.round((1 - Math.min(webpBytes, entry.bytes) / Math.max(webpBytes, entry.bytes)) * 100)
                            );
                            return (
                              <tr key={entry.quality} className="border-t border-border">
                                <td className="p-3 font-medium text-foreground">{entry.quality}</td>
                                <td className="p-3">{kb(entry.bytes)}</td>
                                <td className="p-3">{kb(webpBytes)}</td>
                                <td className="p-3">
                                  <span className="font-medium text-foreground">{webpWins ? "WebP" : "JPG"}</span>{" "}
                                  <span className="text-muted-foreground">{delta}% 작음</span>
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t-2 border-border bg-muted">
                            <td className="p-3 font-medium text-foreground">PNG (무손실)</td>
                            <td className="p-3 font-medium text-foreground" colSpan={3}>
                              {kb(sample.png)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2>
              <IconTile icon={Lightbulb} size="sm" tone="blue" className="hidden sm:inline-flex" />
              숫자가 말해 주는 것
            </h2>
            <div className="space-y-5">
              {findings.map((finding, index) => (
                <div key={finding.title} className="rounded-field border-l-4 border-primary bg-muted p-5">
                  <h3 className="mb-2 flex items-start gap-3 text-lg font-bold text-foreground">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    {finding.title}
                  </h3>
                  <p className="pl-9 leading-7 text-muted-foreground">{finding.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>JPG 화질은 눈으로 보면 이렇습니다</h2>
            <p>
              화질 설정은 숫자보다 눈으로 보는 편이 판단하기 쉽습니다. 아래는 사진 샘플의 같은 부분을 화질 단계별로 저장하고
              읽기 편하게 2배로 확대한 것입니다.
            </p>
            <img
              src="/guides/jpeg-quality-ladder.webp"
              width={2104}
              height={434}
              alt="같은 사진 조각을 JPG 화질 0.4, 0.6, 0.8, 0.95로 저장해 2배 확대한 비교 이미지와 각 용량"
              className="h-auto w-full rounded-field"
              loading="lazy"
            />
            <p>
              눈에 띄는 차이는 깍두기 같은 블록이 아니라 자글자글한 입자입니다. 화질 0.4에서는 인코더가 센서 노이즈를 매끈하게
              지워서 이 조각이 3 KB 남짓입니다. 0.95에서는 노이즈가 그대로 살아 있고, 같은 조각이 약 일곱 배 용량이 됩니다. 원본이
              노이즈 많은 사진이라면 높은 화질 설정은 대부분 그 노이즈에 용량을 쓰는 셈입니다.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={ImageIcon} size="sm" tone="blue" className="hidden sm:inline-flex" />
              투명 배경 지원
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-field bg-muted p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
                  <XCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" /> JPG
                </div>
                <p className="!my-0 text-sm">
                  투명 채널이 없습니다. 저장할 때 투명한 부분을 배경색으로 채워야 해서, 로고를 JPG로 저장하면 네모난 배경이
                  붙습니다.
                </p>
              </div>
              <div className="rounded-field bg-muted p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" /> PNG
                </div>
                <p className="!my-0 text-sm">
                  8비트 투명도를 온전히 지원해서 어떤 배경 위에서도 가장자리가 매끈합니다. 투명 배경이 있는 로고, 아이콘,
                  캡처에 무난한 선택입니다.
                </p>
              </div>
              <div className="rounded-field bg-muted p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" /> WebP
                </div>
                <p className="!my-0 text-sm">
                  손실·무손실 두 방식 모두 투명도를 지원합니다. 그래서 투명 WebP는 같은 PNG보다 보통 훨씬 작습니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>어떤 형식을 고를까</h2>
            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">이미지가 이렇다면</th>
                    <th className="p-3 font-bold">선택</th>
                    <th className="p-3 font-bold">이유</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t border-border">
                    <td className="p-3">내가 관리하는 웹사이트·블로그용 사진</td>
                    <td className="p-3 font-medium text-foreground">WebP, 화질 0.8</td>
                    <td className="p-3">눈에 띄지 않는 화질 차이로 가장 작은 파일</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-3">중고거래·관공서 업로드, 메일, 인쇄용 사진</td>
                    <td className="p-3 font-medium text-foreground">JPG, 화질 0.8</td>
                    <td className="p-3">어디서나 받아 주고, 이 경우 WebP와 크기도 비슷</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-3">투명 배경이 있는 로고, 아이콘, 캡처</td>
                    <td className="p-3 font-medium text-foreground">PNG</td>
                    <td className="p-3">투명도를 손실 없이 지키고 글자 주변이 깨지지 않음</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-3">웹에 올릴 평면 그래픽이나 앱 화면 캡처</td>
                    <td className="p-3 font-medium text-foreground">WebP</td>
                    <td className="p-3">
                      샘플 기준 {kb(at("graphic", "webp", 0.8))}, PNG는 {kb(pngOf("graphic"))}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-3">질감이 촘촘한 이미지를 강하게 압축할 때</td>
                    <td className="p-3 font-medium text-foreground">둘 다 시험</td>
                    <td className="p-3">여기서는 JPG가 WebP보다 작을 수 있음</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>호환성</h2>
            <p>
              JPG와 PNG는 사실상 어디서나 받아 줍니다. WebP는 요즘 브라우저에서는 다 열리지만, 오래된 프로그램, 일부 프린터,
              관공서·은행 같은 일부 업로드 양식은 아직 거부합니다. 어딘가에서 WebP 파일을 받아 주지 않으면{" "}
              <Link href="/convert/img/">이미지 변환기 (영문)</Link>에서 JPG나 PNG로 바꾸면 됩니다. 변환은 브라우저 안에서 일어나서
              파일이 기기 밖으로 나가지 않습니다.
            </p>
          </section>

          <section>
            <h2>숫자를 직접 확인해 보세요</h2>
            <p>
              위 측정에 쓴 무압축 PNG 원본을 공개해 두었습니다. 변환기에 넣고 이 페이지의 설정을 그대로 써 본 뒤, 여러분의
              브라우저가 만든 용량을 위 숫자와 비교해 보세요.
            </p>
            <ul>
              {benchmarks.samples.map((sample) => (
                <li key={sample.id}>
                  <a href={`/guides/sample-${sample.id}.png`} download>
                    {(SAMPLE_TEXT[sample.id] ?? { label: sample.label }).label} 원본 (PNG, {kb(sample.png)})
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div className="rounded-field bg-muted p-6">
            <p className="!my-0">
              바로 바꿔 보려면 <Link href="/convert/img/">이미지 변환기 (영문)</Link>에서 JPG, PNG, WebP를 오가며 변환할 수 있습니다.
              화질 설정을 더 세밀하게 고르고 싶다면 <Link href="/ko/guides/reduce-image-file-size/">이미지 용량 줄이기</Link>를 읽어
              보세요.
            </p>
          </div>
        </Prose>
      </div>
    </main>
  );
}
