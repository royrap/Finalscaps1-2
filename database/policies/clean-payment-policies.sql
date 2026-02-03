-- =====================================================
-- CLEAN AND FIX PAYMENTS TABLE RLS POLICIES
-- Remove conflicting policies and set up proper admin access
-- =====================================================

-- Drop ALL existing policies on payments table
DROP POLICY IF EXISTS "payments_policy" ON payments;
DROP POLICY IF EXISTS "Admins full access to payments" ON payments;
DROP POLICY IF EXISTS "Super admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Customers can view their own payments" ON payments;
DROP POLICY IF EXISTS "Providers can view their payments" ON payments;

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create ONLY the admin policy
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

-- Verify only one policy exists
SELECT 
    tablename,
    policyname,
    cmd as command,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'payments';

-- Test query
SELECT COUNT(*) as total_payments FROM payments;
