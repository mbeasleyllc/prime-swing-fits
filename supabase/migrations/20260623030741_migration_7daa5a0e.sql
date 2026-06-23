-- Create email_logs table to track sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text,
  sent_at timestamp DEFAULT now(),
  status text DEFAULT 'sent',
  error_message text,
  session_id uuid REFERENCES fitting_sessions(id) ON DELETE SET NULL
);

-- Add RLS policies for email_logs (admin only read access)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_email_logs" ON email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_session_id ON email_logs(session_id);