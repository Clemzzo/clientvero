import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-background">{children}</main>;
}
