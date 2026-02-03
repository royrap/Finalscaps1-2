-- Check if payments exist in the database
SELECT 
  'Total Payments in Database' as check_name,
  COUNT(*) as count
FROM payments;

-- Check recent payments
SELECT 
  'Recent Payments' as info,
  id,
  transaction_id,
  amount,
  status,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 5;

-- Check RLS policies on payments table
SELECT 
  'RLS Policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'payments';

-- Check if RLS is enabled
SELECT 
  'RLS Status' as info,
  relname as table_name,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
FROM pg_class
WHERE relname = 'payments';

-- Try to select with anon role (this simulates what the frontend sees)
SET ROLE anon;
SELECT 
  'Payments visible to anon role' as info,
  COUNT(*) as visible_count
FROM payments;
RESET ROLE;

-- Recommendation
SELECT 
  '💡 SOLUTION' as tip,
  'If count is 0 for anon role, you need to update RLS policy' as recommendation,
  'Run the fix-payments-rls.sql script to allow public read access' as action;
