import { Detail, DetailList, EmailLink, PhoneLink, WebsiteLink } from "@/components/shared/DetailList";
import { Card, CardHeader } from "@/components/ui/card";
import type { Client } from "@/db/schema";
import { countryName } from "@/features/organizations/business-profile";

export function ClientDetails({ client }: { client: Client }) {
  return (
    <Card>
      <CardHeader title="Details" />
      <DetailList>
        <Detail label="Email"><EmailLink email={client.email} /></Detail>
        <Detail label="Phone"><PhoneLink phone={client.phone} /></Detail>
        <Detail label="Company">{client.company}</Detail>
        <Detail label="Website"><WebsiteLink url={client.website} /></Detail>
        <Detail label="Address">{client.address && <p className="whitespace-pre-wrap">{client.address}</p>}</Detail>
        <Detail label="Country">{countryName(client.country)}</Detail>
        <Detail label="Notes">{client.notes && <p className="whitespace-pre-wrap">{client.notes}</p>}</Detail>
      </DetailList>
    </Card>
  );
}
