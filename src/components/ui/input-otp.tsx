"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";

import { cn } from "@/lib/utils";

const slotBase =
  "relative flex h-12 min-w-0 flex-1 items-center justify-center rounded-md border border-ink-400/30 bg-white text-[18px] font-medium text-ink-900 transition-colors";
const slotActive = "z-10 border-brand-600 outline-1 outline-offset-0 outline-brand-600";
const slotInvalid = "border-destructive outline-destructive";

type InputOTPProps = React.ComponentProps<typeof OTPInput>;

function InputOTP({ containerClassName, ...props }: InputOTPProps) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn("flex items-center gap-2 has-disabled:opacity-60", containerClassName)}
      {...props}
    />
  );
}

type InputOTPSlotProps = React.ComponentProps<"div"> & {
  index: number;
  invalid?: boolean;
};

function InputOTPSlot({ index, invalid, className, ...props }: InputOTPSlotProps) {
  const { slots } = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      className={cn(slotBase, isActive && slotActive, invalid && slotInvalid, className)}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <span aria-hidden className="pointer-events-none absolute h-5 w-px animate-pulse bg-ink-900" />
      )}
    </div>
  );
}

export { InputOTP, InputOTPSlot };
