"use client";

import { useState, useTransition } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { FormAlert } from "@/components/shared/FormAlert";
import { WorkspaceLogo } from "@/components/shared/WorkspaceLogo";
import { Button } from "@/components/ui/button";
import type { OrganizationRole } from "@/db/schema";

type JoinInvitationCardProps = {
  organizationName: string;
  logoSrc: string | null;
  inviterName: string | null;
  role: OrganizationRole;
  onJoin: () => Promise<{ error?: string }>;
};

export function JoinInvitationCard({ organizationName, logoSrc, inviterName, role, onJoin }: JoinInvitationCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function join() {
    setError(null);
    startTransition(async () => {
      const result = await onJoin();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <div className="flex items-center gap-3">
        <WorkspaceLogo name={organizationName} src={logoSrc} className="size-11 rounded-xl text-[18px]" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-ink-900">{organizationName}</p>
          <p className="truncate text-[13px] text-ink-500">
            {inviterName ? `${inviterName} invited you` : "You've been invited"} as {role === "ADMIN" ? "an admin" : "a member"}
          </p>
        </div>
      </div>
      <Button type="button" className="h-11 w-full rounded-lg" disabled={isPending} onClick={join}>
        {isPending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
        {isPending ? "Joining…" : `Join ${organizationName}`}
        {!isPending && <ArrowRight aria-hidden className="size-4" />}
      </Button>
    </div>
  );
}
