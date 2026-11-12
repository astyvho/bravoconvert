import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export type Status = "found" | "clean" | "neutral";

/** Amber = found, green = not present / removed, neutral = nothing to say. The copy is the caller's. */
export default function StatusBadge({ status, children, className }: { status: Status; children: ReactNode; className?: string }) {
  return (
    <Badge variant={status} className={className}>
      {children}
    </Badge>
  );
}
