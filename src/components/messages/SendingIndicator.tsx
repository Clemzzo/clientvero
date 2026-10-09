"use client";

import { motion, useReducedMotion } from "framer-motion";

export function SendingIndicator() {
  const reduced = useReducedMotion() ?? false;

  return (
    <span className="flex shrink-0 items-center gap-1.5 text-[12.5px] text-ink-500">
      <span aria-hidden className="flex gap-0.5">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="size-1 rounded-full bg-ink-400"
            animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
            transition={reduced ? undefined : { duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
          />
        ))}
      </span>
      Sending…
    </span>
  );
}
