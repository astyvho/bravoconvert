import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, EyeOff, FileSearch, FlaskConical, MapPin, ShieldCheck, Smartphone } from "lucide-react";
import ExifViewer from "@/components/ExifViewer";
import PageContainer from "@/components/site/page-container";
import AdSlot from "@/components/tool/ad-slot";
import IconTile from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";
import demo from "@/data/exif-demo.json";
import { alternatesFor } from "@/lib/locale";

export const metadata: Metadata = {
  alternates: alternatesFor("/view/exif/", "ko"),
  title: "EXIF 뷰어 - 사진 위치정보(GPS)·촬영 정보 확인, 업로드 없이 | BravoConvert",
  description: "JPG, PNG, WebP 사진에 숨은 촬영 위치(GPS), 촬영 시간, 카메라·휴대폰 모델, 일련번호를 공유 전에 확인하세요. 사진은 브라우저 안에서만 읽히고 업로드되지 않습니다.",
  keywords: ["EXIF 뷰어", "사진 위치정보 확인", "사진 메타데이터 확인", "사진 GPS 확인", "EXIF 확인", "사진 위치정보 삭제"],
  openGraph: {
    title: "EXIF 뷰어 - 사진에 남은 위치·기기 정보 확인",
    description: "사진의 GPS 위치, 촬영 시간, 기기 정보를 업로드 없이 확인합니다.",
    type: "website",
    locale: "ko_KR",
  },
};

const CODE = "rounded bg-muted px-1.5 py-0.5 text-sm text-foreground";

// 1초(위도) = 지구 둘레 / 360 / 3600 ≈ 30.9 m
const METRES_PER_ARCSECOND = 30.9;

