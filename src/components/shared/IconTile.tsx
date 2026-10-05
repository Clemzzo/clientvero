import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { AccentTone } from "@/types/accent-tone";

const tones: Record<AccentTone, string> = {
  brand: "bg-brand-50 text-brand-600",
  mint: "bg-mint-50 text-mint-600",
  ocean: "bg-ocean-50 text-ocean-600",
  sun: "bg-sun-50 text-sun-600",
  coral: "bg-coral-50 text-coral-600",
  grape: "bg-grape-50 text-grape-600",
};

const sizes = {
  sm: "size-8 rounded-lg [&_svg]:size-4",
  md: "size-10 rounded-xl [&_svg]:size-5",
};

type IconTileProps = {
  icon: ReactNode;
  tone: AccentTone;
  size?: keyof typeof sizes;
  className?: string;
};

export function IconTile({ icon, tone, size = "sm", className }: IconTileProps) {
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center", tones[tone], sizes[size], className)}>
      {icon}
    </span>
  );
}
