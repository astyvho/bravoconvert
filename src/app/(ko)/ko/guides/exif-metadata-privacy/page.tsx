import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Check, Download, Fingerprint, FlaskConical, MapPin, RefreshCw, ShieldAlert, X } from "lucide-react";
import demo from "@/data/exif-demo.json";
import { alternatesFor } from "@/lib/locale";

const PUBLISHED = "2026-11-08";
const UPDATED = demo.generatedAt;

export const metadata: Metadata = {
  title: "사진 EXIF와 개인정보: 변환 전후를 직접 확인했습니다 | BravoConvert",
  description:
    "GPS 좌표, 카메라 모델, 촬영 시각을 넣은 JPG를 만들어 변환기에 통과시키고 메타데이터를 다시 읽었습니다. 무엇이 남았는지, 그리고 EXIF를 지워도 막을 수 없는 것은 무엇인지 정리했습니다.",
  alternates: alternatesFor("/guides/exif-metadata-privacy/", "ko"),
  openGraph: {
    title: "사진 EXIF와 개인정보: 변환 전후 직접 확인",
    description: "정보를 심은 샘플 사진을 변환한 뒤 필드별로 다시 읽었습니다. 메타데이터 제거의 한계도 함께 다룹니다.",
    type: "article",
    locale: "ko_KR",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const FIELD_LABELS: Record<string, string> = {
  Make: "카메라 제조사",
  Model: "카메라 모델",
  DateTimeOriginal: "촬영 시각",
  Orientation: "회전 정보",
  latitude: "GPS 위도",
  longitude: "GPS 경도",
  GPSLatitudeRef: "위도 방향 (북/남)",
  GPSLongitudeRef: "경도 방향 (동/서)",
};

const rows = demo.before.map((row, index) => ({
  field: row.field,
  label: FIELD_LABELS[row.field] ?? row.field,
  before: row.value,
  after: demo.after[index].value,
}));

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "사진 EXIF와 개인정보: 변환 전후를 직접 확인했습니다",
  description: "BravoConvert로 이미지를 변환하면 GPS 좌표를 포함한 EXIF 메타데이터가 사라지는지 실험하고, 그 보호의 한계를 정리한 글.",
  inLanguage: "ko",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://bravoconvert.com/ko/guides/exif-metadata-privacy/" },
};

const H2 = "mb-3 flex items-center gap-3 text-2xl font-bold text-black";
const H2_ICON = "h-7 w-7 flex-shrink-0 text-gray-700";

export default function KoreanExifPrivacyGuide() {
  const share = Math.round((demo.exifBlockBytes / demo.sourceBytes) * 100);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Fingerprint className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            사진 EXIF와 개인정보
          </h1>
          <p className="mb-4 text-xl text-black">사진 파일 안에 숨어 있는 것</p>
          <p className="text-base text-gray-600">정보를 심은 사진을 변환한 뒤, 메타데이터를 필드 하나하나 다시 읽었습니다</p>
          <p className="mt-4 text-sm text-gray-500">
            게시 <time dateTime={PUBLISHED}>{PUBLISHED}</time> · 측정 <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg md:p-10">
          <section>
            <h2 className={H2}>
              <Camera className={H2_ICON} aria-hidden="true" />
              EXIF란
            </h2>
            <p className="text-gray-700 leading-7">
              EXIF(Exchangeable Image File Format)는 카메라와 휴대폰이 JPG 안에 픽셀과 함께 써 넣는 메타데이터입니다. 보통 촬영 날짜와
              시간, 카메라나 휴대폰 모델, 노출과 렌즈 설정, 사진을 어느 방향으로 세워 보여 줄지 알려 주는 회전 정보가 들어가고, 위치
              서비스가 켜져 있었다면 셔터를 누른 곳의 GPS 좌표도 기록됩니다. 사진을 봐서는 하나도 보이지 않지만, 모두 파일과 함께 이동합니다.
            </p>
          </section>

          <section>
            <h2 className={H2}>
              <FlaskConical className={H2_ICON} aria-hidden="true" />
              짐작하지 않고 실험했습니다
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              &ldquo;변환하면 메타데이터가 지워진다&rdquo;고 말하기는 쉽습니다. 그래서 카메라 제조사와 모델, 촬영 시각, 회전 정보, 런던
              트라팔가 광장을 가리키는 GPS 좌표까지 EXIF를 빠짐없이 넣은 JPG를 만들었습니다. 그리고{" "}
              <Link className="underline font-medium" href="/convert/img/">이미지 변환기</Link>가 쓰는 것과 같은 &ldquo;캔버스로
              디코딩한 뒤 다시 인코딩&rdquo; 과정에 통과시키고, 나온 파일의 메타데이터를 다시 읽었습니다.
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">항목</th>
                    <th className="p-3 font-bold">원본</th>
                    <th className="p-3 font-bold">변환 후</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {rows.map((row) => (
                    <tr key={row.field} className="border-t border-gray-200">
                      <td className="p-3 font-medium text-black">{row.label}</td>
                      <td className="p-3 font-mono text-xs">{String(row.before)}</td>
                      <td className="p-3">
                        {row.after === null ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-green-700">
                            <Check className="h-4 w-4" aria-hidden="true" /> 사라짐
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-medium text-red-700">
                            <X className="h-4 w-4" aria-hidden="true" /> {String(row.after)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-5 text-gray-800 leading-7">
              <strong>{demo.anyFieldSurvived ? "일부 필드가 남았습니다." : "모든 필드가 사라졌습니다."}</strong> EXIF 블록은 원본{" "}
              {demo.sourceBytes.toLocaleString("ko-KR")}바이트 가운데 {demo.exifBlockBytes}바이트, 약 {share}%였습니다. 변환 후에는
              파서가 그중 아무것도 찾지 못했습니다. 결과 파일은 원본 파일을 복사한 것이 아니라 픽셀에서 새로 인코딩한 것이라, 원래
              메타데이터가 따라 들어갈 자리가 없기 때문입니다.
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              {UPDATED}에 Chromium {demo.engine}에서 <code className="rounded bg-gray-100 px-1.5 py-0.5">exifr</code> 파서로
              측정했습니다. 샘플은 합성한 사진이고, 좌표는 누군가의 집이 아닌 공공장소를 가리킵니다. 표의 값은 파일에 실제로 들어 있는
              그대로이며, 카메라 이름은 가상입니다.
            </div>

            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 font-bold text-black">
                <Download className="h-5 w-5" aria-hidden="true" /> 직접 해 보기
              </div>
              <img
                src={demo.sourceFile}
                width={640}
                height={480}
                alt="합성 샘플 사진: 어두운 능선 위로 노을 그라데이션. 그림 어디에도 파일 속 GPS 좌표를 짐작할 단서가 없다."
                className="mb-3 h-auto w-full max-w-md rounded-lg border border-gray-200"
                loading="lazy"
              />
              <p className="mb-3 text-sm text-gray-700">
                이 그림만 봐서는 어디서 찍혔는지 알 수 없습니다. 샘플을 내려받아{" "}
                <Link className="underline font-medium" href="/ko/view/exif/">EXIF 뷰어</Link>에서 메타데이터가 있는지 확인한 뒤,
                변환기에 넣어 변환하고 다시 확인해 보세요.
              </p>
              <a className="underline font-medium text-gray-800" href={demo.sourceFile} download>
                exif-sample-with-metadata.jpg ({Math.round(demo.sourceBytes / 1024)} KB)
              </a>
            </div>
          </section>

          <section>
            <h2 className={H2}>
              <MapPin className={H2_ICON} aria-hidden="true" />
              왜 중요한가
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              위 좌표는 지도에서 몇 미터 안의 한 지점을 가리킵니다. 문제는 이 한 줄에 다 들어 있습니다. 거실에서 찍어 공개적으로 올린
              사진이 거실의 주소를 담고 있을 수 있는데, 화면에는 아무 표시도 없습니다.
            </p>
            <ul className="space-y-3 text-gray-700 leading-7">
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                중고거래에 집에서 찍은 물건 사진을 올리면, 가격과 함께 사는 곳까지 올라갈 수 있습니다.
              </li>
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                공개 계정에 올린 아이 사진이 학교나 집의 좌표를 담고 있을 수 있습니다.
              </li>
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                여러 사진의 촬영 시각과 기기 모델을 맞춰 보면, 서로 다른 계정이 같은 사람, 같은 휴대폰이라는 것이 드러납니다.
              </li>
            </ul>
            <p className="mt-4 text-gray-700 leading-7">
              업로드할 때 EXIF를 지워 주는 서비스도 있지만, 메신저, 파일 공유, 이메일 첨부, 커뮤니티 게시판처럼 원본을 그대로 전달하는
              경우도 많습니다. 같은 앱이라도 &ldquo;원본으로 보내기&rdquo; 같은 설정에 따라 달라질 수 있습니다. 받는 쪽에서 알아서
              지워 줄 거라고 가정하지 않는 편이 안전합니다.
            </p>
          </section>

          <section>
            <h2 className={H2}>
              <ShieldAlert className={H2_ICON} aria-hidden="true" />
              EXIF를 지워도 막을 수 없는 것
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              대부분의 글이 여기서 멈추지만, 실제로 나를 지켜 주는 것은 이 부분입니다. 메타데이터 제거가 막아 주는 범위는 좁습니다.
            </p>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-1 font-bold text-black">사진에 보이는 것은 그대로입니다</div>
                <p className="text-sm text-gray-700 leading-6">
                  도로명 표지판, 동·호수, 유리에 비친 모습, 이메일이 떠 있는 모니터, 이름표는 모두 픽셀이라 어떤 변환을 거쳐도 남습니다.
                  현관문이 훤히 보이는 사진에서 GPS만 지워서는 얻는 것이 거의 없습니다.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-1 font-bold text-black">이미 보낸 파일은 되돌릴 수 없습니다</div>
                <p className="text-sm text-gray-700 leading-6">
                  오늘 사본을 변환해도 지난주에 누군가 내려받은 사본은 그대로입니다. 공유한 뒤가 아니라 공유하기 전에 지우세요.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-1 font-bold text-black">전용 삭제 기능이 아니라 재인코딩의 결과입니다</div>
                <p className="text-sm text-gray-700 leading-6">
                  메타데이터가 사라지는 이유는 결과물을 원본 파일에서 복사하지 않고 디코딩한 픽셀로 새로 만들기 때문입니다. EXIF 블록에
                  대해서는 확실하지만, 특정 카메라가 써 넣었을 수 있는 모든 바이트에 대한 포렌식 수준의 보장과는 다릅니다.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-1 font-bold text-black">용량이 줄지는 않습니다</div>
                <p className="text-sm text-gray-700 leading-6">
                  이번 EXIF 블록은 {demo.exifBlockBytes}바이트였는데, 변환한 파일은 오히려 원본보다 <em>컸습니다</em>
                  ({demo.convertedBytes.toLocaleString("ko-KR")}바이트 대 {demo.sourceBytes.toLocaleString("ko-KR")}바이트). 이미
                  압축된 픽셀을 다시 압축하는 비용이 지운 메타데이터보다 컸기 때문입니다. 용량을 줄이는 것이 목적이라면{" "}
                  <Link className="underline font-medium" href="/guides/reduce-image-file-size/">파일 크기 가이드(영문)</Link>를 보세요.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={H2}>
              <RefreshCw className={H2_ICON} aria-hidden="true" />
              회전 정보는 특별한 경우입니다
            </h2>
            <p className="text-gray-700 leading-7">
              EXIF 중 실제로 하는 일이 있는 필드가 하나 있는데, 바로 회전 정보입니다. 휴대폰은 센서가 찍은 그대로 저장하고 &ldquo;90°
              돌려서 보여 줄 것&rdquo;이라는 표시만 남기는 경우가 많습니다. 이 표시만 단순히 지우면 사진이 옆으로 눕습니다. 변환기는
              회전 정보를 먼저 읽고 그 회전을 픽셀에 직접 적용하기 때문에, 표시가 없어도 결과물이 바르게 보입니다. 위 표에서 회전 정보가
              원본에는 <em>Rotate 90 CW</em>, 변환 후에는 없는데도 사진이 바로 서 있는 이유입니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">습관으로 만들기</h2>
            <p className="text-gray-700 leading-7">
              사진을 공개적으로 올리거나 모르는 사람에게 보내기 전에,{" "}
              <Link className="underline font-medium" href="/ko/view/exif/">EXIF 뷰어</Link>로 무엇이 들어 있는지 확인하고,{" "}
              <Link className="underline font-medium" href="/convert/img/">이미지 변환기</Link>로 변환한 결과물을 원본 대신 보내세요.
              변환은 브라우저 안에서 이루어지므로, 좌표가 들어 있는 원본 파일은 어디에도(저희에게도) 업로드되지 않습니다. 장기적으로는
              카메라 앱에서 위치 기록을 끄는 것이 더 나은 해결책입니다. 처음부터 기록되지 않으니까요. 갤럭시와 아이폰에서 끄는 방법은{" "}
              <Link className="underline font-medium" href="/ko/view/exif/">EXIF 뷰어 페이지</Link>에 정리해 두었습니다.
            </p>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700 leading-7">
              문서를 보낼 때도 비슷한 일이 생깁니다.{" "}
              <Link className="underline font-medium" href="/ko/guides/pdf-metadata-privacy/">PDF가 드러내는 것</Link>에서는 PDF의
              작성자, 메모, 검은 상자로 가린 글자로 같은 실험을 했습니다.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
