import { Faq } from "@/components/marketing/Faq";
import { Features } from "@/components/marketing/Features";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PortalShowcase } from "@/components/marketing/PortalShowcase";
import { Problem } from "@/components/marketing/Problem";

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
