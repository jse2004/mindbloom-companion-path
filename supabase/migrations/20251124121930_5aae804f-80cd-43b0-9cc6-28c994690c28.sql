-- Create a function to determine semester based on date
CREATE OR REPLACE FUNCTION get_semester_from_date(check_date timestamp with time zone)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  month_num integer;
BEGIN
  month_num := EXTRACT(MONTH FROM check_date);
  
  -- 1st Sem: August (8) to December (12)
  IF month_num >= 8 AND month_num <= 12 THEN
    RETURN '1st Sem';
  -- 2nd Sem: January (1) to May (5)
  ELSIF month_num >= 1 AND month_num <= 5 THEN
    RETURN '2nd Sem';
  -- June and July default to 2nd Sem (summer break period)
  ELSE
    RETURN '2nd Sem';
  END IF;
END;
$$;

-- Create a trigger function to automatically set semester on insert
CREATE OR REPLACE FUNCTION set_semester_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.semester IS NULL THEN
    NEW.semester := get_semester_from_date(NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic semester assignment
DROP TRIGGER IF EXISTS trigger_set_semester ON expert_chat_sessions;
CREATE TRIGGER trigger_set_semester
  BEFORE INSERT ON expert_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_semester_on_insert();

-- Update all existing sessions with correct semester based on creation date
UPDATE expert_chat_sessions
SET semester = get_semester_from_date(created_at)
WHERE semester IS NULL OR semester NOT IN ('1st Sem', '2nd Sem');

-- Make semester field non-nullable with default
ALTER TABLE expert_chat_sessions 
ALTER COLUMN semester SET DEFAULT get_semester_from_date(now());

ALTER TABLE expert_chat_sessions 
ALTER COLUMN semester SET NOT NULL;