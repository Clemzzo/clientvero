import Link from "next/link";
import { EyeOff } from "lucide-react";

export function PortalAccessBanner({ clientName }: { clientName: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-sun-200 bg-sun-50 px-4 py-3 sm:px-6">
      <EyeOff aria-hidden className="mt-0.5 size-4 shrink-0 text-sun-700" />
      <p className="text-[13.5px] leading-normal text-sun-700">
        {clientName} can&apos;t read messages yet.{" "}
        <Link href="/dashboard/clients" className="font-semibold underline underline-offset-2 hover:text-ink-900">
          Invite them to the client portal
        </Link>
      </p>
    </div>
  );
}
