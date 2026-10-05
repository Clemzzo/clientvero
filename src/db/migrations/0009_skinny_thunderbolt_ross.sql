ALTER TABLE "portal_accounts" DROP CONSTRAINT "portal_accounts_client_contact_id_client_contacts_id_fk";--> statement-breakpoint
ALTER TABLE "portal_accounts" DROP CONSTRAINT "portal_accounts_client_contact_id_unique";--> statement-breakpoint
ALTER TABLE "portal_accounts" DROP COLUMN "client_contact_id";--> statement-breakpoint
CREATE UNIQUE INDEX "portal_accounts_client_uidx" ON "portal_accounts" USING btree ("client_id");--> statement-breakpoint
DROP TABLE "client_contacts";--> statement-breakpoint
DELETE FROM "activity_logs" WHERE "action" IN ('CONTACT_ADDED', 'CONTACT_UPDATED', 'CONTACT_REMOVED');
