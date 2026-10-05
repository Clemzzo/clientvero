import type { ReactNode } from "react";

import { PortalBrand } from "@/components/portal/PortalBrand";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { Card } from "@/components/ui/card";

type PortalAuthCardProps = {
  organizationName: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PortalAuthCard({ organizationName, title, description, children }: PortalAuthCardProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-ink-50 px-4 pt-12 sm:pt-20">
      <div className="mx-auto w-full max-w-110 flex-1">
        <PortalBrand organizationName={organizationName} size="lg" />
        <Card className="mt-8 p-6 sm:p-8">
          <h1 className="font-display text-[clamp(22px,2vw,26px)] font-bold tracking-[-0.02em] text-ink-900">{title}</h1>
          <p className="mt-1.5 text-[14px] leading-normal text-ink-500">{description}</p>
          <div className="mt-6">{children}</div>
        </Card>
      </div>
      <PortalFooter />
    </main>
  );
}
