import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import IconTile, { type IconTileTone } from "@/components/tool/icon-tile";

export default function StepCard({ index, icon, tone, title, body, href, cta }: { index: string; icon: LucideIcon; tone: IconTileTone; title: string; body: string; href: string; cta: string }) {
  return (
    <Card className="flex flex-col items-center p-7 text-center">
      <IconTile icon={icon} tone={tone} size="lg" />
      <p className="mt-4 text-caption uppercase tracking-wider text-primary">{index}</p>
      <h3 className="mt-1 text-[19px] font-extrabold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
      <Link href={href} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-primary hover:underline">
        {cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
