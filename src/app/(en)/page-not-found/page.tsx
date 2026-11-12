import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import ContentHeader from "@/components/content/content-header";
import PageContainer from "@/components/site/page-container";
import ToolCard from "@/components/home/tool-card";
import { OTHER_TOOLS, OTHER_TOOL_TONES } from "@/components/home/other-tools";
import { cn } from "@/lib/utils";

// 영어·한국어 루트 레이아웃이 따로 있어 최상위 not-found.tsx 를 둘 수 없다.
// 이 페이지를 빌드한 뒤 scripts/copy-404.mjs 가 out/404.html 로 복사한다.
export const metadata: Metadata = {
  title: "Page not found | BravoConvert",
  robots: { index: false, follow: true },
};

export default function PageNotFound() {
  return (
    <PageContainer className="pb-16 pt-6">
      <main>
        <ContentHeader label="404" title="Page not found">
          <p className="mt-3 text-lg leading-relaxed text-foreground">The page you were looking for does not exist or has moved.</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground break-keep" lang="ko">찾으시는 페이지가 없거나 주소가 바뀌었습니다.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className={buttonVariants({ size: "lg" })}>Go to the home page</Link>
            <Link href="/view/exif/" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>EXIF Viewer</Link>
            <Link href="/ko/" lang="ko" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>한국어 홈</Link>
          </div>
        </ContentHeader>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {OTHER_TOOLS.map((tool, index) => (
            <ToolCard key={tool.href} headingLevel="h2" icon={tool.icon} tone={OTHER_TOOL_TONES[index]} title={tool.title} points={tool.points} body={tool.use} href={tool.href} cta="Open" />
          ))}
        </div>
      </main>
    </PageContainer>
  );
}
