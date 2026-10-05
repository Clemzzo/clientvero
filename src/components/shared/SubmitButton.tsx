import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-describedby"?: string;
};

export function SubmitButton({ pending, pendingLabel, children, className, disabled, ...aria }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending || disabled} {...aria} className={cn("mt-2 h-12 w-full rounded-md text-[15px] font-semibold", className)}>
      {pending && <LoaderCircle aria-hidden className="size-4.5 animate-spin" />}
      {pending ? pendingLabel : children}
    </Button>
  );
}
