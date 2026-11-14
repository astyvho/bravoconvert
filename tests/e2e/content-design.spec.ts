import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

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

// Phase 4 review fixes.
const CARD_LIST_GUIDES = [
  "/guides/exif-metadata-privacy/",
  "/guides/pdf-metadata-privacy/",
  "/guides/pdf-to-image-use-cases/",
  "/ko/guides/exif-metadata-privacy/",
  "/ko/guides/pdf-metadata-privacy/",
];
for (const url of CARD_LIST_GUIDES) {
  test(`${url} card lists have no bullets and status cells use status colours`, async ({ page }) => {
    await page.goto(url);
    const styles = await page.locator("ul:has(> li.rounded-field)").evaluateAll(lists =>
      lists.map(list => getComputedStyle(list).listStyleType));
    expect(styles.length).toBeGreaterThan(0);
    expect(styles.every(style => style === "none")).toBe(true);
    // "kept / still there" is a found state, never the error colour
    await expect(page.locator('main [class*="destructive"]')).toHaveCount(0);
  });
}

test("Korean guide headings use icon tiles like the English ones", async ({ page }) => {
  for (const url of ["/ko/guides/exif-metadata-privacy/", "/ko/guides/pdf-metadata-privacy/"]) {
    await page.goto(url);
    await expect(page.locator("article h2 > svg")).toHaveCount(0);
    await expect(page.locator("article h2 > span svg").first()).toBeAttached();
  }
});

test("status colours are not used as decoration on the PDF to image guide", async ({ page }) => {
  await page.goto("/guides/pdf-to-image-use-cases/");
  await expect(page.locator('main [class*="bg-status-"]')).toHaveCount(0);
});

// Every guide now has a Korean version (2026-11-14): the Korean index lists all seven, in Korean.
const NEW_KO_GUIDES = [
  "/guides/jpg-png-webp-comparison/",
  "/guides/reduce-image-file-size/",
  "/guides/pdf-to-image-use-cases/",
  "/guides/troubleshooting/",
  "/guides/glossary/",
];

for (const path of NEW_KO_GUIDES) {
  test(`/ko${path} is a Korean guide linked to its English twin`, async ({ page }) => {
    await expectContentRedesigned(page, `/ko${path}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(page.locator("header [data-content-label]")).toHaveText("가이드");
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://bravoconvert.com${path}`);
    const en = await (await page.request.get(path)).text();
    expect(en).toContain(`hrefLang="ko" href="https://bravoconvert.com/ko${path}"`);
  });
}

test("the Korean guides index lists all seven guides in Korean", async ({ page }) => {
  await page.goto("/ko/guides/");
  for (const path of ["/guides/exif-metadata-privacy/", "/guides/pdf-metadata-privacy/", ...NEW_KO_GUIDES]) {
    await expect(page.locator(`a[href="/ko${path}"]`, { hasText: "가이드 읽기" })).toHaveCount(1);
  }
  await expect(page.locator('main a[hreflang="en"]')).toHaveCount(0);
  await expect(page.getByText("영어로만 있는 가이드")).toHaveCount(0);
});

test("the Korean format comparison quotes the measured sizes", async ({ page }) => {
  const benchmarks = JSON.parse(readFileSync("src/data/format-benchmarks.json", "utf8"));
  const photo = benchmarks.samples.find((s: { id: string }) => s.id === "photo");
  const webp80 = photo.webp.find((e: { quality: number }) => e.quality === 0.8).bytes;
  await page.goto("/ko/guides/jpg-png-webp-comparison/");
  await expect(page.locator("main")).toContainText(`${Math.round(webp80 / 1024).toLocaleString()} KB`);
});
