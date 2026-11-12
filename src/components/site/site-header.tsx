"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Languages, Menu } from "lucide-react";
import { koPath, stripKo, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PageContainer from "./page-container";
import { HEADER_TEXT } from "./site-header-text";

const PILL_LINK = "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export default function SiteHeader({ locale = "en" }: { locale?: Locale }) {
  const t = HEADER_TEXT[locale];
  const pathname = usePathname() ?? "/";
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  // Same-page language switch. From an English tool reached via ?lang=ko, go back to the Korean viewer.
  const [cameFromKorean, setCameFromKorean] = useState(false);
  useEffect(() => {
    setCameFromKorean(new URLSearchParams(window.location.search).get("lang") === "ko");
  }, [pathname]);
  const switchHref = locale === "ko" ? stripKo(normalized) : koPath(normalized) ?? (cameFromKorean ? "/ko/view/exif/" : "/ko/");
  const home = locale === "ko" ? "/ko/" : "/";

  const [sheetOpen, setSheetOpen] = useState(false);
  const isCurrent = (href: string) => normalized === href.split("?")[0];

  const switchLink = (
    <Link
      href={switchHref}
      hrefLang={locale === "ko" ? "en" : "ko"}
      lang={locale === "ko" ? "en" : "ko"}
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 bg-card shadow-soft")}
    >
      {/* The icon is dropped under 360px so logo + switch + menu fit a 320px screen without overflow. */}
      <Languages size={16} aria-hidden="true" className="hidden min-[360px]:block" />
      {t.switchLabel}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-background">
      <PageContainer className="flex h-[72px] items-center justify-between gap-2 sm:gap-3">
        <Link href={home} className="flex shrink-0 items-center gap-2.5 text-[17px] font-extrabold tracking-tight text-foreground">
          <span aria-hidden="true" className="inline-block h-7 w-7 rounded-[9px] bg-primary shadow-cta" />
          BravoConvert
        </Link>

        {/* Desktop: pill navigation. Tool links also live in the footer, so crawlers see them without the menu. */}
        <nav aria-label={t.tools} className="hidden items-center gap-0.5 rounded-full bg-card p-1 shadow-soft lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={cn(PILL_LINK, "inline-flex items-center gap-1 data-[state=open]:bg-muted data-[state=open]:text-foreground")}>
                {t.tools}
                <ChevronDown size={16} aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={10} className="w-72 rounded-field border-0 p-2 shadow-soft">
              {t.toolItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild className="rounded-tile-sm px-3 py-2.5 focus:bg-muted">
                  <Link href={item.href} className="flex flex-col items-start gap-0.5">
                    <span className="font-semibold text-foreground">{item.label}</span>
                    <span className="text-caption font-medium text-muted-foreground">{item.note}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {t.primaryLinks.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined} className={cn(PILL_LINK, isCurrent(item.href) && "bg-muted text-foreground")}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {switchLink}
          <Link href={t.ctaHref} className={cn(buttonVariants({ size: "sm" }), "hidden lg:inline-flex")}>
            {t.cta}
          </Link>

          {/* Mobile: hamburger → sheet with every link. */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t.toggle} className="h-10 w-10 bg-card shadow-soft lg:hidden">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-describedby={undefined} className="w-[320px] max-w-[88vw] overflow-y-auto rounded-l-card border-0 p-6">
              <SheetTitle className="text-h3">{t.menuTitle}</SheetTitle>
              <p className="mt-6 text-caption uppercase tracking-wide text-muted-foreground">{t.tools}</p>
              <ul className="mt-2 flex flex-col">
                {t.toolItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setSheetOpen(false)} className="flex flex-col gap-0.5 rounded-tile-sm px-3 py-2.5 hover:bg-muted">
                      <span className="font-semibold text-foreground">{item.label}</span>
                      <span className="text-caption font-medium text-muted-foreground">{item.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Separator className="my-4 bg-border" />
              <ul className="flex flex-col">
                {t.links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setSheetOpen(false)} className="block rounded-tile-sm px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={t.ctaHref} onClick={() => setSheetOpen(false)} className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}>
                {t.cta}
              </Link>
            </SheetContent>
          </Sheet>
        </div>
      </PageContainer>
    </header>
  );
}
