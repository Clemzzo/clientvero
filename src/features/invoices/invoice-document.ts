import type { InvoiceStatus } from "@/db/schema";

export type InvoiceDocumentLine = {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
};

export type InvoiceParty = {
  name: string;
  lines: string[];
};

export type InvoiceDocumentData = {
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceDocumentLine[];
  subtotal: string;
  discount: string;
  total: string;
  amountPaid: string;
  amountDue: string;
  notes: string | null;
  paymentInstructions: string | null;
  business: InvoiceParty;
  client: InvoiceParty;
};

type BusinessFields = { name: string; address: string | null; website: string | null };
type ClientFields = { name: string; company: string | null; email: string | null; address: string | null; country: string | null };

function present(values: (string | null)[]) {
  return values.filter((value): value is string => Boolean(value?.trim()));
}

export function businessParty(business: BusinessFields): InvoiceParty {
  return { name: business.name, lines: present([business.address, business.website]) };
}

export function clientParty(client: ClientFields): InvoiceParty {
  const company = client.company && client.company !== client.name ? client.company : null;
  return { name: client.name, lines: present([company, client.email, client.address, client.country]) };
}
