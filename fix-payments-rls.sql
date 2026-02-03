-- Fix RLS policy for payments to allow admin/public read access
-- This will allow the admin dashboard to view payments

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "payments_policy" ON payments;

-- Create new policies for payments table

-- 1. Allow authenticated users to view all payments (for admin dashboard)
CREATE POLICY "Allow authenticated users to view payments"
ON payments
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow public/anon to view payments (for public dashboards if needed)
CREATE POLICY "Allow public read access to payments"
ON payments
FOR SELECT
TO anon
USING (true);

-- 3. Allow service role full access (for backend operations)
CREATE POLICY "Service role has full access"
ON payments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Allow authenticated users to insert their own payments
CREATE POLICY "Users can insert their own payments"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = customer_id 
  OR 
  auth.uid() IN (
    SELECT user_id FROM service_providers WHERE id = provider_id
  )
);

-- 5. Allow authenticated users to update their related payments
CREATE POLICY "Users can update their related payments"
ON payments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = customer_id 
  OR 
  auth.uid() IN (
    SELECT user_id FROM service_providers WHERE id = provider_id
  )
  OR
  auth.uid() IN (
    SELECT id FROM user_profiles WHERE user_type IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  auth.uid() = customer_id 
  OR 
  auth.uid() IN (
    SELECT user_id FROM service_providers WHERE id = provider_id
  )
  OR
  auth.uid() IN (
    SELECT id FROM user_profiles WHERE user_type IN ('admin', 'super_admin')
  )
);

-- Verify policies were created
SELECT 
  '✅ RLS Policies Updated' as status,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'payments'
ORDER BY policyname;

-- Test query as anon
SET ROLE anon;
SELECT 
  '✅ Test Query (anon role)' as test,
  COUNT(*) as payments_visible,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ SUCCESS! Payments are now visible'
    ELSE '❌ FAILED - Still no access'
  END as result
FROM payments;
RESET ROLE;

-- Final message
SELECT 
  '🎉 RLS Policy Updated!' as message,
  'Refresh your admin dashboard to see payments' as action,
  'https://road-aid-system-tsyx.vercel.app/admin/payments' as url;
