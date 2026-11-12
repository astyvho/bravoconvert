import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import IconTile from "@/components/tool/icon-tile";

export default function RevealItem({ icon, label, body }: { icon: LucideIcon; label: string; body: string }) {
  return (
    <Card className="flex gap-4 p-5">
      <IconTile icon={icon} tone="peach" size="sm" />
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold text-foreground">{label}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
      </div>
    </Card>
  );
}
