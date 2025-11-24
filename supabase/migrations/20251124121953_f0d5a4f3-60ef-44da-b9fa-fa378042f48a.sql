-- Fix security warnings by setting search_path for the functions
CREATE OR REPLACE FUNCTION get_semester_from_date(check_date timestamp with time zone)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
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

CREATE OR REPLACE FUNCTION set_semester_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.semester IS NULL THEN
    NEW.semester := get_semester_from_date(NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$;