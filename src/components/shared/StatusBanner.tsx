import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type BannerTone = "success" | "error";

const tones: Record<BannerTone, { icon: typeof CircleCheck; styles: string }> = {
  success: { icon: CircleCheck, styles: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  error: { icon: CircleAlert, styles: "border-rose-200 bg-rose-50 text-rose-800" },
};

type StatusBannerProps = {
  tone: BannerTone;
  children: ReactNode;
  onDismiss: () => void;
  className?: string;
};

export function StatusBanner({ tone, children, onDismiss, className }: StatusBannerProps) {
  const { icon: Icon, styles } = tones[tone];

  return (
    <div
      className={cn(
        "toast-in flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13.5px] leading-snug shadow-[0_16px_40px_-20px_rgba(7,11,24,0.35)]",
        styles,
        className,
      )}
    >
      <Icon aria-hidden className="mt-px size-4 shrink-0" />
      <p className="min-w-0 flex-1 font-medium">{children}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="-my-0.5 grid size-6 shrink-0 place-items-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}