export default function KoreanExifViewerPage() {
  const beforeFields = demo.before.filter(item => item.value !== null);
  const survived = demo.after.filter(item => item.value !== null);
  const sizeChange = Math.round((demo.convertedBytes / demo.sourceBytes - 1) * 100);
  const make = String(demo.before.find(item => item.field === "Make")?.value);
  const model = String(demo.before.find(item => item.field === "Model")?.value);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "BravoConvert EXIF 뷰어",
            url: "https://bravoconvert.com/ko/view/exif/",
            inLanguage: "ko",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
            featureList: ["EXIF·GPS·XMP·IPTC 메타데이터 읽기", "위치, 시간, 기기, 소유자 개인정보 점검", "JPG, PNG, WebP", "브라우저 안에서만 처리"],
          }),
        }}
      />
      <ExifViewer locale="ko" />

      <PageContainer className="pb-16">
        <AdSlot slot="exif-below-tool" />
        <Prose as="article" className="mt-12 space-y-12">
        <header>
          <h2>
            <IconTile icon={FileSearch} size="sm" tone="blue" className="hidden sm:inline-flex" />
            사진 한 장이 알려주는 것
          </h2>
          <p>
            카메라나 휴대폰으로 찍은 사진에는 그림 말고도 EXIF라는 글자 정보가 함께 저장됩니다. 기기가 언제, 어디서, 어떻게 찍었는지를 적어 두는 메모입니다. 사진을 봐서는 보이지 않고, 노출이나 렌즈 정보처럼 대부분은 무해합니다. 하지만 사진이 내 손을 떠나는 순간 문제가 되는 항목이 여섯 가지 있고, 위의 개인정보 점검은 바로 이것을 찾습니다.
          </p>
          <ul>
            <li><strong>위치.</strong> 사진을 찍은 곳의 GPS 좌표입니다. 집에서 찍어 공개적으로 올린 사진이 집 주소를 알려줄 수 있습니다.</li>
            <li><strong>날짜와 시간.</strong> 촬영 시각이 초 단위까지 남습니다. 여러 장을 모으면 생활 패턴이 드러납니다.</li>
            <li><strong>기기 모델.</strong> 카메라나 휴대폰의 제조사와 모델명입니다.</li>
            <li><strong>일련번호.</strong> 일부 카메라는 본체 일련번호를 기록합니다. 다른 이름으로 올린 사진들이 같은 기기에서 나왔다는 사실이 이어질 수 있습니다.</li>
            <li><strong>소유자·작성자 이름.</strong> 카메라나 편집 앱에 이름이나 저작권 문구를 설정해 두면 모든 파일에 찍힙니다.</li>
            <li><strong>편집 프로그램.</strong> 파일을 마지막으로 저장한 앱입니다. &ldquo;보정하지 않은 사진&rdquo;이라는 말과 어긋날 수 있습니다.</li>
          </ul>
        </header>

        <section>
          <h2>
            <IconTile icon={MapPin} size="sm" tone="blue" className="hidden sm:inline-flex" />
            사진 속 위치는 얼마나 정확한가
          </h2>
          <p>
            GPS 좌표는 도·분·초 단위로 저장됩니다. 위도 1초는 남북으로 약 {Math.round(METRES_PER_ARCSECOND)}미터라서, 샘플처럼 초 단위까지만 기록한 사진도 이미 건물 하나를 가리킵니다. 초 아래 소수점까지 기록하면 몇 미터 안으로 좁혀집니다. 이 뷰어는 좌표를 소수점 다섯째 자리(약 1미터 단위)까지 보여 주지만, 실제 정확도는 촬영 당시 기기가 잡은 GPS 신호에 달려 있고 실내에서는 대개 더 나쁩니다.
          </p>
          <p>
            &ldquo;OpenStreetMap에서 보기&rdquo; 링크는 이 페이지에서 무언가를 밖으로 보내는 유일한 부분이며, 누를 때만 동작합니다. 지도를 그리기 위해 좌표가 openstreetmap.org로 전송됩니다.
          </p>
        </section>

        <section>
          <h2>
            <IconTile icon={FlaskConical} size="sm" tone="blue" className="hidden sm:inline-flex" />
            직접 실험한 결과
          </h2>
          <p>
            &ldquo;샘플 사진으로 해보기&rdquo; 버튼은 저희가 실제 EXIF 블록을 넣어 만든 JPEG를 불러옵니다. 가상의 카메라 {make} {model}, 촬영 시각, 회전 정보, 그리고 런던 트라팔가 광장의 좌표가 들어 있습니다. 좌표는 아무의 집도 가리키지 않도록 공공장소로 골랐습니다. 이 파일에는 {beforeFields.length}개 필드가 {demo.exifBlockBytes}바이트 크기로 들어 있습니다.
          </p>
          <p>
            이 파일을 <Link href="/convert/img/?from=exif&lang=ko">이미지 변환기</Link>와 똑같은 디코딩·다시 그리기 과정에 통과시킨 뒤, 이 뷰어와 같은 파서로 다시 읽었습니다. {survived.length === 0 ? `${beforeFields.length}개 필드 중 남은 것은 하나도 없었고` : `${beforeFields.length}개 필드 중 ${survived.length}개가 남았고`}, GPS도 마찬가지였습니다. 의외였던 점은 정리된 파일이 원본보다 {sizeChange > 0 ? `${sizeChange}% 커졌다` : `${Math.abs(sizeChange)}% 작아졌다`}는 것입니다(변환 전 {demo.sourceBytes.toLocaleString("ko-KR")}바이트, 변환 후 {demo.convertedBytes.toLocaleString("ko-KR")}바이트). 그림을 다시 압축하는 비용이 지운 메타데이터보다 컸기 때문입니다. 메타데이터 제거는 개인정보 보호 수단이지 용량을 줄이는 방법이 아닙니다. 전체 실험은 <Link href="/ko/guides/exif-metadata-privacy/">EXIF와 개인정보 가이드</Link>에 정리했습니다.
          </p>
        </section>

        <section>
          <h2>
            <IconTile icon={Smartphone} size="sm" tone="blue" className="hidden sm:inline-flex" />
            휴대폰에서 위치 기록 끄기
          </h2>
          <p>
            이미 찍은 사진은 변환으로 정리할 수 있지만, 앞으로 찍을 사진은 처음부터 위치를 기록하지 않는 편이 확실합니다.
          </p>
          <ul>
            <li><strong>갤럭시.</strong> 카메라 앱의 설정(톱니바퀴)에서 &ldquo;위치 태그&rdquo;를 끕니다.</li>
            <li><strong>아이폰.</strong> 설정 → 개인정보 보호 및 보안 → 위치 서비스 → 카메라에서 위치 접근을 &ldquo;안 함&rdquo;으로 바꿉니다.</li>
          </ul>
          <p>
            메뉴 이름은 OS 버전에 따라 조금 다를 수 있습니다. 설정을 바꾼 뒤 사진을 한 장 찍어 이 뷰어로 열어 보면 위치가 &ldquo;없음&rdquo;으로 나오는지 바로 확인할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>
            <IconTile icon={ShieldCheck} size="sm" tone="blue" className="hidden sm:inline-flex" />
            이 뷰어가 사진을 업로드하지 않는 이유
          </h2>
          <p>
            사진을 서버로 올려서 메타데이터를 확인해 주는 사이트는, 지키려던 바로 그 정보(내 위치, 내 기기)를 남의 서버로 보내는 셈입니다. 이 뷰어는 파일을 브라우저 안에서 읽습니다. 사진은 내 기기에서 열리고, 메타데이터는 메모리 안에서만 해석되며, 탭을 닫으면 사라집니다.
          </p>
          <p>
            형식마다 메타데이터를 두는 자리가 다릅니다. JPEG는 파일 앞부분의 세그먼트에, PNG는 <code className={CODE}>eXIf</code>라는 청크에, WebP는 RIFF 컨테이너 안의 <code className={CODE}>EXIF</code> 청크에 저장합니다. 이 도구가 쓰는 파싱 라이브러리는 JPEG와 PNG는 읽지만 WebP는 읽지 못해서, WebP 파일은 뷰어가 직접 EXIF 청크를 찾아 파서에 넘깁니다. 같은 메타데이터 블록을 세 형식에 넣어 확인했고, 세 형식 모두 같은 필드가 나왔습니다.
          </p>
        </section>

        <section>
          <h2>
            <IconTile icon={EyeOff} size="sm" tone="blue" className="hidden sm:inline-flex" />
            메타데이터로는 알 수 없는 것
          </h2>
          <ul>
            <li><strong>사진에 찍힌 내용.</strong> 여기서 아무것도 안 나왔다고 사진이 익명인 것은 아닙니다. 도로명 표지판, 동·호수, 창문에 비친 모습, 얼굴은 그림 자체의 일부라서 어떤 메타데이터 도구도 잡아내지 못합니다.</li>
            <li><strong>제조사 고유 정보(메이커 노트).</strong> 많은 카메라가 자체 형식의 &ldquo;메이커 노트&rdquo;를 추가합니다. 이 뷰어는 그것을 해석하지 않으므로, 그 안에만 있는 정보는 표시되지 않습니다.</li>
            <li><strong>내장 썸네일.</strong> 파일 안에 작은 미리보기 이미지를 넣는 카메라도 있습니다. 미리보기를 갱신하지 않는 앱에서 사진을 잘랐다면, 미리보기에는 자르기 전 원본이 남아 있을 수 있습니다. 뷰어는 이를 꺼내 보여 주지 않지만, 이미지 변환기로 변환하면 다른 정보와 함께 사라집니다.</li>
            <li><strong>다른 형식.</strong> 아이폰 기본 형식인 HEIC은 지원하지 않습니다. 아이폰에서 설정 → 카메라 → 포맷을 &ldquo;높은 호환성&rdquo;으로 바꾸면 JPG로 촬영됩니다.</li>
          </ul>
        </section>

        <section>
          <h2>
            <IconTile icon={CircleAlert} size="sm" tone="blue" className="hidden sm:inline-flex" />
            문제 해결
          </h2>
          <ul>
            <li><strong>휴대폰 사진인데 &ldquo;지울 만한 정보가 없어요&rdquo;가 나올 때.</strong> 파일을 마지막으로 저장한 앱(메신저, 캡처 도구, 편집 앱)이 이미 지웠을 수 있습니다. 원래 무엇이 들어 있었는지 알고 싶다면 갤러리에 있는 원본을 확인하세요.</li>
            <li><strong>위치가 있을 줄 알았는데 없을 때.</strong> 카메라 설정에서 위치 기록이 꺼져 있었거나, 실내라서 GPS를 잡지 못했을 수 있습니다.</li>
            <li><strong>파일이 거부될 때.</strong> 25MB 이하의 JPG, PNG, WebP만 받습니다.</li>
          </ul>
          <p>
            궁금한 점은 <Link href="/contact/">문의 페이지(영문)</Link>로 보내 주세요. 한국어로 쓰셔도 됩니다. 다만 사진 자체는 보내지 마세요.
          </p>
        </section>
        </Prose>
      </PageContainer>
    </main>
  );
}
