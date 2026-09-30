import { LayoutDashboard, Lock, Mail, ShieldCheck } from "lucide-react";

import { CheckList, ProductSection } from "@/components/marketing/product/product-section";

const clientSees = ["Their projects and milestones", "Project progress", "Their invoices", "Shared files and messages"];

const staysPrivate = ["Internal notes", "Leads and pipeline", "Other clients", "Team conversations"];

const inviteSteps = [
  {
    title: "You invite them",
    detail: "Send a portal invite from the client's record when you're ready to share.",
    icon: Mail,
  },
  {
    title: "They confirm it's them",
    detail: "Their secure invite link verifies who they are before the portal opens.",
    icon: ShieldCheck,
  },
  {
    title: "They see only their own work",
    detail: "Their projects, invoices, files, and messages. Nothing from anyone else.",
    icon: LayoutDashboard,
  },
];

function InviteFlow() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="rounded-xl bg-white p-5 sm:p-6">
        <h3 className="text-[14px] font-semibold text-ink-900">How clients get in</h3>
        <ol className="mt-5">
          {inviteSteps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
              {index < inviteSteps.length - 1 && (
                <span aria-hidden className="absolute bottom-0 left-4.75 top-10 w-px bg-ink-200" />
              )}
              <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <step.icon aria-hidden className="size-4.5" />
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="block text-[11px] font-semibold text-brand-600">Step {index + 1}</span>
                <span className="block text-[14px] font-semibold text-ink-900">{step.title}</span>
                <span className="mt-0.5 block text-[13.5px] leading-normal text-ink-500">{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 border-t border-ink-200 pt-4 text-[12.5px] text-ink-500">
          Clients never pay for ClientVero or need a plan of their own.
        </p>
      </div>
    </div>
  );
}

export function PortalPrivacy() {
  return (
    <ProductSection
      id="privacy"
      title="Private by design."
      intro="Each client sees only what belongs to them. Your notes, your pipeline, and your other clients stay on your side."
      dark
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="grid gap-8 sm:grid-cols-2">
          <CheckList title="Your client sees" items={clientSees} />
          <CheckList
            title="Stays private to you"
            items={staysPrivate}
            icon={Lock}
            iconClassName="bg-white/10 text-brand-200"
          />
        </div>
        <InviteFlow />
      </div>
    </ProductSection>
  );
}
