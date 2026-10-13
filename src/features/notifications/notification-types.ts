import type { AccentTone } from "@/types/accent-tone";

export const notificationTypes = {
  proposalAccepted: "PROPOSAL_ACCEPTED",
  proposalDeclined: "PROPOSAL_DECLINED",
  invoiceViewed: "INVOICE_VIEWED",
  paymentReceived: "PAYMENT_RECEIVED",
  messageReceived: "MESSAGE_RECEIVED",
} as const;

export type EmittedNotificationType = (typeof notificationTypes)[keyof typeof notificationTypes];

export const notificationTones: Record<EmittedNotificationType, AccentTone> = {
  PROPOSAL_ACCEPTED: "mint",
  PROPOSAL_DECLINED: "coral",
  INVOICE_VIEWED: "ocean",
  PAYMENT_RECEIVED: "mint",
  MESSAGE_RECEIVED: "brand",
};

const resourcePaths: Record<EmittedNotificationType, string> = {
  PROPOSAL_ACCEPTED: "/dashboard/proposals",
  PROPOSAL_DECLINED: "/dashboard/proposals",
  INVOICE_VIEWED: "/dashboard/invoices",
  PAYMENT_RECEIVED: "/dashboard/invoices",
  MESSAGE_RECEIVED: "/dashboard/messages",
};

export function isEmittedNotificationType(type: string): type is EmittedNotificationType {
  return type in resourcePaths;
}

export function notificationHref(type: string, resourceId: string | null): string {
  if (!resourceId || !isEmittedNotificationType(type)) return "/dashboard/notifications";
  return `${resourcePaths[type]}/${resourceId}`;
}
