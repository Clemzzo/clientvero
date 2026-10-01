import { Pencil, Plus, UserRound } from "lucide-react";

import { ContactDialog } from "@/components/clients/ContactDialog";
import { RemoveContactButton } from "@/components/clients/RemoveContactButton";
import { Avatar } from "@/components/shared/Avatar";
import { EmailLink, PhoneLink } from "@/components/shared/DetailList";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import type { ClientContact } from "@/db/schema";

type ContactsCardProps = {
  clientId: string;
  contacts: ClientContact[];
  canEdit: boolean;
};

export function ContactsCard({ clientId, contacts, canEdit }: ContactsCardProps) {
  const hasContacts = contacts.length > 0;

  return (
    <Card>
      <CardHeader
        title="Contacts"
        description="The people you work with at this client."
        action={canEdit && hasContacts && <AddContactDialog clientId={clientId} />}
      />

      {hasContacts ? (
        <ul className="mt-3 divide-y divide-ink-200 px-5 pb-2 sm:px-6">
          {contacts.map((contact) => (
            <ContactRow key={contact.id} clientId={clientId} contact={contact} canEdit={canEdit} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<UserRound />}
          title="No contacts yet"
          description="Add the people you deal with, and mark who's your main point of contact."
          action={canEdit && <AddContactDialog clientId={clientId} />}
        />
      )}
    </Card>
  );
}

function AddContactDialog({ clientId }: { clientId: string }) {
  return (
    <ContactDialog
      clientId={clientId}
      trigger={
        <Button variant="outline" className="h-9 rounded-lg">
          <Plus aria-hidden className="size-4" />
          Add contact
        </Button>
      }
    />
  );
}

type ContactRowProps = {
  clientId: string;
  contact: ClientContact;
  canEdit: boolean;
};

function ContactRow({ clientId, contact, canEdit }: ContactRowProps) {
  return (
    <li className="flex items-start gap-3 py-4">
      <Avatar name={contact.name} className="size-9" />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-ink-900">
          {contact.name}
          {contact.isPrimary && <StatusBadge label="Primary" tone="brand" />}
        </p>
        {contact.role && <p className="text-[13px] text-ink-500">{contact.role}</p>}
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          <EmailLink email={contact.email} />
          <PhoneLink phone={contact.phone} />
        </p>
      </div>

      {canEdit && (
        <div className="flex shrink-0 gap-1">
          <ContactDialog
            clientId={clientId}
            contact={contact}
            trigger={
              <button
                type="button"
                aria-label={`Edit ${contact.name}`}
                className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
              >
                <Pencil aria-hidden className="size-4" />
              </button>
            }
          />
          <RemoveContactButton clientId={clientId} contact={contact} />
        </div>
      )}
    </li>
  );
}
