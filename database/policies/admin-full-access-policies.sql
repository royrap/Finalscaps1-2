-- =====================================================
-- RLS POLICY FOR PAYMENTS TABLE ONLY
-- Grants full access to super_admin and admin roles
-- =====================================================

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "payments_policy" ON payments;
DROP POLICY IF EXISTS "Admins full access to payments" ON payments;
DROP POLICY IF EXISTS "Super admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

-- Create single comprehensive policy for admin access
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

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Display created policy for verification
SELECT 
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN roles = '{authenticated}' THEN 'authenticated'
        ELSE roles::text
    END as roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'payments'
ORDER BY policyname;

-- Add comment to policy
COMMENT ON POLICY "Admins full access to payments" ON payments IS 
'Allows super_admin and admin roles to view, insert, update, and delete all payment records';

-- Test query (should return count if you have data)
SELECT 
    COUNT(*) as total_payments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
FROM payments;
