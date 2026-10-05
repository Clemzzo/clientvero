import type { Metadata } from "next";
import Link from "next/link";
import { Link2Off } from "lucide-react";

import { PortalAuthCard } from "@/components/portal/PortalAuthCard";
import { PortalSetupForm } from "@/components/portal/PortalSetupForm";
import { IconTile } from "@/components/shared/IconTile";
import { getSetupLink } from "@/server/services/portal-auth.service";
import { portalTokenSchema } from "@/validators/portal";

import { loadPortalOrganization } from "../../../load-portal-organization";

export const metadata: Metadata = {
  title: "Set your password",
};

export default async function PortalSetupPage(props: PageProps<"/portal/[slug]/setup/[token]">) {
  const params = await props.params;
  const organization = await loadPortalOrganization(params.slug);
  const token = portalTokenSchema.safeParse(params.token);
  const link = token.success ? await getSetupLink(organization.slug, token.data) : null;

  if (!token.success || !link) {
    return (
      <PortalAuthCard
        organizationName={organization.name}
        title="This link has expired"
        description={`Portal links work once and expire after 7 days. Ask ${organization.name} to send you a new one.`}
      >
        <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-4 text-[13.5px] text-ink-700">
          <IconTile icon={<Link2Off />} tone="coral" />
          Already set a password? Use the sign-in page instead.
        </div>
        <Link
          href={`/portal/${organization.slug}/sign-in`}
          className="mt-4 inline-flex text-[14px] font-semibold text-brand-700 hover:underline"
        >
          Go to sign in
        </Link>
      </PortalAuthCard>
    );
  }

  return (
    <PortalAuthCard
      organizationName={organization.name}
      title={link.isReset ? "Choose a new password" : `Welcome, ${link.clientName}`}
      description={
        link.isReset
          ? "Set a new password for your client portal."
          : `${organization.name} has invited you to their client portal. Choose a password to get started.`
      }
    >
      <PortalSetupForm slug={organization.slug} token={token.data} email={link.email} isReset={link.isReset} />
    </PortalAuthCard>
  );
}
