import type { Metadata } from "next";
import Link from "next/link";

// 영어·한국어 루트 레이아웃이 따로 있어 최상위 not-found.tsx 를 둘 수 없다.
// 이 페이지를 빌드한 뒤 scripts/copy-404.mjs 가 out/404.html 로 복사한다.
export const metadata: Metadata = {
  title: "Page not found | BravoConvert",
  robots: { index: false, follow: true },
};

export default function PageNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-black">Page not found</h1>
      <p className="mt-4 text-lg text-gray-700">The page you were looking for does not exist or has moved.</p>
      <p className="mt-2 text-gray-600" lang="ko">찾으시는 페이지가 없거나 주소가 바뀌었습니다.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800">Go to the home page</Link>
        <Link href="/view/exif/" className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-black hover:bg-gray-200">EXIF Viewer</Link>
        <Link href="/ko/" lang="ko" className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-black hover:bg-gray-200">한국어 홈</Link>
      </div>
    </main>
  );
}
