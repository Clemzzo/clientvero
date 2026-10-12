import { FileX } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";

export default function InvoiceNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink-100 px-4">
      <EmptyState
        icon={<FileX />}
        title="This invoice isn't available"
        description="The link may be wrong, or the invoice was removed. Contact the business that sent it."
      />
    </main>
  );
}
