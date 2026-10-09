"use client";

import { useEffect, useRef } from "react";

export function usePolling(callback: () => Promise<void>, intervalMs: number, enabled = true) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let running = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function tick() {
      if (running || document.visibilityState !== "visible") return;
      running = true;
      await callbackRef.current().catch(() => undefined);
      running = false;
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(tick, intervalMs);
    }

    function onVisible() {
      if (document.visibilityState === "visible") {
        void tick();
        start();
      } else {
        clearInterval(timer);
      }
    }

    void tick();
    start();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [intervalMs, enabled]);
}
