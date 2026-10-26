"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { FormAlert } from "@/components/shared/FormAlert";

const pollEveryMs = 3_000;
const maxPolls = 10;

export function CheckoutActivating() {
  const router = useRouter();
  const [polls, setPolls] = useState(0);
  const gaveUp = polls >= maxPolls;

  useEffect(() => {
    if (gaveUp) return;
    const timer = window.setTimeout(() => {
      router.refresh();
      setPolls((count) => count + 1);
    }, pollEveryMs);
    return () => window.clearTimeout(timer);
  }, [gaveUp, polls, router]);

  if (gaveUp) {
    return (
      <FormAlert tone="error">
        Your payment went through, but activating the plan is taking longer than usual. Refresh this page in a minute.
      </FormAlert>
    );
  }

  return (
    <div role="status" className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-[14px] text-brand-800">
      <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin" />
      Thanks! We&apos;re activating your plan — this usually takes a few seconds.
    </div>
  );
}
