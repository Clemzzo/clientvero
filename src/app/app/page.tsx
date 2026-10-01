import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/server/actions/auth";
import { getCurrentAccount } from "@/server/auth/current-user";

export const metadata: Metadata = {
  title: "Dashboard",
};

function countryName(code: string | null) {
  if (!code) return "Not set";
  return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
}

export default async function AppHomePage() {
  const membership = (await getCurrentAccount())?.membership;

  if (!membership) {
    redirect("/onboarding");
  }

  const { organization } = membership;

  const details = [
    { label: "Business type", value: organization.businessType ?? "Not set" },
    { label: "Country", value: countryName(organization.country) },
    { label: "Currency", value: organization.currency },
  ];

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-[0_16px_40px_-28px_rgba(7,11,24,0.25)] sm:p-10">
        <Logo href={null} />

        <h1 className="mt-8 font-display text-[clamp(26px,2.4vw,32px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900">
          Welcome to {organization.name}
        </h1>
        <p className="mt-2 text-[15px] leading-normal text-ink-500">
          Your workspace is ready. Your dashboard is on its way.
        </p>

        <dl className="mt-8 divide-y divide-ink-200 rounded-xl border border-ink-200">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-center justify-between gap-4 px-4 py-3 text-[14px]">
              <dt className="text-ink-500">{detail.label}</dt>
              <dd className="font-medium text-ink-900">{detail.value}</dd>
            </div>
          ))}
        </dl>

        <form action={signOutAction} className="mt-8">
          <Button type="submit" variant="outline" className="h-11 w-full rounded-md text-[15px] font-semibold">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
