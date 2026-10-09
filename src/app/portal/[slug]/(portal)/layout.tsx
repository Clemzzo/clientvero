import type { ReactNode } from "react";

import { PortalShell } from "@/components/portal/PortalShell";
import { requirePortalContext } from "@/server/auth/portal-session";
import { unreadSummary } from "@/server/repositories/message.repository";

type PortalAppLayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function PortalAppLayout({ children, params }: PortalAppLayoutProps) {
  const context = await requirePortalContext((await params).slug);
  const messages = await unreadSummary(context.organization.id, "client", context.client.id);

  return (
    <PortalShell
      slug={context.organization.slug}
      organizationName={context.organization.name}
      clientName={context.client.name}
      email={context.email}
      messages={messages}
    >
      {children}
    </PortalShell>
  );
}
