import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Header for content pages (guides, FAQ, about, legal; spec 7.4): an apricot label pill, the H1, and
 * whatever lines follow it — the intro and, for articles, the published/updated date. Callers pass
 * those lines as children so their copy and <time> elements stay exactly as written.
 */
export default function ContentHeader({ label, title, children, className }: { label: string; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <header className={cn("max-w-[720px] pt-2", className)}>
      <span data-content-label className="inline-flex rounded-full bg-muted px-3.5 py-1.5 text-caption text-foreground">{label}</span>
      <h1 className="mt-4 text-[30px] font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-h1">{title}</h1>
      {children}
    </header>
  );
}
