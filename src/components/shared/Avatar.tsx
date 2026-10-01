import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  className?: string;
};

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.trim().slice(0, 2);
  return letters.toUpperCase() || "?";
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[12px] font-semibold text-brand-700",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
