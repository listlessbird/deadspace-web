ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_post_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "bookmarks" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;