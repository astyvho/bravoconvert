import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Check, CircleAlert, Clock, Eraser, FileSearch, FileText, Fingerprint, ListChecks, MapPin, PenLine, Share2, ShieldCheck, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageContainer from "@/components/site/page-container";
import IconTile from "@/components/tool/icon-tile";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import StatusBadge from "@/components/tool/status-badge";
import ReportPanel from "@/components/tool/report-panel";
import HeroStage from "@/components/home/hero-stage";
import StepCard from "@/components/home/step-card";
import TaskCard from "@/components/home/task-card";
import RevealItem from "@/components/home/reveal-item";
import { demoReport, demoReportCounts } from "@/lib/demo-report";
import { cn } from "@/lib/utils";
import exifDemo from "@/data/exif-demo.json";
import pdfMetaDemo from "@/data/pdf-metadata-demo.json";
import { alternatesFor } from "@/lib/locale";
import HomePhotoDrop from "@/components/HomePhotoDrop";

export const metadata: Metadata = {
  title: "BravoConvert - 사진을 보내기 전에 위치·기기 정보 확인하고 지우기",
  description:
    "사진에 찍은 위치(GPS), 시간, 기기 정보가 남아 있는지 보고 바로 지울 수 있어요. 사진은 브라우저 안에서만 처리되고 서버로 올라가지 않아요.",
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
  { icon: MapPin, label: "어디서 찍었는지", body: "카메라에 위치 권한이 켜져 있으면 집 주소를 알 수 있을 만큼 정확한 좌표가 남아요." },
  { icon: Clock, label: "언제 찍었는지", body: "날짜와 시간이 초 단위로 남아요. 그 시간에 어디 있었는지가 드러날 수 있어요." },
  { icon: Camera, label: "무엇으로 찍었는지", body: "휴대폰이나 카메라의 제조사와 모델명이요. 렌즈까지 남기도 해요." },
  { icon: Fingerprint, label: "정확히 어느 기기인지", body: "일부 카메라는 일련번호를 남겨요. 같은 기기로 찍은 사진끼리 묶일 수 있어요." },
  { icon: User, label: "누구의 기기인지", body: "카메라나 편집 앱에 넣어 둔 소유자, 작가 이름이요." },
  { icon: PenLine, label: "무엇으로 편집했는지", body: "마지막으로 저장한 프로그램 이름이요. 컴퓨터 이름이 남는 경우도 있어요." },
];

const steps = [
  {
    icon: FileSearch,
    title: "1. 확인",
    body: "사진을 넣으면 어떤 정보가 남아 있는지 바로 보여 줘요. 위치가 있으면 좌표도요.",
    href: "/ko/view/exif/",
    cta: "사진 확인하기",
  },
  {
    icon: Eraser,
    title: "2. 지우기",
    body: "'바로 지우기'를 누르면 정보를 뺀 사본이 받아져요. 여러 장도 한 번에 돼요.",
    href: "/ko/view/exif/?sample=1",
    cta: "샘플로 해보기",
  },
  {
    icon: Share2,
    title: "3. 확인하고 공유",
    body: "받은 사본은 자동으로 다시 검사해요. 사진에 찍힌 간판이나 얼굴은 직접 봐 주세요.",
    href: "/ko/guides/exif-metadata-privacy/",
    cta: "실험 결과 보기",
  },
];

const commonTasks = [
  {
    task: "중고거래에 집에서 찍은 사진을 올릴 때",
    how: "집에서 찍은 판매 사진에는 집 위치가 남아 있을 수 있어요. 올릴 사진을 한꺼번에 넣고 '모두 지우기'를 누른 다음, 받은 사본을 올리면 돼요.",
    tool: "EXIF 뷰어",
    href: "/ko/view/exif/",
  },
  {
    task: "아이 사진을 공개 계정에 올릴 때",
    how: "집이나 어린이집에서 찍었다면 위치부터 확인하세요. 위치가 있으면 '바로 지우기'로 받은 사본을 올리면 돼요. 교복, 이름표, 간판처럼 사진에 보이는 것도 같이 봐 주세요.",
    tool: "EXIF 뷰어",
    href: "/ko/view/exif/",
  },
  {
    task: "회사 문서 PDF를 외부에 보낼 때",
    how: "작성자 이름이나 내부 검토 메모가 남아 있지 않은지 먼저 보세요. 병합·추출하면 문서 속성은 지워지지만 메모는 그대로 따라가요.",
    tool: "PDF 가이드",
    href: "/ko/guides/pdf-metadata-privacy/",
  },
  {
    task: "긴 PDF에서 몇 쪽만 보내야 할 때",
    how: "필요한 쪽만 새 PDF로 뽑으면 나머지 내용은 따라가지 않아요. 파일은 서버로 올라가지 않아요.",
    tool: "PDF 병합·분할 (영문)",
    href: "/edit/pdf/",
  },
];

