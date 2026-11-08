// 영어(/)와 한국어(/ko/) 루트 레이아웃이 공유하는 <head> 내용.
// 두 언어 모두 같은 GA·AdSense 태그와 Consent Mode 기본값을 써야 하므로 한 곳에 둔다.
export default function SiteHead() {
  return (
    <>
      {/* Default to denied until a consent platform supplies the user's choice. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{'ad_storage':'denied','analytics_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','wait_for_update':500});`,
        }}
      />
      {/* Google Search Console 도메인 소유 확인 */}
      <meta name="google-site-verification" content="f_yi04ke2AOQgKSmgW2C60LLIMow3yeWvahynPvZDzI" />

      {/* 네이버 서치 사이트 확인 */}
      <meta name="naver-site-verification" content="d6ff057d950b725e2fa3332f0d42c3b1d9546034" />

      {/* Google 애드센스 소유권 확인 */}
      <meta name="google-adsense-account" content="ca-pub-6552891879490275" />

      <link rel="alternate" type="application/rss+xml" title="BravoConvert Image Tools RSS Feed" href="https://bravoconvert.com/feed.xml" />

      {/*
        Analytics and AdSense tags load on every page so crawlers and the AdSense
        reviewer can see them. Storage stays off until ConsentManager sends a
        `consent update`, per the denied-by-default Consent Mode v2 block above.
      */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-2QXJN1E3TF" />
      <script
        dangerouslySetInnerHTML={{
          __html: `gtag('js',new Date());if(location.hostname==='bravoconvert.com'||location.hostname==='www.bravoconvert.com'){gtag('config','G-2QXJN1E3TF',{anonymize_ip:true})}`,
        }}
      />
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6552891879490275"
        crossOrigin="anonymous"
      />
    </>
  );
}
