import type { ReactNode } from "react";

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
  // Sticky on desktop, but never taller than the screen below the header: a long panel scrolls on its
  // own instead of hiding its lower part until the main column ends. Side padding keeps card shadows.
  const panelColumn = (
    <div className="min-w-0 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:-mx-3 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:px-3 lg:pb-4">
      {panel}
    </div>
  );

  return (
    <div className={className}>
      {panel ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          {/* With panelFirstOnMobile the panel is first in the DOM, so reading and focus order match the
              stacked phone layout; grid placement still puts it in the right-hand column on desktop. */}
          {panelFirstOnMobile && panelColumn}
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">{main}</div>
          {!panelFirstOnMobile && panelColumn}
        </div>
      ) : (
        main
      )}
      {results && <div className="mt-6 space-y-6">{results}</div>}
    </div>
  );
}
