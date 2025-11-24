-- Add semester field to expert_chat_sessions table
ALTER TABLE expert_chat_sessions 
ADD COLUMN semester text CHECK (semester IN ('1st Sem', '2nd Sem', 'Summer'));

-- Set a default value for existing records
UPDATE expert_chat_sessions 
SET semester = '1st Sem' 
WHERE semester IS NULL;

-- Add index for better query performance
CREATE INDEX idx_expert_chat_sessions_semester ON expert_chat_sessions(semester);