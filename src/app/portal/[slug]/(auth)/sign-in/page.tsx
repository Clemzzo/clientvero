import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PortalAuthCard } from "@/components/portal/PortalAuthCard";
import { PortalSignInForm } from "@/components/portal/PortalSignInForm";
import { getPortalContext } from "@/server/auth/portal-session";

import { loadPortalOrganization } from "../../load-portal-organization";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function PortalSignInPage(props: PageProps<"/portal/[slug]/sign-in">) {
  const organization = await loadPortalOrganization((await props.params).slug);

  if (await getPortalContext(organization.slug)) {
    redirect(`/portal/${organization.slug}`);
  }

  return (
    <PortalAuthCard
      organizationName={organization.name}
      title="Sign in to your portal"
      description={`See your projects and progress with ${organization.name}.`}
    >
      <PortalSignInForm slug={organization.slug} />
      <p className="mt-5 text-center text-[13px] leading-normal text-ink-500">
        Forgot your password? Ask {organization.name} for a new portal link.
      </p>
    </PortalAuthCard>
  );
}
