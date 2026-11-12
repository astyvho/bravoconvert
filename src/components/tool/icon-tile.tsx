import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconTileTone = "blue" | "yellow" | "green" | "pink" | "peach" | "found" | "clean";

// Pastel tiles are decoration (home cards); `found`/`clean` carry meaning and match the badges.
const TONE: Record<IconTileTone, string> = {
  blue: "bg-tile-blue text-primary",
  yellow: "bg-tile-yellow text-status-found-foreground",
  green: "bg-tile-green text-status-clean-foreground",
  pink: "bg-tile-pink text-destructive-foreground",
  peach: "bg-tile-peach text-foreground",
  found: "bg-status-found text-status-found-foreground",
  clean: "bg-status-clean text-status-clean-foreground",
};

const SIZE = {
  sm: "h-9 w-9 rounded-tile-sm [&_svg]:h-4 [&_svg]:w-4",
  md: "h-12 w-12 rounded-tile [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-16 w-16 rounded-[22px] [&_svg]:h-7 [&_svg]:w-7",
} as const;

export default function IconTile({
  icon: Icon,
  tone = "blue",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: IconTileTone;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", TONE[tone], SIZE[size], className)}>
      <Icon aria-hidden="true" />
    </span>
  );
}
