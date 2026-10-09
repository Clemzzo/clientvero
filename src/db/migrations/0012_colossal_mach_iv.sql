DELETE FROM "files" WHERE "deleted_at" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "deleted_at";
