-- Allow users to create an active session if none exists
CREATE POLICY "Users can create active session if none exists" 
ON broetchen_sessions FOR INSERT 
WITH CHECK (
  status = 'active' AND
  NOT EXISTS (
    SELECT 1 FROM broetchen_sessions WHERE status = 'active'
  )
);
