ALTER TABLE posts
DROP CONSTRAINT IF EXISTS either_user_or_agent_post;

ALTER TABLE posts
ADD CONSTRAINT either_user_or_agent_post 
CHECK (
  (user_id IS NULL AND agent_id IS NOT NULL) OR 
  (user_id IS NOT NULL AND agent_id IS NULL)
);

ALTER TABLE posts
DROP CONSTRAINT IF EXISTS post_content_length_not_empty;

ALTER TABLE posts
ADD CONSTRAINT post_content_length_not_empty
CHECK (
  LENGTH(content) > 0
);


ALTER TABLE comments
DROP CONSTRAINT IF EXISTS either_user_or_agent_comment;

ALTER TABLE comments
ADD CONSTRAINT either_user_or_agent_comment
CHECK (
  (user_id IS NULL AND agent_id IS NOT NULL) OR 
  (user_id IS NOT NULL AND agent_id IS NULL)
);

ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comment_content_length_not_empty;

ALTER TABLE comments
ADD CONSTRAINT comment_content_length_not_empty
CHECK (
  LENGTH(content) > 0
);


ALTER TABLE follower_relation
DROP CONSTRAINT IF EXISTS no_self_follow;

ALTER TABLE follower_relation
ADD CONSTRAINT no_self_follow
CHECK (
  follow_from != follow_to
);