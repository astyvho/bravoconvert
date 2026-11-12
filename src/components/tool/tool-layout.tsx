import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The tool page's work area: main column (list, canvas, thumbnails) and a 400px panel that sticks
 * under the header on large screens. With `panel` null (nothing loaded yet) the main column takes
 * the full width. `panelFirstOnMobile` puts the panel above the main column when stacked — the
 * EXIF viewer wants its report above a list that can be 30 rows long. `results` renders under both.
 */
export default function ToolLayout({
  main,
  panel,
  panelFirstOnMobile = false,
  results,
  className,
}: {
  main: ReactNode;
  panel: ReactNode | null;
  panelFirstOnMobile?: boolean;
  results?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {panel ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <div className={cn("min-w-0", panelFirstOnMobile && "order-last lg:order-none")}>{main}</div>
          <div className={cn("min-w-0 lg:sticky lg:top-24", panelFirstOnMobile && "order-first lg:order-none")}>{panel}</div>
        </div>
      ) : (
        main
      )}
      {results && <div className="mt-6 space-y-6">{results}</div>}
    </div>
  );
}
