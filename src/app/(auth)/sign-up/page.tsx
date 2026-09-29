import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { formatPlanPrice, getPlan, type Plan } from "@/features/subscriptions/plans";
import { auth } from "@/lib/auth/server";
import { planIdSchema } from "@/validators/auth";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Start free with ClientVero. No credit card required.",
};

function planDescription(plan: Plan) {
  if (plan.priceCents === 0) {
    return `${plan.name} plan: up to ${plan.limits.clients} clients. No card required.`;
  }

  return `${plan.name} plan: ${formatPlanPrice(plan)} a month.`;
}

export default async function SignUpPage(props: PageProps<"/sign-up">) {
  const { data: session } = await auth.getSession();

  if (session?.user) {
    redirect("/app");
  }

  const { plan: requestedPlan } = await props.searchParams;
  const planId = planIdSchema.parse(requestedPlan);

  return (
    <AuthShell
      title="Create your account"
      description={planDescription(getPlan(planId ?? "free"))}
      aside={<AuthBrandPanel />}
    >
      <SignUpForm plan={planId} />
    </AuthShell>
  );
}
