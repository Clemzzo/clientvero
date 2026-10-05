import * as React from "react";

import { IconTile } from "@/components/shared/IconTile";
import { cn } from "@/lib/utils";
import type { AccentTone } from "@/types/accent-tone";

function Card({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="card"
      className={cn("rounded-2xl border border-ink-200 bg-white shadow-[0_1px_2px_rgba(7,11,24,0.04)]", className)}
      {...props}
    />
  );
}

type CardHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: { node: React.ReactNode; tone: AccentTone };
  className?: string;
};

function CardHeader({ title, description, action, icon, className }: CardHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <IconTile icon={icon.node} tone={icon.tone} />}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}

export { Card, CardHeader };
