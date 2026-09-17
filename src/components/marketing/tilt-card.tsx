"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

const TILT_SWEEP_DEGREES = 5;
const TRACK_TRANSITION = "transform 120ms ease-out";
const RELEASE_TRANSITION = "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)";

export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const finePointer = useRef<MediaQueryList | null>(null);
  const reducedMotion = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    finePointer.current = window.matchMedia("(pointer: fine)");
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)");
  }, []);

  function tiltEnabled() {
    return Boolean(finePointer.current?.matches) && !reducedMotion.current?.matches;
  }

  function handlePointerEnter() {
    if (!cardRef.current || !tiltEnabled()) return;
    cardRef.current.style.transition = TRACK_TRANSITION;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card || !tiltEnabled()) return;

    const bounds = card.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;
    const offsetX = pointerX / bounds.width - 0.5;
    const offsetY = pointerY / bounds.height - 0.5;

    card.style.transform = `rotateX(${(-offsetY * TILT_SWEEP_DEGREES).toFixed(2)}deg) rotateY(${(offsetX * TILT_SWEEP_DEGREES).toFixed(2)}deg)`;
    card.style.setProperty("--glare-x", `${pointerX}px`);
    card.style.setProperty("--glare-y", `${pointerY}px`);
    if (glareRef.current) glareRef.current.style.opacity = "1";
  }

  function handlePointerLeave() {
    const card = cardRef.current;
    if (!card) return;

    card.style.transition = RELEASE_TRANSITION;
    card.style.transform = "rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  }

  return (
    <div className={cn("relative perspective-distant", className)}>
      <div
        ref={cardRef}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative will-change-transform"
      >
        {children}
        <div
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 bg-[radial-gradient(420px_circle_at_var(--glare-x)_var(--glare-y),color-mix(in_srgb,var(--color-brand-500)_12%,transparent),transparent_60%)]"
        />
      </div>
    </div>
  );
}
