import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="grid gap-5 border-b border-ink-200 px-5 py-6 last:border-b-0 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
        <p className="mt-1 text-[13px] leading-snug text-ink-500">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
