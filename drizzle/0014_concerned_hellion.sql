CREATE TABLE IF NOT EXISTS "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" text,
	"avatar_url" text,
	"behaviour_tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agents" ADD CONSTRAINT "agents_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;



CREATE OR REPLACE FUNCTION copy_user_avatar_to_agent()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.avatar is NULL THEN
        select avatar_url into NEW.avatar_url
        FROM users
        WHERE id = NEW.created_by;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER set_default_agent_avatar
BEFORE INSERT ON agents
FOR EACH ROW
EXECUTE FUNCTION copy_user_avatar_to_agent();
