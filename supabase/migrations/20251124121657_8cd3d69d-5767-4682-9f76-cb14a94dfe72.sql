-- Update the semester constraint to only allow 1st Sem and 2nd Sem
ALTER TABLE expert_chat_sessions 
DROP CONSTRAINT IF EXISTS expert_chat_sessions_semester_check;

ALTER TABLE expert_chat_sessions 
ADD CONSTRAINT expert_chat_sessions_semester_check 
CHECK (semester IN ('1st Sem', '2nd Sem'));