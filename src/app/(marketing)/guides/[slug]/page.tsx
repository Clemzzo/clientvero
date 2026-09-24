import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinalCta } from "@/components/marketing/final-cta";
import { GuideArticle } from "@/components/marketing/resources/guides/GuideArticle";
import { GuideHeader } from "@/components/marketing/resources/guides/GuideHeader";
import { GuideNext } from "@/components/marketing/resources/guides/GuideNext";
import { getGuide, guides } from "@/components/marketing/resources/guides/guides";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);

  return guide ? { title: guide.title, description: guide.summary } : {};
}

export default async function GuidePage({
  params,
}: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) notFound();

  return (
    <>
      <GuideHeader guide={guide} />
      <GuideArticle guide={guide} />
      <GuideNext guide={guide} />
      <FinalCta title="Run this step in ClientVero." />
    </>
  );
}
