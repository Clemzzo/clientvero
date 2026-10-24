import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { logoSrc } from "@/features/settings/image-urls";
import { getPortalOrganization } from "@/server/services/portal-auth.service";
import { portalSlugSchema } from "@/validators/portal";

export const loadPortalOrganization = cache(async (slugValue: string) => {
  const slug = portalSlugSchema.safeParse(slugValue);
  const organization = slug.success ? await getPortalOrganization(slug.data) : null;

  if (!slug.success || !organization) {
    notFound();
  }

  return { slug: slug.data, name: organization.name, logoSrc: logoSrc(slug.data, organization.logoKey) };
});
