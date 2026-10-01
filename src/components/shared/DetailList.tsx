import type { ReactNode } from "react";

export const detailLinkStyles = "font-medium text-brand-700 hover:underline";

export function DetailList({ children }: { children: ReactNode }) {
  return <dl className="mt-2 divide-y divide-ink-200 px-5 pb-2 sm:px-6">{children}</dl>;
}

export function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[14px] text-ink-500">{label}</dt>
      <dd className="min-w-0 break-words text-[14px] text-ink-900">{children || <span className="text-ink-500">—</span>}</dd>
    </div>
  );
}

export function EmailLink({ email }: { email: string | null }) {
  return email ? (
    <a href={`mailto:${email}`} className={detailLinkStyles}>
      {email}
    </a>
  ) : null;
}

export function PhoneLink({ phone }: { phone: string | null }) {
  return phone ? (
    <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={detailLinkStyles}>
      {phone}
    </a>
  ) : null;
}

export function WebsiteLink({ url }: { url: string | null }) {
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className={detailLinkStyles}>
      {url.replace(/^https?:\/\//, "")}
    </a>
  ) : null;
}
