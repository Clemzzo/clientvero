import { cn } from "@/lib/utils";

type UnreadBadgeProps = {
  count: number;
  className?: string;
};

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-coral-600 px-1.5 text-[11.5px] font-semibold leading-none text-white tabular-nums",
        className,
      )}
    >
      <span aria-hidden>{count > 99 ? "99+" : count}</span>
      <span className="sr-only">{count === 1 ? "1 unread message" : `${count} unread messages`}</span>
    </span>
  );
}
