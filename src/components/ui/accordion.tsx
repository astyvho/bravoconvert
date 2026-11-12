import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Native <details>/<summary> accordion. Folded answers stay in the static HTML, so search engines
 * read them, and the browser handles Enter/Space and focus without any script.
 */
export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

export function AccordionItem({ question, children, className }: { question: ReactNode; children: ReactNode; className?: string }) {
  return (
    <details className={cn("group rounded-field bg-card shadow-soft", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-field px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <h3 className="text-base font-bold leading-snug text-foreground">{question}</h3>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <div className="px-5 pb-5 text-base leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}
