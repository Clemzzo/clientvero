import { Faq } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PortalShowcase } from "@/components/marketing/portal-showcase";
import { Problem } from "@/components/marketing/problem";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <Features />
      <PortalShowcase />
      <HowItWorks />
      <Faq />
      <FinalCta />
    </>
  );
}
