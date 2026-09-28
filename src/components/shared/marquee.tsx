import type { ReactNode } from "react";

export function Marquee({
  children,
  label,
  duration,
}: {
  children: ReactNode;
  label: string;
  duration: number;
}) {
  return (
    <div className="marquee py-1">
      <div className="marquee-track flex w-max" style={{ animationDuration: `${duration}s` }}>
        <ul aria-label={label} className="flex gap-4 pr-4">
          {children}
        </ul>
        <ul aria-hidden inert className="flex gap-4 pr-4 motion-reduce:hidden">
          {children}
        </ul>
      </div>
    </div>
  );
}
