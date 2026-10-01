import { Detail, DetailList, EmailLink, PhoneLink, WebsiteLink } from "@/components/shared/DetailList";
import { Card, CardHeader } from "@/components/ui/card";
import type { Lead } from "@/db/schema";
import { leadValue } from "@/features/leads/lead-display";

export function LeadDetails({ lead }: { lead: Lead }) {
  return (
    <Card>
      <CardHeader title="Details" />
      <DetailList>
        <Detail label="Email"><EmailLink email={lead.email} /></Detail>
        <Detail label="Phone"><PhoneLink phone={lead.phone} /></Detail>
        <Detail label="Company">{lead.company}</Detail>
        <Detail label="Website"><WebsiteLink url={lead.website} /></Detail>
        <Detail label="Service">{lead.service}</Detail>
        <Detail label="Source">{lead.source}</Detail>
        <Detail label="Estimated value">{leadValue(lead)}</Detail>
        <Detail label="Notes">{lead.notes && <p className="whitespace-pre-wrap">{lead.notes}</p>}</Detail>
      </DetailList>
    </Card>
  );
}
