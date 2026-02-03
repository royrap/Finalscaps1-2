-- =====================================================
-- RLS POLICIES FOR PAYMENTS TABLE
-- Allows super_admin and admin to view all payments
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Super admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Super admins can insert payments" ON payments;
DROP POLICY IF EXISTS "Super admins can update payments" ON payments;
DROP POLICY IF EXISTS "Admins can update payments" ON payments;
DROP POLICY IF EXISTS "Customers can view their own payments" ON payments;
DROP POLICY IF EXISTS "Providers can view their payments" ON payments;

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT POLICIES (View Access)
-- =====================================================

-- Super Admin: Can view ALL payments
CREATE POLICY "Super admins can view all payments"
ON payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
);

-- Admin: Can view ALL payments
CREATE POLICY "Admins can view all payments"
ON payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Customers: Can view their own payments
CREATE POLICY "Customers can view their own payments"
ON payments
FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()
);

-- Providers: Can view payments they're involved in
CREATE POLICY "Providers can view their payments"
ON payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM service_providers
    WHERE service_providers.id = payments.provider_id
    AND service_providers.user_id = auth.uid()
  )
);

-- =====================================================
-- INSERT POLICIES
-- =====================================================

-- Super Admin: Can insert payments
CREATE POLICY "Super admins can insert payments"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

-- System can create payments (for automated processes)
CREATE POLICY "System can insert payments"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- UPDATE POLICIES
-- =====================================================

-- Super Admin: Can update all payments
CREATE POLICY "Super admins can update payments"
ON payments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
);

-- Admin: Can update payments
CREATE POLICY "Admins can update payments"
ON payments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- =====================================================
-- DELETE POLICIES (Optional - usually not needed)
-- =====================================================

-- Super Admin: Can delete payments (if needed)
CREATE POLICY "Super admins can delete payments"
ON payments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'payments'
ORDER BY policyname;

-- Test query (run as super_admin user)
-- SELECT COUNT(*) FROM payments;
