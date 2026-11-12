"use client";

import type { DragEvent, HTMLAttributes, ReactNode } from "react";
import { Upload, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/card";
import IconTile from "@/components/tool/icon-tile";
import { cn } from "@/lib/utils";

type DragHandlers = {
  onDragEnter?: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
};

type Props = {
  title: string;
  note?: string;
  dragging: boolean;
  busy?: boolean;
  icon?: LucideIcon;
  /** Button row under the title. */
  actions: ReactNode;
  /** Hidden inputs and the like. */
  children?: ReactNode;
  className?: string;
} & DragHandlers &
  Omit<HTMLAttributes<HTMLDivElement>, "title" | "children" | keyof DragHandlers>;

/**
 * The drop area shared by the home page and every tool: a white card with a dashed inner field.
 * Drag handlers are wired to the outer card so the whole thing is a target. The only motion is a
 * 1% scale while a file is being dragged over it, skipped for prefers-reduced-motion.
 */
export default function DropZone({ title, note, dragging, busy, icon = Upload, actions, children, className, onDragEnter, onDragOver, onDragLeave, onDrop, ...rest }: Props) {
  const reduced = useReducedMotion();
  return (
    <Card className={cn("p-3", className)} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} {...rest}>
      <motion.div
        animate={reduced ? undefined : { scale: dragging ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "rounded-field border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-primary bg-primary-soft" : "border-border bg-background",
          busy && "opacity-70",
        )}
      >
        <IconTile icon={icon} tone="blue" size="lg" className="mx-auto" />
        <h2 className="mt-4 text-h3">{title}</h2>
        {note && <p className="mt-1.5 text-sm text-muted-foreground">{note}</p>}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{actions}</div>
        {children}
      </motion.div>
    </Card>
  );
}
