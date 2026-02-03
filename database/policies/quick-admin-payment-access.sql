-- Quick Apply Admin RLS Policies
-- Run this in your Supabase SQL Editor

-- Enable RLS and create admin access policy for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access to payments" ON payments;
CREATE POLICY "Admins full access to payments"
ON payments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

-- Verify the policy was created
SELECT 
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'payments';
