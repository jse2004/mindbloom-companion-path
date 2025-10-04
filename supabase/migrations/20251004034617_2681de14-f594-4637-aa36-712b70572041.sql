-- Add mental_issue_root column to expert_chat_sessions table
ALTER TABLE expert_chat_sessions 
ADD COLUMN mental_issue_root text;