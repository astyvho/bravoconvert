import type { LiHTMLAttributes, ReactNode } from "react";
import { Camera, Clock, Fingerprint, MapPin, PenLine, User, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import IconTile from "@/components/tool/icon-tile";
import type { ReportItem, ReportItemId } from "@/lib/demo-report";
import { cn } from "@/lib/utils";

export const REPORT_ICONS: Record<ReportItemId, LucideIcon> = {
  location: MapPin,
  time: Clock,
  device: Camera,
  serial: Fingerprint,
  person: User,
  software: PenLine,
};

type RowProps = {
  item: ReportItem;
  icon?: LucideIcon;
  /** The status badge; its copy is locale-specific so the caller renders it. */
  badge: ReactNode;
  /** Anything under the value, e.g. the viewer's OpenStreetMap link. */
  children?: ReactNode;
} & LiHTMLAttributes<HTMLLIElement>;

export function ReportRow({ item, icon, badge, children, className, ...rest }: RowProps) {
  const Icon = icon ?? REPORT_ICONS[item.id];
  return (
    <li className={cn("grid grid-cols-[36px_1fr_auto] items-center gap-3 py-3", className)} {...rest}>
      <IconTile icon={Icon} size="sm" tone={item.found ? "found" : "clean"} />
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{item.label}</p>
        {item.value !== null && <p className="break-words text-[13px] text-muted-foreground tabular-nums">{item.value}</p>}
        {children}
      </div>
      {badge}
    </li>
  );
}

type PanelProps = {
  title: ReactNode;
  /** Right-hand side of the header: usually a StatusBadge with the found count. */
  summary?: ReactNode;
  items: ReportItem[];
  rowBadge: (item: ReportItem) => ReactNode;
  footer?: ReactNode;
  dense?: boolean;
  className?: string;
  "data-testid"?: string;
};

export default function ReportPanel({ title, summary, items, rowBadge, footer, dense, className, ...rest }: PanelProps) {
  return (
    <Card className={className} {...rest}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {summary}
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-muted">
          {items.map((item) => (
            <ReportRow key={item.id} item={item} badge={rowBadge(item)} className={dense ? "py-2" : undefined} />
          ))}
        </ul>
      </CardContent>
      {footer && <CardFooter className="flex-wrap">{footer}</CardFooter>}
    </Card>
  );
}
