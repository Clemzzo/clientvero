import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BackLinkProps = {
  href: string;
  children: ReactNode;
};

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md text-[14px] font-medium text-ink-500 transition-colors hover:text-ink-900"
    >
      <ArrowLeft aria-hidden className="size-4" />
      {children}
    </Link>
  );
}
