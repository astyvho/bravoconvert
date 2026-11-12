import { expect, test } from "@playwright/test";

test("desktop Tools menu opens with the keyboard and lists the five tools", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  const trigger = page.getByRole("button", { name: "Tools" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem")).toHaveCount(5);
  await expect(menu.getByRole("menuitem", { name: /EXIF Viewer/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("mobile menu is a sheet that traps focus and links every page", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await page.getByRole("button", { name: "Toggle menu" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Merge & Split PDF" })).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("the consent banner can be reopened from the footer and the floating pill is gone", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(page.getByRole("region", { name: "Privacy choices" })).toBeHidden();
  await expect(page.locator("button.fixed")).toHaveCount(0);
  await page.getByRole("contentinfo").getByRole("button", { name: "Privacy choices" }).click();
  await expect(page.getByRole("region", { name: "Privacy choices" })).toBeVisible();
});

test("tool links are in the static HTML of every page", async ({ request }) => {
  for (const path of ["/", "/ko/", "/view/exif/", "/guides/"]) {
    const html = await (await request.get(path)).text();
    for (const href of ["/view/exif/", "/convert/img/", "/convert/pdf/", "/edit/image/", "/edit/pdf/"]) {
      // Korean pages link the Korean viewer (/ko/view/exif/) instead of the English one.
      const expected = path.startsWith("/ko/") && href === "/view/exif/" ? `href="/ko${href}` : `href="${href}`;
      expect(html, `${path} links ${href}`).toContain(expected);
    }
  }
});
