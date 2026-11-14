import type { ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import IconTile, { type IconTileTone } from "@/components/tool/icon-tile";
import { cn } from "@/lib/utils";

/**
 * Native <details>/<summary> accordion. Folded answers stay in the static HTML, so search engines
 * read them, and the browser handles Enter/Space and focus without any script.
 */
export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

/**
 * `heading="h2"` is for a whole folded section (tool and home explanations): a larger row with an
 * optional icon tile. The default h3 row is the FAQ question.
 */
export function AccordionItem({
  question,
  children,
  className,
  heading = "h3",
  icon,
  tone = "blue",
}: {
  question: ReactNode;
  children: ReactNode;
  className?: string;
  heading?: "h2" | "h3";
  icon?: LucideIcon;
  tone?: IconTileTone;
}) {
  const section = heading === "h2";
  const Heading = heading;
  return (
    <details className={cn("group rounded-field bg-card shadow-soft", section && "rounded-card", className)}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-4 rounded-field outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden",
          section ? "rounded-card px-5 py-4 sm:px-6 sm:py-5" : "px-5 py-4",
        )}
      >
        <Heading className={cn("flex items-center gap-3 font-bold leading-snug text-foreground", section ? "text-lg sm:text-xl" : "text-base")}>
          {icon && <IconTile icon={icon} size="sm" tone={tone} className="hidden shrink-0 sm:inline-flex" />}
          {question}
        </Heading>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <div className={cn("text-base leading-relaxed text-muted-foreground", section ? "px-5 pb-6 sm:px-6" : "px-5 pb-5")}>{children}</div>
    </details>
  );
}
