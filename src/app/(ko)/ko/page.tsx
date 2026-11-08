import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, CircleAlert, Clock, Eraser, FileSearch, FileText, Fingerprint, ListChecks, MapPin, PenLine, Share2, ShieldCheck, User } from "lucide-react";
import exifDemo from "@/data/exif-demo.json";
import pdfMetaDemo from "@/data/pdf-metadata-demo.json";
import { alternatesFor } from "@/lib/locale";
import HomePhotoDrop from "@/components/HomePhotoDrop";

export const metadata: Metadata = {
  title: "BravoConvert - 사진을 보내기 전에 위치·기기 정보 확인하고 지우기",
  description:
    "사진에 촬영 위치(GPS), 시간, 기기 정보가 들어 있는지 확인하고, 변환해서 지우세요. 파일은 브라우저 안에서만 처리되고 업로드되지 않습니다.",
  keywords: ["사진 위치정보 확인", "사진 위치정보 삭제", "EXIF 확인", "EXIF 삭제", "사진 메타데이터", "PDF 작성자 정보", "업로드 없는 변환"],
  alternates: alternatesFor("/", "ko"),
};

// exif-demo.json 의 필드명을 한국어로. 값은 스크립트가 만든 샘플 사진의 실제 값이다.
const demoLabels: Record<string, string> = {
  Make: "카메라 제조사",
  Model: "카메라 모델",
  DateTimeOriginal: "촬영 시각",
  Orientation: "회전 정보",
  latitude: "GPS 위도",
  longitude: "GPS 경도",
  GPSLatitudeRef: "위도 방향",
  GPSLongitudeRef: "경도 방향",
};

const revealed = [
  { icon: MapPin, label: "어디서 찍었는지", body: "카메라 앱에 위치 권한이 있으면 집을 찾아낼 수 있을 만큼 정확한 GPS 좌표가 기록됩니다." },
  { icon: Clock, label: "언제 찍었는지", body: "초 단위의 날짜와 시간. 말하지 않은 시각에 어디 있었는지가 드러날 수 있습니다." },
  { icon: Camera, label: "무엇으로 찍었는지", body: "휴대폰이나 카메라의 제조사와 모델, 때로는 렌즈까지." },
  { icon: Fingerprint, label: "정확히 어느 기기인지", body: "일부 카메라는 본체 일련번호를 남겨, 모든 사진이 한 대의 기기로 이어집니다." },
  { icon: User, label: "누구의 기기인지", body: "카메라나 편집 앱에 설정한 소유자, 작가, 저작권자 이름." },
  { icon: PenLine, label: "무엇으로 편집했는지", body: "파일을 마지막으로 저장한 프로그램, 일부 환경에서는 컴퓨터 이름까지." },
];

const steps = [
  {
    icon: FileSearch,
    title: "1. 확인",
    body: "여섯 가지 숨은 정보 중 무엇이 들어 있는지 보여 줍니다. 위치가 있으면 좌표까지.",
    href: "/ko/view/exif/",
    cta: "사진 확인하기",
  },
  {
    icon: Eraser,
    title: "2. 지우기",
    body: "'바로 지우기'를 누르면 정보를 뺀 사본을 받습니다. 여러 장도 한 번에.",
    href: "/ko/view/exif/?sample=1",
    cta: "샘플로 해보기",
  },
  {
    icon: Share2,
    title: "3. 확인하고 공유",
    body: "사본은 자동으로 다시 검사됩니다. 사진에 찍힌 간판·얼굴만 직접 확인하세요.",
    href: "/ko/guides/exif-metadata-privacy/",
    cta: "실험 결과 보기",
  },
];

