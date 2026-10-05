import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { IconTile } from "@/components/shared/IconTile";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AccentTone } from "@/types/accent-tone";

type StatCardProps = {
  icon: ReactNode;
  tone: AccentTone;
  label: string;
  value: string;
  hint: string;
  href: string;
};

const hoverBorders: Record<AccentTone, string> = {
  brand: "group-hover:border-brand-200",
  mint: "group-hover:border-mint-200",
  ocean: "group-hover:border-ocean-200",
  sun: "group-hover:border-sun-200",
  coral: "group-hover:border-coral-200",
  grape: "group-hover:border-grape-200",
};

const hoverArrows: Record<AccentTone, string> = {
  brand: "group-hover:text-brand-600",
  mint: "group-hover:text-mint-600",
  ocean: "group-hover:text-ocean-600",
  sun: "group-hover:text-sun-600",
  coral: "group-hover:text-coral-600",
  grape: "group-hover:text-grape-600",
};

export function StatCard({ icon, tone, label, value, hint, href }: StatCardProps) {
  return (
    <Link href={href} className="group block h-full rounded-2xl">
      <Card
        className={cn(
          "flex h-full flex-col p-5 transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_-12px_rgba(7,11,24,0.18)]",
          hoverBorders[tone],
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <IconTile icon={icon} tone={tone} size="md" />
          <ArrowUpRight
            aria-hidden
            className={cn(
              "size-4 text-ink-400 transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
              hoverArrows[tone],
            )}
          />
        </div>
        <p className="mt-4 text-[13px] font-medium text-ink-500">{label}</p>
        <p className="mt-1 font-display text-[clamp(26px,2.4vw,32px)] font-bold leading-none tracking-[-0.03em] text-ink-900 tabular-nums">
          {value}
        </p>
        <p className="mt-auto pt-3 text-[12.5px] leading-snug text-ink-500">{hint}</p>
      </Card>
    </Link>
  );
}
