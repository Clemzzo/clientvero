DROP INDEX "messages_org_client_idx";--> statement-breakpoint
CREATE INDEX "messages_org_created_idx" ON "messages" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_org_client_idx" ON "messages" USING btree ("organization_id","client_id","created_at");