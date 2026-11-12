import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function TaskCard({ task, how, tool, href }: { task: string; how: string; tool: string; href: string }) {
  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-bold text-foreground">{task}</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        {how}{" "}
        <Link href={href} className="font-bold text-primary underline-offset-4 hover:underline">
          {tool}
        </Link>
      </p>
    </Card>
  );
}
