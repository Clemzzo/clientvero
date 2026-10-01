import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageCount: number;
  pathname: string;
  searchParams: Record<string, string | undefined>;
};

const linkStyles =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-[14px] font-medium text-ink-700 transition-colors hover:bg-ink-50";
const disabledStyles = "pointer-events-none opacity-50";

function pageHref(pathname: string, searchParams: PaginationProps["searchParams"], page: number) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }

  if (page > 1) params.set("page", String(page));
  else params.delete("page");

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function Pagination({ page, pageCount, pathname, searchParams }: PaginationProps) {
  if (pageCount <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < pageCount;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <p className="text-[14px] text-ink-500">
        Page <span className="font-semibold text-ink-900">{page}</span> of {pageCount}
      </p>

      <div className="flex gap-2">
        <Link
          href={pageHref(pathname, searchParams, page - 1)}
          aria-disabled={!hasPrevious}
          tabIndex={hasPrevious ? undefined : -1}
          className={cn(linkStyles, !hasPrevious && disabledStyles)}
        >
          <ChevronLeft aria-hidden className="size-4" />
          Previous
        </Link>
        <Link
          href={pageHref(pathname, searchParams, page + 1)}
          aria-disabled={!hasNext}
          tabIndex={hasNext ? undefined : -1}
          className={cn(linkStyles, !hasNext && disabledStyles)}
        >
          Next
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>
    </nav>
  );
}