const commonTasks = [
  {
    task: "중고거래에 집에서 찍은 사진을 올릴 때",
    how: "집 안에서 찍은 판매 사진에는 집의 좌표가 들어 있을 수 있습니다. 올릴 사진을 한꺼번에 뷰어에 넣고 '모두 지우기'를 누르면, 위치가 빠진 사본을 받아 그대로 올릴 수 있습니다.",
    tool: "EXIF 뷰어",
    href: "/ko/view/exif/",
  },
  {
    task: "아이 사진을 공개 계정에 올릴 때",
    how: "집이나 어린이집에서 찍은 사진이라면 위치가 먼저 걱정입니다. 뷰어로 확인하고, 위치가 있으면 '바로 지우기'로 받은 사본을 올리세요. 교복, 이름표, 간판 같은 보이는 단서도 함께 살피세요.",
    tool: "EXIF 뷰어",
    href: "/ko/view/exif/",
  },
  {
    task: "회사 문서 PDF를 외부에 보낼 때",
    how: "작성자 이름과 내부 검토 메모가 남아 있는지부터 보세요. 병합·추출하면 문서 속성은 사라지지만 메모는 따라갑니다.",
    tool: "PDF 가이드",
    href: "/ko/guides/pdf-metadata-privacy/",
  },
  {
    task: "긴 PDF에서 몇 쪽만 보내야 할 때",
    how: "필요한 쪽만 새 PDF로 추출하면 나머지 내용이 함께 가지 않습니다. 파일은 브라우저 안에서만 처리되고 서버로 올라가지 않습니다.",
    tool: "PDF 병합·분할 (영문)",
    href: "/edit/pdf/",
  },
];

