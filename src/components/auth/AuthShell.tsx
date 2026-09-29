import type { ReactNode } from "react";

import { Logo } from "@/components/layout/logo";

type AuthShellProps = {
  title: string;
  description: string;
  aside: ReactNode;
  children: ReactNode;
};

export function AuthShell({ title, description, aside, children }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)]">
      <div className="flex flex-col px-4 py-6 sm:px-8 lg:px-16 lg:py-10">
        <Logo />

        <div className="rise-in mx-auto flex w-full max-w-100 flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-[clamp(28px,2.4vw,34px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink-900">
            {title}
          </h1>
          <p className="mt-2 text-[15px] leading-normal text-ink-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">{aside}</aside>
    </div>
  );
}
