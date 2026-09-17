import Image from "next/image";
import {
  Activity,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Paperclip,
  ReceiptText,
  Wallet,
} from "lucide-react";

import logoMark from "@/assets/images/clientverologo.png";
import {
  CheckList,
  FeatureCards,
  ProductSection,
  type FeatureCard,
} from "@/components/marketing/product/product-section";

const recordTabs: FeatureCard[] = [
  { title: "Overview", detail: "Company, website, address, and your private notes.", icon: LayoutDashboard },
  { title: "Projects", detail: "Every project for this client and how far along it is.", icon: FolderKanban },
  { title: "Proposals", detail: "What you've sent and whether it was accepted.", icon: FileText },
  { title: "Invoices", detail: "Sent, paid, and overdue invoices in one list.", icon: ReceiptText },
  { title: "Payments", detail: "Every payment recorded against their invoices.", icon: Wallet },
  { title: "Files", detail: "Documents and deliverables shared with them.", icon: Paperclip },
  { title: "Messages", detail: "Your conversation, next to the work it's about.", icon: MessageSquare },
  { title: "Activity", detail: "A timeline of everything that's happened.", icon: Activity },
];

export function ClientRecord() {
  return (
    <ProductSection
      id="record"
      title="Everything about a client, on one page."
      intro="Open a client and see the whole relationship at a glance, from the first proposal to the latest payment."
      className="bg-ink-50"
    >
      <FeatureCards items={recordTabs} className="lg:grid-cols-4" />
    </ProductSection>
  );
}

const contacts = [
  "Add several contacts to one client",
  "Mark one contact as primary",
  "Keep each contact's phone and role",
];

const portalAccess = [
  "Invite a client when you're ready",
  "They see only their own projects, invoices, and files",
  "Your internal notes stay private",
];

export function ClientAccess() {
  return (
    <ProductSection
      id="access"
      title="The right people, the right access."
      intro="Work with everyone on the client's side, and give them a private portal when it's time to share progress."
      dark
    >
      <div className="relative isolate">
        <div className="grid gap-10 sm:grid-cols-2 lg:max-w-4xl">
          <CheckList title="Contacts" items={contacts} />
          <CheckList title="Client portal" items={portalAccess} />
        </div>
        <Image
          src={logoMark}
          alt=""
          aria-hidden
          sizes="(min-width: 1024px) 240px, 140px"
          className="pointer-events-none absolute -bottom-6 right-0 -z-10 h-auto w-35 select-none opacity-10 lg:-bottom-10 lg:w-60"
        />
      </div>
    </ProductSection>
  );
}
