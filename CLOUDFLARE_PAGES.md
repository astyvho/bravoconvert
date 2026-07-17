# Cloudflare Pages 운영 기록

마지막 정리일: 2026-07-18

BravoConvert는 Next.js 정적 내보내기 방식으로 Cloudflare Pages에 배포한다. 이미지와 PDF 변환은 방문자의 브라우저에서 처리하므로 서버, 데이터베이스, 유료 스토리지가 필요하지 않다.

## 현재 배포 구성

- GitHub 저장소: `astyvho/bravoconvert`
- 프로덕션 브랜치: `main`
- Cloudflare Pages 프로젝트: 파란색 Pages 아이콘의 `bravoconvert`
- Pages 기본 주소: `https://bravoconvert.pages.dev`
- 프로덕션 주소: `https://bravoconvert.com`
- 빌드 프리셋: `Next.js (Static HTML Export)`
- 빌드 명령: `npx next build` 또는 `npm run build`
- 빌드 출력 폴더: `out`
- 루트 디렉터리: 비어 있음
- 환경 변수: 없음

Workers & Pages 목록에는 처음에 실수로 만든 빨간색 Worker 프로젝트 `bravoconvert`도 있다. `No active routes`와 `Latest build failed`가 표시된 프로젝트는 사용하지 않는다. `bravoconvert.pages.dev`가 표시된 파란색 Pages 프로젝트만 관리한다.

## 앞으로 사이트 업데이트하는 방법

코드를 수정한 뒤 아래 순서로 GitHub `main` 브랜치에 푸시한다.

```bash
npm run build
git add --all
git commit -m "변경 내용"
git push origin main
```

`main`에 푸시하면 Cloudflare Pages가 자동으로 새 빌드를 시작하고 성공한 배포를 프로덕션에 반영한다. Cloudflare에 파일을 수동 업로드할 필요가 없다.

배포 상태 확인 위치:

1. Cloudflare Dashboard
2. **Workers & Pages**
3. `bravoconvert.pages.dev`가 표시된 `bravoconvert` 프로젝트
4. **Deployments**

## DNS 및 네임서버

도메인 등록기관은 hosting.co.kr이고 DNS 권한은 Cloudflare로 이전했다.

Cloudflare 네임서버:

```text
anirban.ns.cloudflare.com
nora.ns.cloudflare.com
```

hosting.co.kr의 기존 `ns1`~`ns4.hosting.co.kr` 네임서버로 되돌리지 않는다. DNS 레코드는 hosting.co.kr이 아니라 Cloudflare Dashboard의 **DNS > Records**에서 관리한다.

현재 필요한 DNS 레코드:

```text
CNAME  @     bravoconvert.pages.dev   Proxied
CNAME  www   bravoconvert.pages.dev   Proxied
TXT    @     google-site-verification=...   DNS only
```

Google 사이트 인증용 TXT 레코드는 삭제하지 않는다. `@bravoconvert.com` 이메일을 사용하지 않으므로 MX 레코드 경고는 무시할 수 있다.

## Custom domains 상태

- `bravoconvert.com`: Active, SSL enabled
- `www.bravoconvert.com`: 2026-07-18 기준 검증 및 SSL 발급 대기 중

Pages 프로젝트의 **Custom domains**에서 두 도메인을 관리한다. DNS 메뉴에서 CNAME만 만들고 Custom domains 등록을 생략하면 안 된다.

`www.bravoconvert.com`이 Active가 되면 Cloudflare **Rules > Redirect Rules**에서 다음 301 리디렉션을 만든다.

```text
Source: https://www.bravoconvert.com/*
Target: https://bravoconvert.com/${1}
Status: 301
Preserve query string: On
```

사이트 canonical 주소는 `https://bravoconvert.com`이다.

## 배포 후 확인 목록

- `https://bravoconvert.com/`
- `https://bravoconvert.com/convert/img/`
- `https://bravoconvert.com/convert/pdf/`
- `https://bravoconvert.com/ads.txt`
- `https://bravoconvert.com/robots.txt`
- `https://bravoconvert.com/sitemap.xml`
- `https://bravoconvert.com/feed.xml`
- JPG, PNG, WebP 이미지 변환
- PDF 변환
- `www` 주소의 루트 도메인 리디렉션

## 주의사항

- Cloudflare Pages는 `out` 폴더를 배포하므로 `next.config.js`의 `output: 'export'`를 유지한다.
- 사용자 파일을 서버로 업로드하거나 서버 변환 기능을 추가하지 않는다. 브라우저 처리 구조를 유지해야 호스팅 비용이 들지 않는다.
- 새 서버 API, 데이터베이스 또는 서버 전용 Next.js 기능을 추가하면 정적 빌드가 실패할 수 있다.
- 기존 Vercel 프로젝트는 Cloudflare의 루트 도메인과 `www`가 모두 정상 동작하는 것을 확인한 후 정리한다.
