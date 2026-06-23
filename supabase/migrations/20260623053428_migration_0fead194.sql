-- Create support_requests table
CREATE TABLE IF NOT EXISTS support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  order_number text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'spam')),
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES users(id),
  admin_notes text
);

-- Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form submissions)
CREATE POLICY "support_insert_public"
ON support_requests FOR INSERT
TO public
WITH CHECK (true);

-- Allow admins to read all support requests
CREATE POLICY "support_select_admin"
ON support_requests FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Allow admins to update support requests
CREATE POLICY "support_update_admin"
ON support_requests FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Allow admins to delete support requests
CREATE POLICY "support_delete_admin"
ON support_requests FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_support_requests_status ON support_requests(status);
CREATE INDEX idx_support_requests_created_at ON support_requests(created_at DESC);
CREATE INDEX idx_support_requests_email ON support_requests(email);

COMMENT ON TABLE support_requests IS 'Stores customer support form submissions';