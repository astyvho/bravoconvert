import { expect, test } from "@playwright/test";
import path from "node:path";

const SAMPLE = path.join(__dirname, "..", "..", "public", "guides", "exif-sample-with-metadata.jpg");

const SITE = "https://bravoconvert.com";

test("Korean pages declare their language and link to their English counterparts", async ({ page }) => {
  // Ten page loads; on the dev server each route compiles on its first visit, which can pass 30 s under parallel workers.
  test.slow();
  for (const [ko, en] of [
    ["/ko/", "/"],
    ["/ko/view/exif/", "/view/exif/"],
    ["/ko/guides/", "/guides/"],
    ["/ko/guides/exif-metadata-privacy/", "/guides/exif-metadata-privacy/"],
    ["/ko/guides/pdf-metadata-privacy/", "/guides/pdf-metadata-privacy/"],
  ]) {
    await page.goto(ko);
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}${ko}`);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `${SITE}${en}`);
    await expect(page.locator('link[rel="alternate"][hreflang="ko"]')).toHaveAttribute("href", `${SITE}${ko}`);
    await expect(page.getByRole("link", { name: "English" }).first()).toHaveAttribute("href", en);

    await page.goto(en);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('link[rel="alternate"][hreflang="ko"]')).toHaveAttribute("href", `${SITE}${ko}`);
    await expect(page.getByRole("link", { name: "한국어" }).first()).toHaveAttribute("href", ko);
  }
});

test("English pages without a Korean version send the language switch to the Korean home", async ({ page }) => {
  await page.goto("/convert/img/");
  await expect(page.getByRole("link", { name: "한국어" }).first()).toHaveAttribute("href", "/ko/");
  await expect(page.locator('link[rel="alternate"][hreflang="ko"]')).toHaveCount(0);
});

test("Korean EXIF viewer reads the sample photo with Korean labels", async ({ page }) => {
  await page.goto("/ko/view/exif/");
  await expect(page.getByRole("heading", { level: 1, name: "EXIF 뷰어" })).toBeVisible();
  const reject = page.getByRole("button", { name: "거부", exact: true });
  if (await reject.isVisible()) await reject.click();

  await page.getByRole("button", { name: "샘플 사진으로 해보기" }).click();
  await expect(page.getByText(/지울 만한 정보 \d+개를 찾았어요/)).toBeVisible();
  const location = page.locator('[data-check="location"]');
  await expect(location).toContainText("위치 (GPS)");
  await expect(location).toContainText("있음");
  await expect(location.getByRole("link", { name: "OpenStreetMap에서 보기" })).toBeVisible();
  await expect(page.locator('[data-none] [data-check="serial"]')).toBeVisible();
  await expect(page.locator("[data-none]")).toContainText("없음");
});

test("Korean guides render their measured findings", async ({ page }) => {
  await page.goto("/ko/");
  await expect(page.getByRole("heading", { level: 1, name: "보내기 전에, 사진에 뭐가 남아 있는지 보세요" })).toBeVisible();
  await expect(page.getByText("남은 건 하나도 없었어요.")).toBeVisible();

  await page.goto("/ko/guides/pdf-metadata-privacy/");
  await expect(page.getByRole("heading", { name: "메모는 매번 살아남았습니다" })).toBeVisible();
  await expect(page.getByRole("link", { name: /pdf-metadata-sample\.pdf/ })).toHaveAttribute("href", "/guides/pdf-metadata-sample.pdf");

  await page.goto("/ko/guides/exif-metadata-privacy/");
  await expect(page.getByText("모든 필드가 사라졌습니다.")).toBeVisible();
});

test("Korean EXIF viewer offers a clean copy in place", async ({ page }) => {
  await page.goto("/ko/view/exif/");
  const reject = page.getByRole("button", { name: "거부", exact: true });
  if (await reject.isVisible()) await reject.click();
  await page.getByRole("button", { name: "샘플 사진으로 해보기" }).click();
  await page.getByRole("button", { name: "바로 지우기" }).click();
  await expect(page.getByText("어떤 형식으로 받을까요?")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /PNG로 받기/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("sample-photo-with-gps-clean.png");
  await expect(page.getByText(/받은 사본을 다시 열어 봤어요/)).toBeVisible();
});

test("tools reached from the EXIF context say that converting removes the metadata", async ({ page }) => {
  await page.goto("/convert/img/");
  await expect(page.locator("[data-metadata-notice]")).toHaveCount(0);

  await page.goto("/convert/img/?from=exif&lang=ko");
  const ko = page.locator("[data-metadata-notice]");
  await expect(ko).toContainText("여기서 저장한 사진에는 위치·시간 정보가 안 들어가요");
  await expect(ko.getByRole("link", { name: "EXIF 뷰어로 돌아가기" })).toHaveAttribute("href", "/ko/view/exif/");

  await page.goto("/edit/image/?from=exif");
  await expect(page.locator("[data-metadata-notice]")).toContainText("Saving here leaves the photo's hidden information behind");

  await page.goto("/ko/view/exif/");
  await expect(page.locator('main a[href="/convert/img/?from=exif&lang=ko"]').first()).toBeVisible();

  // 한국어에서 넘어온 영문 도구의 언어 전환은 하던 일(EXIF 뷰어)로 돌려보낸다.
  await page.goto("/convert/img/?from=exif&lang=ko");
  await expect(page.getByRole("link", { name: "한국어" }).first()).toHaveAttribute("href", "/ko/view/exif/");
});

test("the Korean home sends chosen photos straight into the viewer", async ({ page }) => {
  await page.goto("/ko/");
  await page.getByLabel("확인할 사진 선택").setInputFiles(SAMPLE);
  await expect(page).toHaveURL(/\/ko\/view\/exif\/$/);
  await expect(page.getByText("이 사진에서 지울 만한 정보 3개를 찾았어요.")).toBeVisible();

  await page.goto("/ko/view/exif/?sample=1");
  await expect(page.getByText("이 사진에서 지울 만한 정보 3개를 찾았어요.")).toBeVisible();
});
