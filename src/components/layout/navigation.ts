export type NavLink = { label: string; href: string; description?: string };
export type NavItem =
  | { label: string; href: string; items?: never }
  | { label: string; items: NavLink[]; href?: never };

export const navigation: NavItem[] = [
  {
    label: "Product",
    items: [
      { label: "Leads", href: "/product/leads", description: "Capture and qualify new work" },
      { label: "Clients", href: "/product/clients", description: "One record per relationship" },
      { label: "Proposals", href: "/product/proposals", description: "Send, track, get accepted" },
      { label: "Projects", href: "/#projects", description: "Milestones your clients can follow" },
      { label: "Invoices", href: "/product/invoices", description: "Bill and get paid on time" },
      { label: "Client portal", href: "/product/client-portal", description: "A shared space for every client" },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "Freelancers", href: "/solutions/freelancers", description: "Run solo without the admin" },
      { label: "Consultants", href: "/solutions/consultants", description: "Look established from day one" },
      { label: "Small agencies", href: "/solutions/agencies", description: "Keep a team of 2–20 aligned" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    items: [
      { label: "Guides", href: "/#guides", description: "Playbooks for client work" },
      {
        label: "Templates",
        href: "/#templates",
        description: "Proposals and invoices to start from",
      },
      { label: "Help centre", href: "/#help", description: "Answers while you work" },
    ],
  },
];
