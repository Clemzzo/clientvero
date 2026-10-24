import { Lock } from "lucide-react";

import { CopyField } from "@/components/shared/CopyField";
import { Detail, DetailList, WebsiteLink } from "@/components/shared/DetailList";
import { WorkspaceLogo } from "@/components/shared/WorkspaceLogo";
import { Card, CardHeader } from "@/components/ui/card";
import type { Organization } from "@/db/schema";
import { countryName } from "@/features/organizations/business-profile";

type BusinessDetailsProps = {
  organization: Pick<Organization, "name" | "businessType" | "country" | "currency" | "website" | "address">;
  logoSrc: string | null;
  portalUrl: string;
};

export function BusinessDetails({ organization, logoSrc, portalUrl }: BusinessDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 text-[14px] text-ink-700">
        <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-400" />
        <p>Only the workspace owner and admins can change these details.</p>
      </div>

      <Card>
        <CardHeader
          title={organization.name}
          description={organization.businessType ?? "Workspace"}
          action={<WorkspaceLogo name={organization.name} src={logoSrc} className="size-11 rounded-xl" />}
        />
        <DetailList>
          <Detail label="Website">
            <WebsiteLink url={organization.website} />
          </Detail>
          <Detail label="Address">{organization.address && <span className="whitespace-pre-line">{organization.address}</span>}</Detail>
          <Detail label="Country">{countryName(organization.country)}</Detail>
          <Detail label="Currency">{organization.currency}</Detail>
        </DetailList>
      </Card>

      <Card className="p-5 sm:p-6">
        <h3 className="text-[15px] font-semibold text-ink-900">Client portal</h3>
        <p className="mt-1 text-[13px] text-ink-500">Share this address with clients who have portal access.</p>
        <div className="mt-4">
          <CopyField label="Client portal address" value={portalUrl} />
        </div>
      </Card>
    </div>
  );
}
