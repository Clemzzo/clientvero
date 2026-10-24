import type { Metadata } from "next";

import { BusinessDetails } from "@/components/settings/BusinessDetails";
import { BusinessForm } from "@/components/settings/BusinessForm";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { countryOptions, currencyOptions } from "@/features/organizations/business-profile";
import { logoSrc } from "@/features/settings/image-urls";
import { portalUrl } from "@/lib/utils/public-url";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions, requirePermission } from "@/server/authorization/permissions";

export const metadata: Metadata = {
  title: "Business settings",
};

export default async function BusinessSettingsPage() {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.organizationRead);

  const { organization } = ctx;
  const logo = logoSrc(organization.slug, organization.logoKey);
  const portal = portalUrl(organization.slug);

  return (
    <div className="space-y-6">
      <SettingsHeader title="Business" description="Your brand and the details clients see on everything you send." />
      {hasPermission(ctx.membership.role, permissions.organizationUpdate) ? (
        <BusinessForm
          organization={organization}
          logoSrc={logo}
          portalUrl={portal}
          countries={countryOptions()}
          currencies={currencyOptions()}
        />
      ) : (
        <BusinessDetails organization={organization} logoSrc={logo} portalUrl={portal} />
      )}
    </div>
  );
}
