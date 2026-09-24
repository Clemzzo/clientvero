import {
  BookOpen,
  Briefcase,
  FileSignature,
  FolderKanban,
  Inbox,
  PanelsTopLeft,
  Receipt,
  User,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavTone = "brand" | "sky" | "violet" | "amber" | "emerald" | "rose";

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  icon: LucideIcon;
  tone: NavTone;
};

export type NavGroup = {
  label: string;
  heading: string;
  cta?: { label: string; href: string };
  items: NavLink[];
  href?: never;
};

export type NavItem = { label: string; href: string; items?: never } | NavGroup;

export const navigation: NavItem[] = [
  {
    label: "Product",
    heading: "Product",
    cta: { label: "See pricing", href: "/pricing" },
    items: [
      {
        label: "Leads",
        href: "/product/leads",
        description: "Capture and qualify new work",
        icon: Inbox,
        tone: "sky",
      },
      {
        label: "Clients",
        href: "/product/clients",
        description: "One record per relationship",
        icon: Users,
        tone: "brand",
      },
      {
        label: "Proposals",
        href: "/product/proposals",
        description: "Send, track, get accepted",
        icon: FileSignature,
        tone: "amber",
      },
      {
        label: "Projects",
        href: "/#projects",
        description: "Milestones your clients can follow",
        icon: FolderKanban,
        tone: "violet",
      },
      {
        label: "Invoices",
        href: "/product/invoices",
        description: "Bill and get paid on time",
        icon: Receipt,
        tone: "emerald",
      },
      {
        label: "Client portal",
        href: "/product/client-portal",
        description: "A shared space for every client",
        icon: PanelsTopLeft,
        tone: "rose",
      },
    ],
  },
  {
    label: "Solutions",
    heading: "Built for",
    cta: { label: "Compare plans", href: "/pricing" },
    items: [
      {
        label: "Freelancers",
        href: "/solutions/freelancers",
        description: "Run solo without the admin",
        icon: User,
        tone: "sky",
      },
      {
        label: "Consultants",
        href: "/solutions/consultants",
        description: "Look established from day one",
        icon: Briefcase,
        tone: "amber",
      },
      {
        label: "Small agencies",
        href: "/solutions/agencies",
        description: "Keep a team of 2–20 aligned",
        icon: UsersRound,
        tone: "violet",
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    heading: "Resources",
    cta: { label: "Browse all guides", href: "/guides" },
    items: [
      {
        label: "Guides",
        href: "/guides",
        description: "Playbooks for client work",
        icon: BookOpen,
        tone: "emerald",
      },
    ],
  },
];
