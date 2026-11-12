import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import Prose from "@/components/tool/prose";
import Link from "next/link";
import { Check, Download, FileImage, FileText, FlaskConical, MessageSquare, ShieldAlert, SquareStack, X } from "lucide-react";
import demo from "@/data/pdf-metadata-demo.json";
import { alternatesFor } from "@/lib/locale";

const PUBLISHED = "2026-11-08";
const UPDATED = demo.measuredOn;

export const metadata: Metadata = {
  title: "PDF가 작성자에 대해 드러내는 것: 병합·분할 전후 직접 확인 | BravoConvert",
  description:
    "PDF에 작성자, 제목, 키워드, XMP, 검토자 메모를 넣고 병합·추출·분할·이미지 변환을 거쳐 다시 읽었습니다. 문서 속성은 사라졌지만, 메모와 검은 상자로 가린 글자는 남았습니다.",
  alternates: alternatesFor("/guides/pdf-metadata-privacy/", "ko"),
  openGraph: {
    title: "PDF가 작성자에 대해 드러내는 것",
    description: "정보를 심은 PDF를 병합, 추출, 분할, 이미지 변환한 뒤 다시 읽었습니다. 무엇이 지워지고 무엇이 남았는지, 그 이유까지.",
    type: "article",
    locale: "ko_KR",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

type Props = typeof demo.source.properties;

const PROPERTY_ROWS: { key: keyof Props; label: string; note: string }[] = [
  { key: "Title", label: "제목 (Title)", note: "작업용 제목이나 파일 이름이 그대로 들어가는 경우가 많고, '초안', 버전 번호도 함께 남습니다" },
  { key: "Author", label: "작성자 (Author)", note: "대개 파일을 저장한 계정의 이름이 자동으로 들어갑니다" },
  { key: "Subject", label: "주제 (Subject)", note: "잘 보지 않는 칸이라 오히려 내부 사정이 드러나기도 합니다" },
  { key: "Keywords", label: "키워드 (Keywords)", note: "작성자나 서식 파일이 넣은 자유 문구" },
  { key: "Creator", label: "작성 앱 (Creator)", note: "문서를 쓴 프로그램" },
  { key: "Producer", label: "PDF 생성기 (Producer)", note: "PDF를 만든 소프트웨어, 버전까지 남는 경우가 많습니다" },
  { key: "CreationDate", label: "만든 날짜", note: "PDF가 처음 만들어진 시각" },
  { key: "ModDate", label: "수정한 날짜", note: "마지막으로 저장한 시각" },
];

const show = (value: string | null) => {
  if (value === null) return null;
  return /^\d{4}-\d{2}-\d{2}T/.test(value) ? `${value.slice(0, 10)} ${value.slice(11, 19)} UTC` : value;
};

const outputs = [
  { id: "merged", label: "다른 PDF와 병합", result: demo.merged },
  { id: "extracted", label: `${demo.extracted.range}쪽 추출`, result: demo.extracted },
  { id: "split", label: "쪽별 분할, 첫 쪽", result: demo.splitFirstPage },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "PDF가 작성자에 대해 드러내는 것: 병합·분할 전후 직접 확인",
  description: "PDF 문서 속성, XMP 메타데이터, 메모가 병합, 쪽 추출, 분할, 이미지 변환 후에도 남는지 실험한 글.",
  inLanguage: "ko",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://bravoconvert.com/ko/guides/pdf-metadata-privacy/" },
};

const H2 = "mb-3 flex items-center gap-3 text-2xl font-bold text-foreground";
const H2_ICON = "h-7 w-7 flex-shrink-0 text-muted-foreground";
const CODE = "rounded bg-muted px-1.5 py-0.5 text-sm";

function Gone() {
  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-status-clean-foreground">
      <Check className="h-4 w-4" aria-hidden="true" /> 사라짐
    </span>
  );
}

function Kept({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-destructive-foreground">
      <X className="h-4 w-4 flex-shrink-0" aria-hidden="true" /> {children}
    </span>
  );
}

export default function KoreanPdfMetadataGuide() {
  const commentSurvived = outputs.every((o) => o.result.comments.some((c) => c.author === demo.planted.commentAuthor));
  const xmpGone = outputs.every((o) => !o.result.xmp.present);
  const { width, height } = demo.pageAsImage.pixelSize;

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6 break-keep">
        <ContentHeader label="가이드" title="PDF가 드러내는 것">
          <p className="mt-3 text-lg leading-relaxed text-foreground">작성자, 프로그램, 날짜, 그리고 잊고 있던 메모까지</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">정보를 심은 PDF를 병합·추출·분할·이미지 변환한 뒤 결과물을 모두 다시 읽었습니다</p>
          <p className="mt-4 text-sm text-muted-foreground">
            게시 <time dateTime={PUBLISHED}>{PUBLISHED}</time> · 측정 <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </ContentHeader>

        <Prose as="article" className="mt-10 max-w-[720px] space-y-10">
          <section>
            <h2 className={H2}>
              <FileText className={H2_ICON} aria-hidden="true" />
              PDF 안에는 &lsquo;문서에 대한 문서&rsquo;가 하나 더 있습니다
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              PDF에는 페이지 말고도 문서 속성이 들어 있습니다. 제목, 작성자, 주제, 키워드, 문서를 쓴 앱, PDF를 만든 소프트웨어, 처음
              만든 시각과 마지막으로 저장한 시각입니다. 많은 파일이 같은 내용을 XMP라는 XML 블록에 한 번 더 저장합니다. 이 정보는 페이지
              어디에도 보이지 않고, 대부분의 PDF 뷰어에서 파일 → 속성(문서 정보)에 들어가야 보이기 때문에 잊히기 쉽습니다.
            </p>
            <p className="text-muted-foreground leading-7">
              아무도 일부러 입력하지 않은 PDF에도 일부는 들어갑니다. Chromium {demo.browser.replace("Chromium ", "")}에서 평범한 웹
              페이지를 설정 변경 없이 PDF로 인쇄해 보니, 제목에는 페이지 제목인{" "}
              <code className={CODE}>{demo.chromiumDefault.properties.Title}</code>, 작성 앱에는{" "}
              <code className={CODE}>{demo.chromiumDefault.properties.Creator}</code>, PDF 생성기에는 브라우저의 주 버전이 드러나는{" "}
              <code className={CODE}>{demo.chromiumDefault.properties.Producer}</code>가 기록되었고, 인쇄한 시각도 초 단위로 남았습니다.
            </p>
          </section>

          <section>
            <h2 className={H2}>
              <FlaskConical className={H2_ICON} aria-hidden="true" />
              실험 방법
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              그렇게 Chromium으로 인쇄한 {demo.source.pages}쪽짜리 보고서에, 오피스 프로그램이 흔히 남기는 속성을 넣었습니다. 작성자,
              초안 제목, 주제, 키워드, 작성 앱 이름, 몇 달 전으로 된 작성·수정 날짜, 그리고 작성자를 한 번 더 적은 XMP입니다. 여기에 속성보다
              훨씬 자주 잊히는 것을 하나 더 넣었습니다. 1쪽에 붙은 검토자의 메모(스티커 노트)입니다. 이름과 값은 모두 영어로 된 가상의
              것입니다.
            </p>
            <p className="text-muted-foreground leading-7">
              이 파일을 <Link className="underline font-medium" href="/edit/pdf/">PDF 병합·분할 도구</Link>에 들어 있는 바로 그
              코드로 세 가지 방법으로 처리했습니다. 다른 PDF와 병합, {demo.extracted.range}쪽 추출, 한 쪽씩 분할입니다. 또{" "}
              <Link className="underline font-medium" href="/convert/pdf/">PDF → 이미지 변환기</Link>와 같은 PDF.js 렌더링과 캔버스
              인코딩도 거쳤습니다. 그리고 결과물을 하나씩 열어 다시 읽었습니다.
            </p>
          </section>

          <section>
            <h2 className={H2}>
              <SquareStack className={H2_ICON} aria-hidden="true" />
              병합·추출·분할: 문서 속성은 사라졌습니다
            </h2>
            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">속성</th>
                    <th className="p-3 font-bold">정보를 넣은 원본</th>
                    <th className="p-3 font-bold">병합·추출·분할 후</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {PROPERTY_ROWS.map((row) => {
                    const before = show(demo.source.properties[row.key]);
                    const after = show(demo.merged.properties[row.key]);
                    const sameEverywhere = outputs.every((o) => show(o.result.properties[row.key]) === after);
                    return (
                      <tr key={row.key} className="border-t border-border align-top">
                        <td className="p-3">
                          <div className="font-medium text-foreground">{row.label}</div>
                          <div className="text-xs text-muted-foreground">{row.note}</div>
                        </td>
                        <td className="p-3 font-mono text-xs">{before ?? "—"}</td>
                        <td className="p-3">
                          {after === null ? (
                            <Gone />
                          ) : (
                            <span className="text-muted-foreground">
                              바뀜: <span className="font-mono text-xs">{after}</span>
                              {!sameEverywhere && " (결과물마다 다름)"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-border align-top">
                    <td className="p-3">
                      <div className="font-medium text-foreground">XMP 패킷</div>
                      <div className="text-xs text-muted-foreground">작성자와 앱 정보의 XML 사본</div>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {demo.source.xmp.present ? `있음, ${demo.planted.xmpCreator} 기록` : "없음"}
                    </td>
                    <td className="p-3">{xmpGone ? <Gone /> : <Kept>남아 있음</Kept>}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-field bg-primary-soft border border-transparent p-5 text-foreground leading-7">
              <strong>세 결과물 모두 똑같았습니다.</strong> 이 도구는 비어 있는 새 PDF를 만들고 거기에 페이지를 복사합니다. 문서 속성은
              특정 페이지가 아니라 문서 전체에 딸린 정보라서 복사해 올 곳이 없습니다. 대신 새 파일에는 새 속성이 붙습니다. 작성 앱과 PDF
              생성기 칸에는 도구가 쓰는 PDF 라이브러리 이름이, 작성·수정 날짜에는 도구를 실행한 시각이
              {demo.merged.rawCreationDate?.endsWith("Z") ? " 세계 표준시(UTC)로" : ""} 기록됩니다. 한국 시간보다 9시간 이른 값이지만,
              파일을 정리한 시각 자체가 민감하다면 알아 둘 만합니다.
            </div>
          </section>

          <section>
            <h2 className={H2}>
              <MessageSquare className={H2_ICON} aria-hidden="true" />
              메모는 매번 살아남았습니다
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              가장 중요한 결과입니다. 메모, 형광펜, 스티커 노트는 &lsquo;주석(annotation)&rsquo;이고, 주석은 자기가 붙어 있는
              페이지에 딸려 있습니다. 페이지를 복사하면 주석도 함께 복사됩니다.
            </p>
            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">결과물</th>
                    <th className="p-3 font-bold">메모 작성자</th>
                    <th className="p-3 font-bold">메모 내용</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {outputs.map((o) => {
                    const comment = o.result.comments[0];
                    return (
                      <tr key={o.id} className="border-t border-border align-top">
                        <td className="p-3 font-medium text-foreground">{o.label}</td>
                        <td className="p-3">{comment ? <Kept>{comment.author}</Kept> : <Gone />}</td>
                        <td className="p-3 text-xs">{comment ? `“${comment.text}”` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              메모 내용은 &ldquo;외부로 나가기 전에 공급업체 견적은 빼 주세요&rdquo;라는 뜻의 가상 문구입니다.
            </p>
            <p className="mt-4 text-muted-foreground leading-7">
              {commentSurvived
                ? "속성에서 작성자 이름은 지워졌는데 1쪽에는 검토자 이름과 내부 지시가 그대로 붙어 있는, 이렇게 '반쯤 정리된' 파일이 실제로 곤란한 일을 만듭니다."
                : "이번 측정에서는 일부 결과물에서 메모가 사라졌습니다. 이 결과에 기대지 말고 내 파일을 직접 확인하세요."}{" "}
              파일을 보내기 전에, PDF를 만든 프로그램에서 메모를 지우거나 아래처럼 페이지를 이미지로 바꾸세요.
            </p>
          </section>

          <section>
            <h2 className={H2}>
              <ShieldAlert className={H2_ICON} aria-hidden="true" />
              검은 상자로 덮는 것은 가리기가 아닙니다
            </h2>
            <p className="text-muted-foreground leading-7">
              이름을 &lsquo;검게 칠할&rsquo; 때 흔히 하듯, 1쪽 제목 위에 검은 사각형을 그린 뒤 그 쪽을 추출했습니다. 제목
              &ldquo;{demo.coveredText.text}&rdquo;는{" "}
              {demo.coveredText.extractableInSource ? "가린 원본에서 여전히 텍스트로 추출되었고" : "가린 원본에서 추출되지 않았고"}
              {demo.coveredText.extractableAfterExtract ? ", 추출한 쪽에서도 그대로 추출되었습니다" : ""}. 상자는 위에 그려졌을 뿐 아래
              글자는 여전히 페이지의 일부라서, 드래그해 복사하거나 텍스트 추출 도구를 쓰면 그대로 나옵니다. 페이지 도구는 페이지에 있는
              것을 상자와 숨은 글자까지 통째로 복사합니다.
            </p>
          </section>

          <section>
            <h2 className={H2}>
              <FileImage className={H2_ICON} aria-hidden="true" />
              페이지를 이미지로 바꾸면: 픽셀만 남습니다
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              정보를 넣은 파일의 1쪽을 변환기와 같은 방식으로 {width}×{height} 픽셀로 렌더링해 PNG와 JPG로 저장한 뒤, 각 이미지 파일
              안의 블록을 전부 나열했습니다.
            </p>
            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">결과물</th>
                    <th className="p-3 font-bold">파일 안에 든 것</th>
                    <th className="p-3 font-bold">문서 속성·메모 내용</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t border-border align-top">
                    <td className="p-3 font-medium text-foreground">PNG</td>
                    <td className="p-3 text-xs">
                      청크: <span className="font-mono">{demo.pageAsImage.png.structure.join(", ")}</span> — 헤더, 픽셀 데이터,
                      끝 표시뿐입니다. 텍스트, EXIF, XMP 청크는 없습니다.
                    </td>
                    <td className="p-3">{demo.pageAsImage.png.containsAnyDocumentText ? <Kept>발견</Kept> : <Gone />}</td>
                  </tr>
                  <tr className="border-t border-border align-top">
                    <td className="p-3 font-medium text-foreground">JPG</td>
                    <td className="p-3 text-xs">JFIF 헤더, ICC 색상 프로필, 압축된 이미지. EXIF나 XMP 세그먼트는 없습니다.</td>
                    <td className="p-3">
                      {demo.pageAsImage.jpeg.containsAnyDocumentText || demo.pageAsImage.jpeg.exif ? <Kept>발견</Kept> : <Gone />}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-muted-foreground leading-7">
              페이지 이미지에는 물려받을 속성도, 주석 층도, 텍스트 층도 없습니다. 보이는 것이 전부입니다. 그래서 이번 실험에서 상자 아래
              숨은 글자까지 실제로 없애 주는 결과물은 이것 하나뿐입니다. 보이는 픽셀만 남기 때문입니다. 대가도 분명합니다. 글자를 선택하거나
              검색할 수 없고, {width}×{height}는 인쇄보다 화면용에 맞는 해상도입니다. 이 장단점은{" "}
              <Link className="underline font-medium" href="/guides/pdf-to-image-use-cases/">PDF → 이미지 가이드(영문)</Link>에
              수치로 정리해 두었습니다.
            </p>
          </section>

          <section>
            <h2>이 실험이 다루지 않은 것</h2>
            <ul className="space-y-3 text-muted-foreground leading-7">
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                <strong>페이지에 인쇄된 내용.</strong> 머리글·바닥글의 이름, 서명, 각주에 찍힌 파일 경로, PDF로 인쇄되면서 함께 찍힌
                변경 내용 추적은 페이지 내용이라 어떤 페이지 도구를 거쳐도 남습니다.
              </li>
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                <strong>PDF가 데이터를 숨길 수 있는 모든 방법.</strong> PDF에는 첨부 파일, 양식 입력값, 자바스크립트, 이전 편집에서 남은
                객체도 들어갈 수 있습니다. 이번에는 흔한 경우인 속성, XMP, 메모만 시험했습니다.
              </li>
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                <strong>암호가 걸린 PDF.</strong> 이 도구들로는 아예 열 수 없습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2>PDF를 보내기 전 확인할 것</h2>
            <ol className="list-decimal space-y-2 pl-6 text-muted-foreground leading-7">
              <li>PDF 뷰어에서 파일 → 속성(문서 정보)을 열어 제목과 작성자를 확인합니다.</li>
              <li>메모(주석) 패널을 열어, 보낼 생각이 없던 메모, 형광펜, 노트를 지웁니다.</li>
              <li>
                글자를 덮어서 가리지 마세요. 제대로 된 가리기(교정, redaction) 기능을 쓰거나, 해당 쪽을{" "}
                <Link className="underline font-medium" href="/convert/pdf/">PDF → 이미지 변환기</Link>로 이미지로 바꿉니다.
              </li>
              <li>
                일부 쪽만 보낼 때는 <Link className="underline font-medium" href="/edit/pdf/">해당 쪽만 추출</Link>하세요. 새 파일에는
                원본의 제목, 작성자, XMP가 따라가지 않습니다. 다만 메모 패널은 한 번 더 확인하세요.
              </li>
            </ol>
          </section>

          <div className="rounded-field border border-border bg-muted p-4 text-sm text-muted-foreground">
            {UPDATED}에 {demo.browser}, {demo.library}로 측정했습니다. 시험 파일은 합성한 것이며, 안에 든 이름은 모두 지어낸 것입니다.
          </div>

          <div className="rounded-field border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
              <Download className="h-5 w-5" aria-hidden="true" /> 직접 해 보기
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              정보를 넣은 샘플을 내려받아 아무 PDF 뷰어에서나 속성과 메모를 열어 본 뒤, 도구로 한 쪽을 추출해서 비교해 보세요.
            </p>
            <a className="underline font-medium text-foreground" href={demo.sampleFile} download>
              pdf-metadata-sample.pdf ({Math.round(demo.source.bytes / 1024)} KB)
            </a>
          </div>

          <div className="rounded-field border border-border bg-muted p-6">
            <p className="text-muted-foreground leading-7">
              문서가 아니라 사진을 보내시나요?{" "}
              <Link className="underline font-medium" href="/ko/guides/exif-metadata-privacy/">사진 EXIF와 개인정보 가이드</Link>는
              사진의 위치와 카메라 정보로 같은 실험을 했고,{" "}
              <Link className="underline font-medium" href="/ko/view/exif/">EXIF 뷰어</Link>로 공유 전에 사진을 확인할 수 있습니다.
            </p>
          </div>
        </Prose>
      </div>
    </main>
  );
}
