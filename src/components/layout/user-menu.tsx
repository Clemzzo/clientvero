"use client";

import { useTransition } from "react";
import { ChevronDown, LogOut } from "lucide-react";

import { Avatar } from "@/components/shared/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  name: string;
  email: string;
  onSignOut: () => Promise<void>;
};

export function UserMenu({ name, email, onSignOut }: UserMenuProps) {
  const [isSigningOut, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${name}, account menu`}
        className="flex items-center gap-2 rounded-full p-1 pr-2 text-ink-700 transition-colors hover:bg-ink-100 data-[state=open]:bg-ink-100"
      >
        <Avatar name={name} />
        <span className="hidden max-w-40 truncate text-[14px] font-medium md:block">{name}</span>
        <ChevronDown aria-hidden className="size-4 text-ink-500" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="truncate text-[14px] font-semibold text-ink-900">{name}</p>
          <p className="truncate text-[12.5px] font-normal text-ink-500">{email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          tone="destructive"
          disabled={isSigningOut}
          onSelect={(event) => {
            event.preventDefault();
            startTransition(() => onSignOut());
          }}
        >
          <LogOut aria-hidden />
          {isSigningOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
