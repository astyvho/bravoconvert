import { CheckCircle2, type LucideIcon } from "lucide-react";
import IconTile, { type IconTileTone } from "@/components/tool/icon-tile";
import { REPORT_ICONS } from "@/components/tool/report-panel";
import { demoReport } from "@/lib/demo-report";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const TEXT: Record<Locale, { ready: string; readyNote: string }> = {
  en: { ready: "Clean copy ready", readyNote: "Nothing left inside" },
  ko: { ready: "깨끗한 사본 준비됨", readyNote: "남은 정보 없음" },
};

type Bubble = { icon: LucideIcon; tone: IconTileTone; title: string; value: string; className: string };

/**
 * The hero's right-hand side: a tilted "photo" drawn with CSS (no image file) and three speech
 * bubbles whose values are the real measurements from exif-demo.json, so what the visitor sees is
 * exactly what the viewer will print for the sample photo.
 */
export default function HeroStage({ locale }: { locale: Locale }) {
  const t = TEXT[locale];
  const report = demoReport(locale);
  const location = report.find((item) => item.id === "location")!;
  const device = report.find((item) => item.id === "device")!;
  const bubbles: Bubble[] = [
    { icon: REPORT_ICONS.location, tone: "found", title: location.label, value: location.value ?? "", className: "right-0 top-[4%]" },
    { icon: REPORT_ICONS.device, tone: "found", title: device.label, value: device.value ?? "", className: "right-[2%] top-[42%]" },
    { icon: CheckCircle2, tone: "clean", title: t.ready, value: t.readyNote, className: "right-[8%] bottom-[4%]" },
  ];

  return (
    <div data-testid="hero-stage" className="relative h-[260px] w-full lg:h-[420px]">
      <div aria-hidden="true" className="absolute left-[4%] top-[6%] h-[84%] w-[60%] -rotate-3 rounded-card bg-gradient-to-br from-[#fcd5b5] via-[#f6a46b] to-[#d97a3a] shadow-soft">
        <div className="absolute inset-x-5 bottom-6 h-1/4 rounded-tile bg-white/35" />
      </div>
      {bubbles.map((bubble) => (
        <div key={bubble.title} className={cn("absolute flex max-w-[72%] items-center gap-2.5 rounded-field bg-card px-3 py-2.5 shadow-soft", bubble.className)}>
          <IconTile icon={bubble.icon} size="sm" tone={bubble.tone} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-foreground">{bubble.title}</p>
            <p className="truncate text-caption font-medium text-muted-foreground tabular-nums">{bubble.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
