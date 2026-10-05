"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

import type { TurnstileAction } from "@/types/turnstile";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileWidgetProps = {
  action: TurnstileAction;
  resetKey: unknown;
  onVerifiedChange?: (verified: boolean) => void;
};

export function TurnstileWidget({ action, resetKey, onVerifiedChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifiedChangeRef = useRef(onVerifiedChange);

  useEffect(() => {
    onVerifiedChangeRef.current = onVerifiedChange;
  }, [onVerifiedChange]);

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current || !siteKey || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      size: "flexible",
      callback: () => onVerifiedChangeRef.current?.(true),
      "expired-callback": () => onVerifiedChangeRef.current?.(false),
      "error-callback": () => onVerifiedChangeRef.current?.(false),
      "timeout-callback": () => onVerifiedChangeRef.current?.(false),
    });
  }, [action]);

  useEffect(() => {
    renderWidget();

    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  useEffect(() => {
    if (resetKey && widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
      onVerifiedChangeRef.current?.(false);
    }
  }, [resetKey]);

  return (
    <>
      <Script src={SCRIPT_URL} strategy="afterInteractive" onReady={renderWidget} />
      <div ref={containerRef} className="min-h-16.25" />
    </>
  );
}