export default function KoreanHome() {
  const survivedCount = exifDemo.after.filter((f) => f.value !== null).length;

  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "BravoConvert",
            url: "https://bravoconvert.com/ko/",
            inLanguage: "ko",
            description: "사진이 무엇을 드러내는지 공유 전에 확인하고, 업로드 없이 지우는 브라우저 도구.",
            publisher: { "@type": "Organization", name: "BravoConvert", url: "https://bravoconvert.com/" },
          }),
        }}
      />
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">BravoConvert</p>
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            사진을 보내기 전에, 무엇이 함께 가는지 확인하세요
          </h1>
          <p className="text-lg md:text-xl text-black max-w-3xl mx-auto mb-8 leading-8">
            사진에는 찍은 장소, 시간, 휴대폰 기종이 함께 저장되는 경우가 많습니다. 보내기 전에 확인하고, 그림만 남겨 보내세요.
          </p>
          <HomePhotoDrop locale="ko" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-bold text-black">{step.title}</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-700">{step.body}</p>
                <Link href={step.href} className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-brand-700 hover:text-brand-800">
                  {step.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>

        <section className="max-w-5xl mx-auto mt-16 space-y-12 text-gray-800">
          <div>
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-black">
              <ShieldCheck className="hidden h-8 w-8 flex-shrink-0 text-brand-600 sm:block" aria-hidden="true" />
              짐작이 아니라 측정: 변환 후 무엇이 남는가
            </h2>
            <p className="leading-7 mb-5">
              그림을 봐서는 아무도 모르는 {exifDemo.exifBlockBytes}바이트, {exifDemo.before.length}개 메타데이터 필드를 넣은 샘플 사진을
              만들었습니다. 그리고 변환기와 같은 디코딩·다시 그리기 과정을 거친 뒤 EXIF 파서로 결과를 다시 읽었습니다.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <caption className="caption-top border-b border-gray-200 p-3 text-left">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${survivedCount === 0 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>
                    {survivedCount === 0 ? `변환 후 ${exifDemo.before.length}개 모두 사라짐` : `변환 후 ${survivedCount}개 남음`}
                  </span>
                </caption>
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">항목</th>
                    <th className="p-3 font-bold">원본 값</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {exifDemo.before.map((row, index) => (
                    <tr key={row.field} className="border-t border-gray-200">
                      <td className="p-3 font-medium text-black">{demoLabels[row.field] ?? row.field}</td>
                      <td className="p-3 font-mono">
                        {exifDemo.after[index].value === null ? (
                          <s className="text-gray-400">{String(row.value)}</s>
                        ) : (
                          <>
                            {String(row.value)} <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 font-sans text-xs font-semibold text-amber-900">남음</span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 leading-7">
              {survivedCount === 0 ? "남은 필드는 하나도 없었습니다." : `${survivedCount}개 필드가 남았습니다.`} 샘플은 가상의 정보를 넣은 실제
              파일이라 <Link href="/ko/view/exif/" className="underline font-medium">뷰어에서 직접 열어 볼 수</Link> 있습니다. 전체 실험과
              메타데이터 제거로 막을 수 없는 것은{" "}
              <Link href="/ko/guides/exif-metadata-privacy/" className="underline font-medium">EXIF와 개인정보 가이드</Link>에 정리했습니다.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-3xl font-bold text-black">사진이 나에 대해 말해 주는 것</h2>
            <p className="mb-5 leading-7">
              EXIF 뷰어가 찾는 여섯 가지입니다. 한 사진에 전부 들어 있는 경우는 드물고, 어떤 항목이 들어가는지는 사진 내용이 아니라 기기와
              설정에 달려 있습니다.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {revealed.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <div className="mb-1 flex items-center gap-2 font-bold text-black">
                      <Icon className="h-5 w-5 flex-shrink-0 text-gray-700" aria-hidden="true" />
                      {item.label}
                    </div>
                    <p className="text-sm leading-6 text-gray-700">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-black">
              <FileText className="hidden h-8 w-8 flex-shrink-0 text-brand-600 sm:block" aria-hidden="true" />
              PDF도 작성자를 기억합니다
            </h2>
            <p className="leading-7">
              PDF에는 작성자, 초안 제목, 작성 프로그램 같은 문서 속성과 검토 메모가 들어 있을 수 있습니다. 직접 실험해 보니, 페이지를
              병합·추출·분할하면 속성은 사라졌지만 메모는{" "}
              {pdfMetaDemo.merged.comments.length > 0 ? "검토자 이름과 함께 그대로 남았습니다" : "함께 사라졌습니다"}. 검은 상자로 덮은
              글자도{" "}
              {pdfMetaDemo.coveredText.extractableAfterExtract ? "여전히 텍스트로 읽혔습니다" : "읽히지 않았습니다"}. 자세한 결과는{" "}
              <Link href="/ko/guides/pdf-metadata-privacy/" className="underline font-medium">PDF가 드러내는 것</Link>에 있습니다.
            </p>
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-black">
              <ListChecks className="hidden h-8 w-8 flex-shrink-0 text-brand-600 sm:block" aria-hidden="true" />
              이럴 때 쓰세요
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {commonTasks.map((task) => (
                <div key={task.task} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-1 font-bold text-black">{task.task}</div>
                  <p className="text-sm leading-6 text-gray-700">
                    {task.how}{" "}
                    <Link href={task.href} className="underline font-medium">
                      {task.tool}
                    </Link>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <CircleAlert className="hidden h-7 w-7 flex-shrink-0 text-brand-600 sm:block" aria-hidden="true" />
              메타데이터를 지워도 해결되지 않는 것
            </h2>
            <p className="leading-7 mb-3">
              변환은 그림과 함께 저장된 정보를 지울 뿐, 그림 자체는 건드리지 않습니다. 도로명 표지판, 동·호수, 얼굴, 창문에 비친 모습, 뒤에
              켜진 모니터는 GPS 좌표만큼이나 장소와 사람을 알려 줍니다. 보내기 전에 사진을 한 번 더 보세요.
            </p>
            <p className="leading-7">
              지원 형식은 JPG, PNG, WebP 이미지와 PDF 문서입니다. 아이폰 기본 형식인 HEIC과 RAW, TIFF, GIF, BMP는 지원하지 않습니다.
              아이폰은 설정 → 카메라 → 포맷에서 &ldquo;높은 호환성&rdquo;을 고르면 JPG로 촬영됩니다. 변환은 사본을 만드는 것이니 원본은
              보관해 두세요.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-2 text-xl font-bold text-black">한국어로 제공되는 범위</h2>
            <p className="leading-7">
              지금은 EXIF 뷰어와 개인정보 가이드를 한국어로 제공합니다. 이미지 변환기, PDF 도구, FAQ 같은 나머지 페이지는 영어지만, 화면이
              단순해서 버튼 몇 개만 알면 쓸 수 있습니다. 모든 가이드는 <Link href="/ko/guides/" className="underline font-medium">가이드 목록</Link>에서
              볼 수 있습니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
