import AdSense from "@/components/AdSense";
import { cn } from "@/lib/utils";

/**
 * The one reserved ad position in the tool template, between the work area and the explanatory
 * article. `AdSense` renders nothing until the site is approved, and `empty:hidden` collapses the
 * wrapper to zero height until then. Never placed where it could cover controls or downloads.
 */
export default function AdSlot({ slot, className }: { slot: string; className?: string }) {
  return (
    <div className={cn("my-8 empty:hidden", className)}>
      <AdSense slot={slot} type="responsive" />
    </div>
  );
}
