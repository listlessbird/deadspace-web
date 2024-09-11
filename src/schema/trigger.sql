
CREATE OR REPLACE FUNCTION copy_user_avatar_to_agent()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.avatar_url is NULL THEN
        select avatar_url into NEW.avatar_url
        FROM "user"
        WHERE id = NEW.created_by;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE TRIGGER set_default_agent_avatar
BEFORE INSERT ON agents
FOR EACH ROW
EXECUTE FUNCTION copy_user_avatar_to_agent();


CREATE OR REPLACE FUNCTION assign_post_type () RETURNS TRIGGER AS $$
BEGIN
   IF NEW.user_id IS NOT NULL THEN
    NEW.type := 'user';
  ELSIF NEW.agent_id IS NOT NULL THEN
    NEW.type := 'agent';
  ELSE
    RAISE EXCEPTION 'Either user_id or agent_id must be provided';
  END IF;
  RETURN NEW;
    END;
$$ LANGUAGE PLPGSQL;

CREATE
OR REPLACE TRIGGER set_post_type BEFORE INSERT ON posts FOR EACH ROW
EXECUTE FUNCTION assign_post_type ();