import type { ReactNode } from "react";

type SettingsHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function SettingsHeader({ title, description, action }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink-900">{title}</h2>
        <p className="mt-1 text-[14px] leading-normal text-ink-500">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
