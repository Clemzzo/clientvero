CREATE TYPE "public"."notification_type" AS ENUM('PROPOSAL_ACCEPTED', 'PROPOSAL_DECLINED', 'INVOICE_SENT', 'INVOICE_VIEWED', 'INVOICE_OVERDUE', 'PAYMENT_RECEIVED', 'MESSAGE_RECEIVED', 'MILESTONE_COMPLETED', 'PROJECT_DEADLINE', 'GENERAL');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(240) NOT NULL,
	"message" text NOT NULL,
	"resource_type" varchar(80),
	"resource_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_feed_idx" ON "notifications" USING btree ("organization_id","user_id","created_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("organization_id","user_id") WHERE "notifications"."is_read" = false;