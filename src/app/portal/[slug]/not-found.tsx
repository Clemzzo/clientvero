import { SearchX } from "lucide-react";

import { PortalFooter } from "@/components/portal/PortalFooter";
import { EmptyState } from "@/components/shared/EmptyState";

export default function PortalNotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink-50 px-4">
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<SearchX />}
          title="This page isn't available"
          description="The link may be wrong, or you may not have access to it. Check with the business that invited you."
        />
      </div>
      <PortalFooter />
    </main>
  );
}
