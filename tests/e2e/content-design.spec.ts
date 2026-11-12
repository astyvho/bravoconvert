import { expect, test, type Page } from "@playwright/test";

// Phase 4 of the redesign: content pages share one header (label pill, H1, one line, date) and the
// Prose body (spec 7.4). Every page is checked on a phone-sized screen.

async function expectContentRedesigned(page: Page, url: string) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(url);
  // (a) no legacy palette classes
  const legacy = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class*="gray-"],[class*="brand-"],[class*="blue-"],[class*="bg-white"],[class*="text-black"],[class*="bg-black"],[class*="from-black"],[class*="amber-"],[class*="green-"],[class*="red-"]'))
      .map(el => `${el.tagName.toLowerCase()}.${String(el.getAttribute("class")).slice(0, 80)}`),
  );
  expect(legacy).toEqual([]);
  // (b) nothing wider than the phone; wide tables scroll inside their own box
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  // (c) exactly one H1
  await expect(page.locator("h1")).toHaveCount(1);
  // (d) the label pill sits in the page header
  await expect(page.locator("header [data-content-label]")).toHaveCount(1);
}

test("About uses the content template", async ({ page }) => {
  await expectContentRedesigned(page, "/about/");
});

test("FAQ uses the content template", async ({ page }) => {
  await expectContentRedesigned(page, "/faq/");
});

test("FAQ answers are in the static HTML even while folded", async ({ page }) => {
  const html = await (await page.request.get("/faq/")).text();
  expect(html).toContain("does not require an app, extension, account, or login");
  await page.goto("/faq/");
  await expect(page.locator("details")).not.toHaveCount(0);
  await expect(page.locator("details[open]")).toHaveCount(0);
});

test("FAQ questions open and close from the keyboard", async ({ page }) => {
  await page.goto("/faq/");
  const question = page.locator("summary", { hasText: "What image formats can I convert?" });
  const answer = page.getByText("You can convert JPG/JPEG, PNG, and WebP images to JPG, PNG, or WebP.");
  await expect(answer).toBeHidden();
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(answer).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(answer).toBeHidden();
});

const EN_GUIDES = [
  "/guides/",
  "/guides/exif-metadata-privacy/",
  "/guides/glossary/",
  "/guides/jpg-png-webp-comparison/",
  "/guides/pdf-metadata-privacy/",
  "/guides/pdf-to-image-use-cases/",
  "/guides/reduce-image-file-size/",
  "/guides/troubleshooting/",
];
for (const url of EN_GUIDES) {
  test(`${url} uses the content template`, async ({ page }) => {
    await expectContentRedesigned(page, url);
  });
}

test("the guides index lists every guide as a card", async ({ page }) => {
  await page.goto("/guides/");
  for (const url of EN_GUIDES.slice(1)) {
    await expect(page.locator(`a[href="${url}"]`, { hasText: "Read the guide" })).toHaveCount(1);
  }
});

const KO_GUIDES = ["/ko/guides/", "/ko/guides/exif-metadata-privacy/", "/ko/guides/pdf-metadata-privacy/"];
for (const url of KO_GUIDES) {
  test(`${url} uses the content template`, async ({ page }) => {
    await expectContentRedesigned(page, url);
    await expect(page.locator("main .break-keep").first()).toBeVisible();
  });
}

test("the Korean guides index keeps its English-only links marked", async ({ page }) => {
  const html = await (await page.request.get("/ko/guides/")).text();
  expect(html).toMatch(/hreflang="en"/i);
  await page.goto("/ko/guides/");
  for (const url of KO_GUIDES.slice(1)) {
    await expect(page.locator(`a[href="${url}"]`, { hasText: "가이드 읽기" })).toHaveCount(1);
  }
});

for (const url of ["/how-to-use/", "/contact/", "/changelog/", "/privacy-policy/", "/terms/"]) {
  test(`${url} uses the content template`, async ({ page }) => {
    await expectContentRedesigned(page, url);
  });
}

test("the 404 page offers the four tools as cards", async ({ page }) => {
  await expectContentRedesigned(page, "/page-not-found/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  for (const href of ["/convert/img/", "/convert/pdf/", "/edit/image/", "/edit/pdf/"]) {
    await expect(page.locator(`a[href="${href}"]`, { hasText: "Open" })).toHaveCount(1);
  }
  await expect(page.getByRole("link", { name: "Go to the home page" })).toBeVisible();
});
