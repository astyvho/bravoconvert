import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const PROSE =
  "max-w-[720px] text-base leading-7 text-foreground " +
  "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-h2 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-3 [&_h2:first-child]:mt-0 " +
  "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-h3 " +
  "[&_p]:my-4 [&_p]:text-muted-foreground [&_li]:text-muted-foreground " +
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul:has(>li.rounded-field)]:list-none [&_ul:has(>li.rounded-field)]:pl-0 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 " +
  "[&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline " +
  "[&_strong]:font-bold [&_strong]:text-foreground " +
  "[&_table]:w-full [&_table]:text-sm [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_td]:p-3 [&_td]:align-top " +
  "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground " +
  // Tables and figures may run wider than the text column, up to 880px (spec 7.4); a wrapper with
  // .prose-wide scrolls sideways on its own instead of widening the page.
  "[&_.prose-wide]:my-6 [&_.prose-wide]:overflow-x-auto [&_.prose-wide]:rounded-field [&_.prose-wide]:bg-card [&_.prose-wide]:shadow-soft lg:[&_.prose-wide]:w-[880px] lg:[&_.prose-wide]:max-w-[880px] " +
  "[&_thead_tr]:border-b-2 [&_thead_tr]:border-border [&_tbody_tr]:border-b [&_tbody_tr]:border-border [&_tbody_tr:last-child]:border-0 " +
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-foreground";

/** Body-copy styling for explanatory articles and content pages. */
export default function Prose({
  as = "div",
  className,
  children,
  ...rest
}: { as?: "div" | "article" | "section"; children: ReactNode } & HTMLAttributes<HTMLElement>) {
  return createElement(as, { className: cn(PROSE, className), ...rest }, children);
}
