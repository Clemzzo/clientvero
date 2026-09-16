export type PlanId = "free" | "pro" | "agency";

export type PlanLimits = {
  clients: number | null;
  activeProjects: number | null;
  proposalsPerMonth: number | null;
  invoicesPerMonth: number | null;
};

export type Plan = {
  id: PlanId;
  name: string;
  audience: string;
  priceCents: number;
  currency: "USD";
  limits: PlanLimits;
  features: readonly string[];
  cta: { label: string; href: string };
};

const freeLimits: PlanLimits = {
  clients: 3,
  activeProjects: 3,
  proposalsPerMonth: 5,
  invoicesPerMonth: 5,
};

const unlimited: PlanLimits = {
  clients: null,
  activeProjects: null,
  proposalsPerMonth: null,
  invoicesPerMonth: null,
};

export const plans: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    audience: "For trying ClientVero with your first clients.",
    priceCents: 0,
    currency: "USD",
    limits: freeLimits,
    features: [
      `Up to ${freeLimits.clients} clients`,
      `Up to ${freeLimits.activeProjects} active projects`,
      `${freeLimits.proposalsPerMonth} proposals a month`,
      `${freeLimits.invoicesPerMonth} invoices a month`,
      "Basic client portal",
    ],
    cta: { label: "Start for free", href: "/sign-up" },
  },
  {
    id: "pro",
    name: "Pro",
    audience: "For freelancers and consultants.",
    priceCents: 500,
    currency: "USD",
    limits: unlimited,
    features: [
      "Unlimited clients and projects",
      "Unlimited proposals and invoices",
      "Full client portal",
      "AI drafts for proposals and client updates",
      "Payment tracking",
    ],
    cta: { label: "Start with Pro", href: "/sign-up?plan=pro" },
  },
  {
    id: "agency",
    name: "Agency",
    audience: "For teams of 2–20 people.",
    priceCents: 1000,
    currency: "USD",
    limits: unlimited,
    features: [
      "Everything in Pro",
      "Team members with roles and permissions",
      "One shared workspace for your team",
      "Higher AI usage limits",
    ],
    cta: { label: "Start with Agency", href: "/sign-up?plan=agency" },
  },
];

export function formatPlanPrice(plan: Plan) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(plan.priceCents / 100);
}
