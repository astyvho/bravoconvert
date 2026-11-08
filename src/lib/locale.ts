// 한국어판은 /ko/ 아래에 개인정보 관련 핵심 페이지만 있다.
// 이 목록이 언어 전환 링크, hreflang, 사이트맵의 기준이다. 한국어 페이지를 추가하면 여기에도 추가한다.
export type Locale = "en" | "ko";

export const KO_PATHS = [
  "/",
  "/view/exif/",
  "/guides/",
  "/guides/exif-metadata-privacy/",
  "/guides/pdf-metadata-privacy/",
] as const;

const SITE = "https://bravoconvert.com";

/** "/ko/view/exif/" → "/view/exif/" */
export function stripKo(pathname: string): string {
  if (pathname === "/ko" || pathname === "/ko/") return "/";
  return pathname.startsWith("/ko/") ? pathname.slice(3) : pathname;
}

export function hasKorean(path: string): boolean {
  return (KO_PATHS as readonly string[]).includes(path);
}

/** 영어 경로에 대응하는 한국어 경로. 한국어판이 없으면 null. */
export function koPath(path: string): string | null {
  return hasKorean(path) ? (path === "/" ? "/ko/" : `/ko${path}`) : null;
}

/** 두 언어판이 모두 있는 페이지의 alternates (canonical + hreflang). */
export function alternatesFor(path: string, locale: Locale) {
  const ko = koPath(path);
  const en = path;
  return {
    canonical: locale === "ko" && ko ? ko : en,
    languages: ko
      ? { en: `${SITE}${en}`, ko: `${SITE}${ko}`, "x-default": `${SITE}${en}` }
      : undefined,
  };
}
