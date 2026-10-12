import "server-only";

import { sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs, invoices } from "@/db/schema";
import {
  activityActorTypes,
  activityResources,
  type ActivityAction,
  type ActivityActorType,
} from "@/features/activity/activity-actions";

type InvoiceActor = {
  organizationId: string;
  actorUserId: string | null;
  actorType?: ActivityActorType;
};

type InvoiceActivityOptions = {
  when?: SQL;
  metadata?: Record<string, unknown>;
};

export function invoiceActivity(actor: InvoiceActor, invoiceId: string, action: ActivityAction, options: InvoiceActivityOptions = {}) {
  const condition = options.when ? sql`and ${options.when}` : sql``;

  return db.execute(sql`
    insert into ${activityLogs} (organization_id, actor_user_id, actor_type, action, resource_type, resource_id, metadata)
    select ${actor.organizationId}, ${actor.actorUserId}, ${actor.actorType ?? activityActorTypes.user}, ${action},
      ${activityResources.invoice}, ${invoices.id},
      jsonb_build_object('name', ${invoices.invoiceNumber}) || ${JSON.stringify(options.metadata ?? {})}::jsonb
    from ${invoices}
    where ${invoices.id} = ${invoiceId} and ${invoices.organizationId} = ${actor.organizationId} ${condition}
  `);
}
