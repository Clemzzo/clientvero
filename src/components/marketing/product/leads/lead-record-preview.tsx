import Image from "next/image";
import { Building2, CircleDot, PhoneCall, Plus, UserCheck } from "lucide-react";

import oliviaAvatar from "@/assets/images/sarah.png";
import { StatusPill } from "@/components/marketing/feature-previews";

const details = [
  { label: "Source", value: "Referral" },
  { label: "Service", value: "Website redesign" },
  { label: "Estimated value", value: "$3,200 USD" },
  { label: "Last contacted", value: "2 days ago" },
];

const timeline = [
  { icon: Plus, text: "Lead created from a referral", time: "Mon" },
  { icon: PhoneCall, text: "Discovery call logged", time: "Tue" },
  { icon: CircleDot, text: "Status changed to Qualified", time: "Wed" },
];

export function LeadRecordPreview() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_40px_90px_-40px_rgba(7,11,24,0.35)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-ink-200 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src={oliviaAvatar}
            alt=""
            loading="eager"
            sizes="40px"
            className="size-10 shrink-0 rounded-full object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-[16px] font-bold text-ink-900">Olivia Park</span>
            <span className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-500">
              <Building2 className="size-3.5 shrink-0" />
              Park &amp; Co.
            </span>
          </span>
        </div>
        <StatusPill tone="amber">Qualified</StatusPill>
      </div>

      <div className="grid gap-5 bg-ink-50 p-5">
        <dl className="grid grid-cols-2 gap-3">
          {details.map((detail) => (
            <div key={detail.label} className="rounded-lg border border-ink-200 bg-white px-3 py-2.5">
              <dt className="text-[10.5px] text-ink-400">{detail.label}</dt>
              <dd className="mt-0.5 truncate text-[12.5px] font-semibold text-ink-900">{detail.value}</dd>
            </div>
          ))}
        </dl>

        <div className="rounded-lg border border-ink-200 bg-white px-3 py-2.5">
          <p className="text-[10.5px] text-ink-400">Notes</p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-700">
            Wants a new site before the spring launch. Decision by end of month.
          </p>
        </div>

        <div>
          <p className="text-[11.5px] font-semibold text-ink-900">Activity</p>
          <ul className="mt-2.5 space-y-2.5">
            {timeline.map((entry) => (
              <li key={entry.text} className="flex items-center gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white text-brand-600 ring-1 ring-ink-200">
                  <entry.icon className="size-3" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-700">{entry.text}</span>
                <span className="shrink-0 text-[10.5px] text-ink-400">{entry.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <span className="flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 text-[13px] font-semibold text-white">
          <UserCheck className="size-4" />
          Convert to client
        </span>
      </div>
    </div>
  );
}
