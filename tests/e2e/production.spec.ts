import { expect, test } from "@playwright/test";

const htmlRoutes = [
  "/",
  "/convert/img/",
  "/convert/pdf/",
  "/edit/image/",
  "/how-to-use/",
  "/faq/",
  "/about/",
  "/contact/",
  "/privacy-policy/",
  "/terms/",
];

const dataRoutes = ["/sitemap.xml", "/robots.txt", "/feed.xml", "/rss"];

for (const device of [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "iPhone", viewport: { width: 390, height: 844 } },
]) {
  test(`all production HTML routes render on ${device.name}`, async ({ browser }) => {
    for (const route of htmlRoutes) {
      const page = await browser.newPage({ viewport: device.viewport });
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const badResponses: string[] = [];
      page.on("pageerror", error => pageErrors.push(error.message));
      page.on("console", message => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("response", response => {
        if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
      });
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${route} HTTP status`).toBe(200);
      await expect(page.locator("h1"), `${route} should contain one visible H1`).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      expect((await page.title()).trim().length, `${route} document title`).toBeGreaterThan(10);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
      expect(pageErrors, `${route} page errors`).toEqual([]);
      const firstPartyFailures = badResponses.filter(entry => {
        const url = entry.slice(entry.indexOf("http"));
        const hostname = new URL(url).hostname;
        return hostname === "bravoconvert.com" || hostname === "www.bravoconvert.com";
      });
      expect(firstPartyFailures, `${route} failed first-party resources`).toEqual([]);
      if (consoleErrors.length > 0 || badResponses.length > 0) {
        console.log(`${device.name} ${route} external diagnostics`, { consoleErrors, badResponses });
      }
      await page.close();
    }
  });
}

test("production sitemap, robots, and feeds respond with expected content", async ({ request }) => {
  for (const route of dataRoutes) {
    const response = await request.get(route);
    expect(response.status(), `${route} HTTP status`).toBe(200);
    expect((await response.text()).length, `${route} response body`).toBeGreaterThan(50);
  }

  const sitemap = await request.get("/sitemap.xml");
  const sitemapText = await sitemap.text();
  for (const route of htmlRoutes) {
    const normalized = route === "/" ? "https://bravoconvert.com" : `https://bravoconvert.com${route.replace(/\/$/, "")}`;
    expect(sitemapText, `sitemap entry ${normalized}`).toContain(normalized);
  }
});