const STEP_TONES = ["blue", "yellow", "green"] as const;
const TH = "p-3 text-left text-sm font-bold text-foreground";
const TD = "p-3 text-sm tabular-nums";
const INLINE_LINK = "font-semibold text-primary underline-offset-4 hover:underline";
const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;

export default function KoreanHome() {
  const survivedCount = exifDemo.after.filter((f) => f.value !== null).length;
  const report = demoReport("ko");
  const counts = demoReportCounts("ko");

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "BravoConvert",
            url: "https://bravoconvert.com/ko/",
            inLanguage: "ko",
            description: "사진에 남은 위치·시간·기기 정보를 보내기 전에 확인하고, 업로드 없이 지우는 브라우저 도구.",
            publisher: { "@type": "Organization", name: "BravoConvert", url: "https://bravoconvert.com/" },
          }),
        }}
      />
      <PageContainer>
        {/* 첫 화면: 왼쪽 글과 버튼, 오른쪽 샘플 사진과 발견 항목 */}
        <section className="grid items-center gap-10 pt-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:pt-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-caption text-foreground">
              무료 · 업로드 없음 · 브라우저에서 바로
            </span>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.15] tracking-tight text-foreground lg:text-[48px] lg:leading-[1.1]">
              보내기 전에, 사진에 뭐가 남아 있는지 보세요
            </h1>
            <p className="mt-5 max-w-[520px] text-lg leading-8 text-muted-foreground">
              휴대폰으로 찍은 사진에는 찍은 장소와 시간, 기종이 같이 저장되는 경우가 많아요. 보내기 전에 확인하고 지워서 보내세요.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/ko/view/exif/" className={buttonVariants({ size: "lg" })}>사진 확인하기</Link>
              <Link href="/ko/view/exif/?sample=1" className={buttonVariants({ variant: "secondary", size: "lg" })}>샘플 사진 보기</Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-muted-foreground">
              {["서버로 올라가지 않아요", "가입 없음", "한 번에 지우기"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-status-clean-foreground" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <HeroStage locale="ko" />
        </section>

        <section className="mt-12 lg:mt-16">
          <HomePhotoDrop locale="ko" />
        </section>

        {/* 검사 결과가 어떻게 보이는지: 실제 샘플 사진과 측정값 */}
        <section className="mt-20">
          <div className="mx-auto max-w-[560px] text-center">
            <h2 className="text-h2 text-foreground">이렇게 확인해 드려요</h2>
            <p className="mt-3 text-base leading-8 text-muted-foreground">
              사진에 남을 수 있는 정보 여섯 가지를 하나씩 확인하고, 쉬운 말로 알려 드려요.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-[300px_1fr]">
            <Card className="relative min-h-[220px] overflow-hidden bg-tile-peach lg:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={exifDemo.sourceFile} alt="검사 결과에 쓰인 샘플 사진" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full bg-card px-3 py-1.5 text-caption text-foreground shadow-soft">샘플 사진 · {kb(exifDemo.sourceBytes)}</span>
            </Card>
            <ReportPanel
              data-testid="sample-report"
              title={`${counts.found}개를 찾았어요`}
              summary={<StatusBadge status="found">{counts.total}개 중 {counts.found}개 있음</StatusBadge>}
              items={report}
              rowBadge={(item) => <StatusBadge status={item.found ? "found" : "clean"}>{item.found ? "있음" : "없음"}</StatusBadge>}
              footer={
                <>
                  <Link href="/ko/view/exif/?sample=1" className={buttonVariants()}>바로 지우기</Link>
                  <Link href="/ko/view/exif/" className={buttonVariants({ variant: "secondary" })}>다른 사진 확인</Link>
                  <span className="basis-full text-[13px] text-muted-foreground sm:ml-auto sm:basis-auto">받은 사본은 자동으로 다시 검사해요.</span>
                </>
              }
            />
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-center text-h2 text-foreground">세 단계면 돼요</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard
                key={step.title}
                index={`0${index + 1}`}
                icon={step.icon}
                tone={STEP_TONES[index]}
                title={step.title.replace(/^\d+\.\s*/, "")}
                body={step.body}
                href={step.href}
                cta={step.cta}
              />
            ))}
          </div>
        </section>

        <section className="mt-20 space-y-16">
          <div>
            <h2 className="text-h2 text-foreground">사진에 남는 정보 여섯 가지</h2>
            <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">
              EXIF 뷰어가 확인하는 항목이에요. 한 사진에 전부 들어 있는 경우는 드물고, 무엇이 남는지는 기기와 설정에 따라 달라요.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {revealed.map((item) => <RevealItem key={item.label} icon={item.icon} label={item.label} body={item.body} />)}
            </div>
          </div>

          <div data-fold>
            <Accordion>
            <AccordionItem heading="h2" icon={ShieldCheck} tone="blue" question="직접 해 봤어요: 지우고 나면 뭐가 남을까">
              <div className="[&>*:first-child]:!mt-0">
            <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">
              눈으로는 안 보이는 정보 {exifDemo.before.length}개({exifDemo.exifBlockBytes}바이트)를 넣은 샘플 사진을 만들고, 변환기와 똑같은
              방식으로 다시 저장한 다음 EXIF 파서로 읽어 봤어요.
            </p>
            <Card className="mt-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <caption className="caption-top border-b border-border p-4 text-left">
                    <StatusBadge status={survivedCount === 0 ? "clean" : "found"}>
                      {survivedCount === 0 ? `${exifDemo.before.length}개 모두 지워짐` : `${survivedCount}개 남음`}
                    </StatusBadge>
                  </caption>
                  <thead className="bg-muted/60">
                    <tr><th className={TH}>항목</th><th className={TH}>원본 값</th></tr>
                  </thead>
                  <tbody>
                    {exifDemo.before.map((row, index) => (
                      <tr key={row.field} className="border-t border-border">
                        <td className={cn(TD, "font-semibold text-foreground")}>{demoLabels[row.field] ?? row.field}</td>
                        <td className={cn(TD, "text-muted-foreground")}>
                          {exifDemo.after[index].value === null ? (
                            <s>{String(row.value)}</s>
                          ) : (
                            <>{String(row.value)} <StatusBadge status="found" className="ml-1">남음</StatusBadge></>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="mt-4 max-w-[760px] leading-7 text-muted-foreground">
              {survivedCount === 0 ? "남은 건 하나도 없었어요." : `${survivedCount}개가 남았어요.`} 샘플은 가짜 정보를 넣은 실제
              파일이라 <Link href="/ko/view/exif/" className={INLINE_LINK}>뷰어에서 직접 열어 볼 수</Link> 있어요. 실험 과정과
              정보를 지워도 못 막는 것들은{" "}
              <Link href="/ko/guides/exif-metadata-privacy/" className={INLINE_LINK}>EXIF와 개인정보 가이드</Link>에 정리해 뒀어요.
            </p>
              </div>
            </AccordionItem>
            <AccordionItem heading="h2" icon={FileText} tone="pink" question="PDF에도 작성자 정보가 남아요">
              <div className="[&>*:first-child]:!mt-0">
            <p className="mt-4 leading-7 text-muted-foreground">
              PDF에는 작성자, 초안 제목, 만든 프로그램 같은 문서 속성과 검토 메모가 들어 있을 수 있어요. 직접 해 보니 병합·추출·분할하면
              속성은 지워졌지만 메모는{" "}
              {pdfMetaDemo.merged.comments.length > 0 ? "검토자 이름까지 그대로 남았어요" : "같이 지워졌어요"}. 검은 상자로 가린
              글자도{" "}
              {pdfMetaDemo.coveredText.extractableAfterExtract ? "여전히 복사할 수 있었어요" : "복사되지 않았어요"}. 자세한 결과는{" "}
              <Link href="/ko/guides/pdf-metadata-privacy/" className={INLINE_LINK}>PDF가 드러내는 것</Link>에 있어요.
            </p>
              </div>
            </AccordionItem>
            <AccordionItem heading="h2" icon={ListChecks} tone="blue" question="이럴 때 쓰면 좋아요">
              <div className="[&>*:first-child]:!mt-0">
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {commonTasks.map((task) => <TaskCard key={task.task} task={task.task} how={task.how} tool={task.tool} href={task.href} />)}
            </div>
              </div>
            </AccordionItem>
            <AccordionItem heading="h2" icon={CircleAlert} tone="yellow" question="정보를 지워도 남는 것">
              <div className="[&>*:first-child]:!mt-0">
            <p className="mt-4 leading-7 text-muted-foreground">
              여기서 지우는 건 사진 파일에 붙어 있는 정보뿐이고, 사진에 찍힌 건 그대로예요. 도로명 표지판, 동·호수, 얼굴, 창문에 비친 모습,
              뒤에 켜진 모니터로도 장소와 사람을 알 수 있어요. 보내기 전에 사진을 한 번 더 보세요.
            </p>
            <p className="mt-3 leading-7 text-muted-foreground">
              JPG, PNG, WebP 사진과 PDF 문서를 열 수 있어요. 아이폰 기본 형식인 HEIC, 그리고 RAW, TIFF, GIF, BMP는 아직 안 돼요.
              아이폰은 설정 → 카메라 → 포맷에서 &ldquo;높은 호환성&rdquo;을 고르면 JPG로 찍혀요. 지우기는 사본을 만드는 거라 원본은 그대로
              남아요.
            </p>
              </div>
            </AccordionItem>
            </Accordion>
          </div>

          <Card className="p-6">
            <h2 className="text-h3 text-foreground">한국어로 볼 수 있는 페이지</h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              지금은 EXIF 뷰어와 개인정보 가이드만 한국어예요. 이미지 변환기, PDF 도구, FAQ는 영어지만 화면이 단순해서 버튼 몇 개만 알면
              쓸 수 있어요. 가이드는 <Link href="/ko/guides/" className={INLINE_LINK}>가이드 목록</Link>에 모아 뒀어요.
            </p>
          </Card>
        </section>
      </PageContainer>
    </main>
  );
}
