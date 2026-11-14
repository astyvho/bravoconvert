import { expect, test } from "@playwright/test";

// The long explanations under each tool and on the home page are folded into an accordion so the
// tool stays the focus. Folded text must still be in the static HTML (search, AdSense review).

const TOOL_PAGES = [
  { url: "/convert/img/", folded: "JPG, PNG, and WebP compared" },
  { url: "/convert/pdf/", folded: "Choose JPG or PNG for the page content" },
  { url: "/edit/image/", folded: null },
  { url: "/edit/pdf/", folded: null },
  { url: "/view/exif/", folded: null },
  { url: "/ko/view/exif/", folded: null },
];

for (const { url, folded } of TOOL_PAGES) {
  test(`${url} folds its explanation sections`, async ({ page }) => {
    await page.goto(url);
    const items = page.locator("[data-fold] details");
    expect(await items.count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator("[data-fold] details[open]")).toHaveCount(0);
    // every section heading is still an h2, now inside the summary
    await expect(page.locator("[data-fold] summary h2")).toHaveCount(await items.count());
    if (folded) {
      const summary = page.locator("summary", { hasText: folded });
      const body = summary.locator("xpath=..").locator("div").last();
      await expect(body).toBeHidden();
      await summary.click();
      await expect(body).toBeVisible();
    }
  });
}

test("folded tool copy stays in the static HTML", async ({ page }) => {
  const html = await (await page.request.get("/convert/img/")).text();
  expect(html).toContain("JPG uses lossy compression and is usually a practical choice for photographs");
});

for (const url of ["/", "/ko/"]) {
  test(`${url} folds its long explanations but keeps the cards open`, async ({ page }) => {
    await page.goto(url);
    expect(await page.locator("[data-fold] details").count()).toBeGreaterThanOrEqual(3);
    await expect(page.locator("[data-fold] details[open]")).toHaveCount(0);
    if (url === "/") await expect(page.getByTestId("tool-cards")).toBeVisible();
  });
}
