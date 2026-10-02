import Link from "next/link";
import { Archive } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ArchivedLinkButton({ href }: { href: string }) {
  return (
    <Button asChild variant="outline" className="rounded-lg">
      <Link href={href}>
        <Archive aria-hidden className="size-4" />
        Archived
      </Link>
    </Button>
  );
}
