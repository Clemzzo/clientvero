import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
};

export function SubmitButton({ pending, pendingLabel, children }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending} className="mt-2 h-12 w-full rounded-md text-[15px] font-semibold">
      {pending && <LoaderCircle aria-hidden className="size-4.5 animate-spin" />}
      {pending ? pendingLabel : children}
    </Button>
  );
}
