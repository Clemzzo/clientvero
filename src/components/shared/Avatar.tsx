import Image from "next/image";

import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
};

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.trim().slice(0, 2);
  return letters.toUpperCase() || "?";
}

export function Avatar({ name, src, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-50 text-[12px] font-semibold text-brand-700",
        className,
      )}
    >
      {src ? <Image src={src} alt="" fill unoptimized sizes="96px" className="object-cover" /> : initials(name)}
    </span>
  );
}
