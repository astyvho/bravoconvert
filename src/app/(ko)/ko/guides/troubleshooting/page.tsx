import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import IconTile from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";
import Link from "next/link";
import { Cpu, ListChecks, Smartphone } from "lucide-react";
import { alternatesFor } from "@/lib/locale";

const PUBLISHED = "2026-11-14";
const UPDATED = "2026-11-14";

export const metadata: Metadata = {
  title: "변환이 안 될 때: 문제 해결 가이드 | BravoConvert",
  description:
    "파일이 거부될 때, 변환이 멈출 때, 다운로드가 안 될 때, 결과가 생각보다 흐릴 때. 각각의 실제 한계와 해결 방법을 정리했습니다.",
  alternates: alternatesFor("/guides/troubleshooting/", "ko"),
  openGraph: {
    title: "변환이 안 될 때: 문제 해결 가이드",
    description: "실패할 때마다 뒤에 있는 실제 제한과, 무엇을 바꾸면 되는지.",
    type: "article",
    locale: "ko_KR",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const limits = [
  {
    tool: "사진 정보 확인 (EXIF)",
    accepts: "JPG, PNG, WebP",
    produces: "정보를 지운 사본 (같은 형식, JPG, PNG, WebP) 또는 ZIP",
    ceiling: "사진당 25 MB, 한 번에 30장",
    href: "/ko/view/exif/",
    english: false,
  },
  {
    tool: "이미지 변환기",
    accepts: "JPG / JPEG / JPE / JFIF, PNG, WebP",
    produces: "WebP, JPG, PNG, PDF",
    ceiling: "이미지당 10 MB",
    href: "/convert/img/",
    english: true,
  },
  {
    tool: "이미지 편집기",
    accepts: "JPG / JPEG, PNG, WebP",
    produces: "JPG, PNG, WebP",
    ceiling: "10 MB, 한 변 16,384 px, 6,400만 화소",
    href: "/edit/image/",
    english: true,
  },
  {
    tool: "PDF 변환기",
    accepts: "PDF",
    produces: "PNG, JPG",
    ceiling: "문서당 50 MB",
    href: "/convert/pdf/",
    english: true,
  },
  {
    tool: "PDF 병합·분할",
    accepts: "PDF",
    produces: "PDF, 또는 한 페이지씩 나눈 PDF의 ZIP",
    ceiling: "파일당 50 MB, 합치기는 30개·합계 150 MB까지",
    href: "/edit/pdf/",
    english: true,
  },
];

const issues = [
  {
    problem: "파일을 넣자마자 거부돼요",
    cause: "지원하지 않는 형식이거나, 그 도구의 용량 한도를 넘었습니다.",
    fix: (
      <>
        위 표를 확인해 보세요. 이미지 도구는 JPG, PNG, WebP만 받습니다. 아이폰 기본 형식인 HEIC, CR2·DNG 같은 RAW 파일,
        TIFF, GIF, BMP, SVG는 받지 않습니다. 확장자를 <code>.heic</code>에서 <code>.jpg</code>로 바꿔도 안은 여전히
        HEIC라서 거부됩니다. 파일 이름이 아니라 실제 형식을 확인하기 때문입니다. 아이폰은 설정 → 카메라 → 포맷에서
        &ldquo;높은 호환성&rdquo;을 고르면 앞으로 찍는 사진이 JPG로 저장됩니다.
      </>
    ),
  },
  {
    problem: "PDF가 열리지 않아요",
    cause: "비밀번호가 걸려 있거나 암호화된 문서, 또는 50 MB를 넘는 문서입니다.",
    fix: (
      <>
        암호화된 PDF는 브라우저에서 풀 수 없어 불러오지 못합니다. 문서를 만든 프로그램에서 비밀번호를 해제한 뒤 그 사본을
        변환하세요. 단순히 파일이 큰 경우라면 페이지를 나눠서 각 파일을 한도 아래로 만들면 됩니다.
      </>
    ),
  },
  {
    problem: "변환이 느리거나 멈추고, 탭이 응답하지 않아요",
    cause: "모든 작업이 여러분의 기기에서 돌아갑니다. 서버 대기열이 아니라 내 기기의 CPU와 메모리를 쓰는 중입니다.",
    fix: (
      <>
        긴 PDF나 큰 사진 여러 장은 시간이 꽤 걸리고, 휴대폰에서는 더 그렇습니다. 다른 탭과 앱을 닫고, 조금씩 나눠서 변환하고,
        작업이 끝날 때까지 탭을 화면에 띄워 두세요. 브라우저는 뒤로 간 탭을 강하게 늦추기 때문에, 작업이 중간에 멈춘 것처럼
        보이는 대부분의 이유가 이것입니다. 사진 한 장이 아주 크다면{" "}
        <Link href="/edit/image/">이미지 편집기 (영문)</Link>에서 먼저 크기를 줄이면 훨씬 가벼워집니다.
      </>
    ),
  },
  {
    problem: "다운로드가 시작되지 않거나 파일을 못 찾겠어요",
    cause: "브라우저가 여러 파일 자동 다운로드를 막거나 묶어 두고, 저장 위치가 예상과 다를 때가 있습니다.",
    fix: (
      <>
        주소창 근처에 팝업 차단이나 &ldquo;여러 파일 다운로드 허용&rdquo; 알림이 떴는지 보고 허용해 주세요. 다운로드 폴더보다
        브라우저의 다운로드 목록을 확인하는 편이 정확합니다. 아이폰에서는 파일이 사진 앱이 아니라 파일 앱의
        &ldquo;다운로드&rdquo; 폴더에 저장되고, 여러 장을 변환하면 ZIP으로 받아져서 한 번 눌러야 풀립니다. 카카오톡 같은 앱 안
        브라우저에서는 다운로드가 자주 실패하니 Safari나 Chrome으로 열어 주세요.
      </>
    ),
  },
  {
    problem: "결과가 흐리거나 깍두기처럼 깨지거나 색이 바랬어요",
    cause: "화질 설정이 너무 낮거나, 이미지를 줄인 게 아니라 키웠습니다.",
    fix: (
      <>
        화질을 올려 보세요. 보통 0.8 안팎이 적당하고, 0.6 아래부터는 깨짐이 눈에 보입니다. 확대한다고 디테일이 생기지는
        않습니다. 400 px 이미지를 2000 px로 늘리면 흐릿한 2000 px 이미지가 될 뿐입니다. 이미 한 번 압축된 사본보다 가지고 있는
        가장 큰 원본에서 시작하세요. 다시 저장할 때마다 손실이 쌓입니다. 화질과 용량의 관계는{" "}
        <Link href="/ko/guides/reduce-image-file-size/">이미지 용량 줄이기</Link>에 측정값으로 정리돼 있습니다.
      </>
    ),
  },
  {
    problem: "JPG로 바꿨더니 투명한 부분이 검정이나 흰색이 됐어요",
    cause: "JPG에는 투명 채널이 없습니다. 투명한 픽셀은 어떤 단색으로든 채워져야 합니다.",
    fix: (
      <>
        버그가 아니라 형식의 한계입니다. 투명도를 지키려면 PNG나 WebP를 고르세요. 꼭 JPG가 필요하다면{" "}
        <Link href="/edit/image/">이미지 편집기 (영문)</Link>에서 투명한 부분을 채울 배경색을 직접 고를 수 있습니다. 이미지
        변환기는 묻지 않고 자동으로 채웁니다.
      </>
    ),
  },
  {
    problem: "PDF에서 바꾼 페이지를 인쇄했더니 흐려요",
    cause: "페이지가 144 DPI로 그려지는데, 이건 화면용 해상도이지 인쇄용이 아닙니다.",
    fix: (
      <>
        인쇄소는 보통 300 DPI를 기대합니다. 인쇄할 거라면 원본 PDF를 보내세요. PDF의 글자는 벡터라 어떤 크기에서도
        선명합니다. 용지별 결과 크기는{" "}
        <Link href="/ko/guides/pdf-to-image-use-cases/">PDF를 이미지로 바꾸기</Link>에 있습니다.
      </>
    ),
  },
  {
    problem: "사진이 옆으로 돌아간 채로 나왔어요",
    cause: "휴대폰은 센서 이미지를 그대로 두고 방향 정보만 따로 적는 경우가 많고, 모든 프로그램이 그 정보를 따르지는 않습니다.",
    fix: (
      <>
        변환기는 방향 정보를 읽어서 회전을 픽셀에 반영하므로 결과는 똑바로 나와야 합니다. 원본의 방향 정보가 틀렸거나
        없다면 <Link href="/edit/image/">이미지 편집기 (영문)</Link>의 회전 버튼으로 한 번에 고칠 수 있습니다.
      </>
    ),
  },
  {
    problem: "지정한 목표 용량에 정확히 맞지 않아요",
    cause: "목표 용량은 계산이 아니라 여러 번 시도해서 다가가는 방식입니다.",
    fix: (
      <>
        변환기는 화질을 바꿔 가며 여러 번 다시 저장해서 목표에 가까워지고, 목표를 넘지 않는 것 중 가장 가까운 결과를
        남깁니다. 얼마나 가까워지는지는 이미지에 달려 있습니다. 노이즈가 많은 사진은 단순한 그래픽보다 줄일 수 있는 하한이
        훨씬 높습니다. 목표 용량은 정확한 숫자가 아니라 넘지 않을 상한으로 생각해 주세요.
      </>
    ),
  },
  {
    problem: "노트북에서는 되는데 휴대폰에서는 실패해요",
    cause: "모바일 브라우저는 메모리 한도가 훨씬 빡빡하고, 뒤로 간 탭을 빨리 정리합니다.",
    fix: (
      <>
        한 번에 넣는 파일 수를 줄이고, 작업 내내 탭을 화면에 띄워 두고, 큰 사진은 변환 전에 크기를 줄이세요. 4,800만 화소
        사진은 처리하는 동안 압축을 푼 상태로 들고 있는 데만 약 190 MB의 메모리가 필요해서, 모바일 탭이 강제로 닫히기에
        충분합니다.
      </>
    ),
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "ko",
  mainEntity: issues.map((issue) => ({
    "@type": "Question",
    name: issue.problem,
    acceptedAnswer: { "@type": "Answer", text: issue.cause },
  })),
};

export default function KoreanTroubleshootingGuide() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 break-keep sm:px-6">
        <ContentHeader label="가이드" title="변환이 안 될 때">
          <p className="mt-3 text-lg leading-relaxed text-foreground">무엇이 잘못됐고, 왜 그런지</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            실패는 대부분 형식, 용량 한도, 아니면 기기의 여유 공간 부족 중 하나입니다
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            게시 <time dateTime={PUBLISHED}>{PUBLISHED}</time>
          </p>
        </ContentHeader>

        <Prose as="article" className="mt-10 max-w-[720px] space-y-10">
          <section>
            <h2>
              <IconTile icon={Cpu} size="sm" tone="blue" className="hidden sm:inline-flex" />
              먼저, 대부분의 문제를 설명하는 한 가지
            </h2>
            <p>
              이 사이트의 모든 변환은 여러분의 브라우저 안에서 일어납니다. 아무것도 업로드되지 않고, 일을 대신 해 주는 서버도
              없습니다. 개인정보에는 좋은 일이고, 한도가 지금처럼 정해진 이유이기도 합니다. 기기가 이미지 전체를 메모리에 올려야
              하니 한도가 있고, 변환이 느린 건 대기열이 길어서가 아니라 내 CPU가 바빠서입니다. 그래서 다른 탭을 닫는 게 서버
              방식 도구와 달리 실제로 도움이 됩니다.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={ListChecks} size="sm" tone="blue" className="hidden sm:inline-flex" />
              실제 한도
            </h2>
            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">도구</th>
                    <th className="p-3 font-bold">받는 형식</th>
                    <th className="p-3 font-bold">만드는 형식</th>
                    <th className="p-3 font-bold">한도</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {limits.map((row) => (
                    <tr key={row.tool} className="border-t border-border">
                      <td className="p-3 font-medium text-foreground">
                        <Link href={row.href}>
                          {row.tool}
                          {row.english ? " (영문)" : ""}
                        </Link>
                      </td>
                      <td className="p-3">{row.accepts}</td>
                      <td className="p-3">{row.produces}</td>
                      <td className="p-3">{row.ceiling}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              HEIC, RAW, TIFF, GIF, BMP, SVG, AVIF는 입력으로 받지 않습니다. 확장자가 맞는데도 거부된다면 파일의 실제 형식이
              이름과 다를 가능성이 큽니다.
            </p>
          </section>

          <section>
            <h2>자주 겪는 문제</h2>
            <div className="space-y-5">
              {issues.map((item, index) => (
                <div key={item.problem} className="rounded-field bg-muted p-5">
                  <h3 className="mb-2 flex items-start gap-3 text-lg font-bold text-foreground">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    {item.problem}
                  </h3>
                  <p className="mb-2 pl-9 text-sm font-medium text-muted-foreground">이유: {item.cause}</p>
                  <p className="pl-9 leading-7 text-muted-foreground">{item.fix}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>
              <IconTile icon={Smartphone} size="sm" tone="blue" className="hidden sm:inline-flex" />
              그래도 해결이 안 되면
            </h2>
            <p>
              위에 맞는 경우가 없다면 <Link href="/faq/">자주 묻는 질문 (영문)</Link>에 더 많은 내용이 있습니다.{" "}
              <Link href="/contact/">문의하기 (영문)</Link>로 알려 주실 때는 브라우저 종류와 버전, 원본 파일의 실제 형식과 용량,
              화면에 뜬 메시지 문구를 함께 적어 주시면 원인을 찾기 쉽습니다. 파일 자체는 첨부하지 마세요. 저희는 파일을 받을
              수 없고, 설명만으로 충분합니다.
            </p>
          </section>
        </Prose>
      </div>
    </main>
  );
}
