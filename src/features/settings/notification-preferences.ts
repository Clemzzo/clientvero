import { notificationTypes, type EmittedNotificationType } from "@/features/notifications/notification-types";

export type NotificationPreferences = Record<EmittedNotificationType, boolean>;

type PreferenceRow = {
  type: EmittedNotificationType;
  title: string;
  description: string;
};

type PreferenceGroup = {
  title: string;
  rows: PreferenceRow[];
};

export const notificationPreferenceGroups: PreferenceGroup[] = [
  {
    title: "Proposals",
    rows: [
      {
        type: notificationTypes.proposalAccepted,
        title: "Proposal accepted",
        description: "A client signs off on a proposal you sent.",
      },
      {
        type: notificationTypes.proposalDeclined,
        title: "Proposal declined",
        description: "A client turns down a proposal.",
      },
    ],
  },
  {
    title: "Invoices & payments",
    rows: [
      {
        type: notificationTypes.invoiceViewed,
        title: "Invoice viewed",
        description: "A client opens an invoice for the first time.",
      },
      {
        type: notificationTypes.paymentReceived,
        title: "Payment recorded",
        description: "A teammate records a payment against an invoice.",
      },
    ],
  },
  {
    title: "Messages",
    rows: [
      {
        type: notificationTypes.messageReceived,
        title: "New client message",
        description: "A client sends a message from the portal.",
      },
    ],
  },
];

export const preferenceTypes = Object.values(notificationTypes);

export function resolvePreferences(stored: Record<string, boolean> | null | undefined): NotificationPreferences {
  return Object.fromEntries(preferenceTypes.map((type) => [type, stored?.[type] !== false])) as NotificationPreferences;
}
