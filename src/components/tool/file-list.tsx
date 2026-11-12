"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FileList({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <ul aria-label={label} className={cn("flex flex-col gap-1", className)}>
      {children}
    </ul>
  );
}

/** One file: thumbnail, name, meta line, and a badge or action on the right. The row is a button. */
export function FileRow({
  thumbUrl,
  name,
  meta,
  badge,
  selected = false,
  onSelect,
  ariaCurrent,
}: {
  thumbUrl: string;
  name: string;
  meta: string;
  badge: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  ariaCurrent?: "true";
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={ariaCurrent}
        className={cn(
          "grid w-full grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-field px-3 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selected && "bg-primary-soft ring-2 ring-ring hover:bg-primary-soft",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbUrl} alt="" className="h-[52px] w-[52px] rounded-tile-sm bg-muted object-cover" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-foreground">{name}</span>
          <span className="block text-caption font-medium text-muted-foreground tabular-nums">{meta}</span>
        </span>
        {badge}
      </button>
    </li>
  );
}
