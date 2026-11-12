import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

// Redesign Phase 5: the legacy palette, dead components and unused i18n packages are gone, so a
// stray `brand-*` or `gray-*` class cannot quietly come back.

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) ? [path] : [];
  });
}

test("no source file uses the legacy palette", () => {
  const offenders = sourceFiles("src").filter(file =>
    /\b(?:brand|gray|blue|purple|indigo)-\d{2,3}\b|from-(?:black|blue|purple)/.test(readFileSync(file, "utf8")),
  );
  expect(offenders).toEqual([]);
});

test("the brand alias and the dead components are removed", () => {
  expect(readFileSync("tailwind.config.js", "utf8")).not.toMatch(/\bbrand:/);
  for (const file of ["AnchorAd", "InFeedAd", "ClientRoot", "ui/CustomDropdown"]) {
    expect(existsSync(`src/components/${file}.tsx`), file).toBe(false);
  }
});

test("the unused i18n packages are not installed", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  expect(Object.keys(pkg.dependencies)).not.toContain("next-intl");
  expect(Object.keys(pkg.dependencies)).not.toContain("next-international");
  expect(existsSync("src/i18n")).toBe(false);
});
