import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** The site's one content width: 1120px, with 16px gutters on phones and 24px from `sm`. */
export default function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1120px] px-4 sm:px-6", className)} {...props} />;
}
