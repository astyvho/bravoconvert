import { expect, test } from "@playwright/test";

const SITE = "https://bravoconvert.com";

test("Korean pages declare their language and link to their English counterparts", async ({ page }) => {
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
  await expect(page.getByText(/신원을 드러낼 수 있는 정보가 \d+종류/)).toBeVisible();
  const location = page.locator('[data-check="location"]');
  await expect(location).toContainText("위치 (GPS)");
  await expect(location).toContainText("발견");
  await expect(location.getByRole("link", { name: "OpenStreetMap에서 보기" })).toBeVisible();
  await expect(page.locator('[data-check="serial"]')).toContainText("없음");
});

test("Korean guides render their measured findings", async ({ page }) => {
  await page.goto("/ko/");
  await expect(page.getByRole("heading", { level: 1, name: "사진을 보내기 전에, 무엇이 함께 가는지 확인하세요" })).toBeVisible();
  await expect(page.getByText("남은 필드는 하나도 없었습니다.")).toBeVisible();

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
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "정보를 지운 사본 받기" }).click();
  await downloadPromise;
  await expect(page.getByText(/받은 사본을 다시 검사했습니다/)).toBeVisible();
});
