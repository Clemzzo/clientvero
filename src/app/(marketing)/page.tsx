import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { PortalShowcase } from "@/components/marketing/portal-showcase";
import { Problem } from "@/components/marketing/problem";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <Features />
      <PortalShowcase />
    </>
  );
}
