
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
