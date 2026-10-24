import Image from "next/image";

import { cn } from "@/lib/utils";

type WorkspaceLogoProps = {
  name: string;
  src: string | null;
  className?: string;
};

export function WorkspaceLogo({ name, src, className }: WorkspaceLogoProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg font-display text-[15px] font-bold",
        src ? "bg-white ring-1 ring-ink-200" : "bg-brand-600 text-white",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" fill unoptimized sizes="96px" className="object-contain" />
      ) : (
        name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}
