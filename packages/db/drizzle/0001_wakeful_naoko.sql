ALTER TABLE "chat_sessions" ADD COLUMN "title" text DEFAULT '' NOT NULL;

CREATE OR REPLACE FUNCTION touch_chat_session()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions SET updated_at = NOW() WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER touch_chat_session_trigger
  AFTER INSERT OR UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION touch_chat_session();