CREATE OR REPLACE FUNCTION handle_like_interaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_like RECORD;
  new_conversation RECORD;
BEGIN
  -- Safety: Set search path
  SET search_path = public;

  -- Check if the target user has already liked the source user
  SELECT * INTO existing_like
  FROM profile_interactions
  WHERE cohert1 = NEW.cohert2
    AND cohert2 = NEW.cohert1
    AND type = 'like'
  LIMIT 1;

  IF FOUND THEN
    -- Mutual like detected!

    -- Delete existing mutual likes
    DELETE FROM profile_interactions
    WHERE (cohert1 = NEW.cohert1 AND cohert2 = NEW.cohert2)
       OR (cohert1 = NEW.cohert2 AND cohert2 = NEW.cohert1);

    -- Create a new conversation
    INSERT INTO conversation_registry DEFAULT VALUES
    RETURNING conversation_id INTO new_conversation;

    -- Add both users to the conversation
    INSERT INTO conversation_members (conversation_id, user_id)
    VALUES
      (new_conversation.conversation_id, NEW.cohert1),
      (new_conversation.conversation_id, NEW.cohert2);

    -- Create connection based on mode dynamically
    INSERT INTO connections (cohert1, cohert2, type)
    VALUES (NEW.cohert1, NEW.cohert2, NEW.type);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_handle_like_interaction
AFTER INSERT ON profile_interactions
FOR EACH ROW
WHEN (NEW.type = 'like')
EXECUTE FUNCTION handle_like_interaction();