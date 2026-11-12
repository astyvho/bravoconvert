import type { ReactNode } from "react";
import { Check, type LucideIcon } from "lucide-react";
import IconTile, { type IconTileTone } from "@/components/tool/icon-tile";
import { cn } from "@/lib/utils";

export type ToolChip = { label: string; ok?: boolean };

/**
 * Every tool page starts with this: breadcrumb, icon tile + H1 + one line, then chips for the
 * accepted formats and limits (`ok` chips are green, e.g. "Nothing uploaded"). `children` is the
 * slot under the chips for notices such as MetadataRemovalNotice.
 */
export default function ToolPageHeader({
  crumb,
  title,
  intro,
  icon,
  tone = "blue",
  chips,
  children,
  className,
}: {
  /** [root, current], e.g. ["Tools", "EXIF Viewer"]. */
  crumb: [string, string];
  title: string;
  intro: string;
  icon: LucideIcon;
  tone?: IconTileTone;
  chips: ToolChip[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("pt-2", className)}>
      <p className="text-[13px] font-medium text-muted-foreground">
        {crumb[0]} / <b className="font-semibold text-foreground">{crumb[1]}</b>
      </p>
      <div className="mt-3 flex items-start gap-4">
        <IconTile icon={icon} tone={tone} size="lg" className="hidden sm:inline-flex" />
        <div className="min-w-0">
          <h1 className="text-[30px] font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-h1">{title}</h1>
          <p className="mt-1.5 max-w-[640px] text-base leading-relaxed text-muted-foreground">{intro}</p>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li
            key={chip.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-caption",
              chip.ok ? "bg-status-clean text-status-clean-foreground" : "bg-card text-muted-foreground shadow-soft",
            )}
          >
            {chip.ok && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {chip.label}
          </li>
        ))}
      </ul>
      {children}
    </header>
  );
}
