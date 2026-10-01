import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <span className="grid size-11 place-items-center rounded-xl bg-ink-100 text-ink-500 [&_svg]:size-5">
        {icon}
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-[36ch] text-[14px] leading-normal text-ink-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
