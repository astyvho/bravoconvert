import { expect, test } from "@playwright/test";

test("home hero keeps its heading and shows the sample report with real values", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Check what a photo reveals before you share it" })).toBeVisible();
  const stage = page.getByTestId("hero-stage");
  await expect(stage).toContainText("51.50806, -0.12806");
  await expect(stage).toContainText("BravoCam BC-900 Demo");
  const report = page.getByTestId("sample-report");
  await expect(report.getByText("Found", { exact: true })).toHaveCount(3);
  await expect(report.getByText("Not present", { exact: true })).toHaveCount(3);
  await expect(report.getByRole("link", { name: "Remove it now" })).toHaveAttribute("href", "/view/exif/?sample=1");
  await expect(page.getByRole("link", { name: "Try the sample" })).toHaveAttribute("href", "/view/exif/?sample=1");
  for (const href of ["/convert/img/", "/convert/pdf/", "/edit/image/", "/edit/pdf/"]) {
    await expect(page.getByTestId("tool-cards").locator(`a[href="${href}"]`)).toBeVisible();
  }
  await expect(page.getByText("None of the fields survived.")).toBeVisible();
});

test("home has no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  await expect(page.getByTestId("hero-stage")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("Korean home mirrors the English structure with Korean copy", async ({ page }) => {
  await page.goto("/ko/");
  await expect(page.getByRole("heading", { level: 1, name: "보내기 전에, 사진에 뭐가 남아 있는지 보세요" })).toBeVisible();
  await expect(page.getByTestId("hero-stage")).toContainText("51.50806, -0.12806");
  await expect(page.getByTestId("sample-report").getByText("있음", { exact: true })).toHaveCount(3);
  await expect(page.getByRole("link", { name: "샘플로 먼저 해보기" })).toHaveAttribute("href", "/ko/view/exif/?sample=1");
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
