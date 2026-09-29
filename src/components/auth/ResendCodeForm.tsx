"use client";

import { startTransition, useActionState, useEffect, useState } from "react";

import { FormAlert } from "@/components/shared/FormAlert";
import { resendVerificationAction } from "@/server/actions/auth";

const cooldownSeconds = 60;

function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return { secondsLeft, start: () => setSecondsLeft(cooldownSeconds) };
}

export function ResendCodeForm() {
  const [state, resend, isPending] = useActionState(resendVerificationAction, null);
  const countdown = useCountdown();
  const waiting = countdown.secondsLeft > 0;

  function handleResend() {
    countdown.start();
    startTransition(() => resend());
  }

  function buttonLabel() {
    if (isPending) return "Sending…";
    if (waiting) return `Resend code in ${countdown.secondsLeft}s`;
    return "Resend code";
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-[14px] text-ink-500">
        Didn&apos;t get it?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending || waiting}
          className="font-semibold text-brand-700 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-ink-500 disabled:no-underline"
        >
          {buttonLabel()}
        </button>
      </p>

      {state?.message && <FormAlert tone="success">{state.message}</FormAlert>}
      {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
    </div>
  );
}
