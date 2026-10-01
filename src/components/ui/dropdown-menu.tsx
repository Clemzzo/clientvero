"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

type DropdownMenuContentProps = React.ComponentProps<typeof DropdownMenuPrimitive.Content>;
type DropdownMenuLabelProps = React.ComponentProps<typeof DropdownMenuPrimitive.Label>;
type DropdownMenuSeparatorProps = React.ComponentProps<typeof DropdownMenuPrimitive.Separator>;

const itemTones = {
  default: "text-ink-700 data-highlighted:bg-ink-50 data-highlighted:text-ink-900",
  destructive: "text-destructive data-highlighted:bg-red-50",
} as const;

type DropdownMenuItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  tone?: keyof typeof itemTones;
};

function DropdownMenuContent({ className, align = "end", sideOffset = 8, ...props }: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "menu-in z-50 min-w-56 overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-[0_16px_40px_-20px_rgba(7,11,24,0.35)] outline-none",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  return (
    <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" className={cn("px-2.5 py-2", className)} {...props} />
  );
}

function DropdownMenuItem({ className, tone = "default", ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-medium outline-none transition-colors",
        "data-disabled:pointer-events-none data-disabled:opacity-60",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        itemTones[tone],
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-ink-200", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
