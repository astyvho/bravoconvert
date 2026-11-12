import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import IconTile, { type IconTileTone } from "@/components/tool/icon-tile";

export default function ToolCard({ icon, tone, title, points, body, note, href, cta }: { icon: LucideIcon; tone: IconTileTone; title: string; points?: string[]; body: string; note?: ReactNode; href: string; cta: string }) {
  return (
    <Link href={href} className="group block h-full rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
      <Card className="flex h-full flex-col p-6 transition-colors group-hover:bg-muted/60">
        <IconTile icon={icon} tone={tone} size="md" />
        <h3 className="mt-4 text-h3 text-foreground">{title}</h3>
        {points && (
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {points.map((point) => <li key={point}>· {point}</li>)}
          </ul>
        )}
        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{body}</p>
        {note && <p className="mt-4 rounded-field bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">{note}</p>}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:underline">
          {cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Card>
    </Link>
  );
}
