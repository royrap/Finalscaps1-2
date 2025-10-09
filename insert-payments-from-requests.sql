-- CREATE SAMPLE PAYMENTS FROM EXISTING SERVICE REQUESTS
-- Run this in Supabase SQL Editor

-- First, let's see what we have
SELECT 
  'service_requests' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN provider_id IS NOT NULL THEN 1 END) as with_provider,
  COUNT(CASE WHEN provider_id IS NULL THEN 1 END) as without_provider
FROM service_requests;

-- Check current payments
SELECT COUNT(*) as current_payments_count FROM payments;

-- Now insert sample payments based on existing service requests
INSERT INTO payments (
  request_id,
  customer_id, 
  provider_id,
  amount,
  platform_fee,
  provider_amount,
  payment_method,
  payment_gateway,
  transaction_id,
  status,
  processed_at,
  created_at,
  payment_verification_required,
  verification_status
)
SELECT 
  sr.id as request_id,
  sr.customer_id,
  COALESCE(sr.provider_id, sr.customer_id) as provider_id, -- fallback to customer if no provider
  COALESCE(sr.final_price, 1500) as amount,
  COALESCE(sr.final_price, 1500) * 0.10 as platform_fee,
  COALESCE(sr.final_price, 1500) * 0.90 as provider_amount,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 0 THEN 'card'
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 1 THEN 'gcash'
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 2 THEN 'paymaya'
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 3 THEN 'cash'
    ELSE 'bank_transfer'
  END as payment_method,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 0 THEN 'paymongo'
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 1 THEN 'gcash'
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 2 THEN 'paymaya'
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 3 THEN 'manual'
    ELSE 'bank'
  END as payment_gateway,
  'txn_' || substr(md5(random()::text || sr.id::text), 1, 20) as transaction_id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 4 = 0 THEN 'completed'
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 4 = 1 THEN 'pending'
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 4 = 2 THEN 'processing'
    ELSE 'completed'
  END as status,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 4 != 1 
    THEN now() - (random() * interval '7 days')
    ELSE NULL
  END as processed_at,
  sr.created_at,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 3 THEN true
    ELSE false
  END as payment_verification_required,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY sr.created_at) % 5 = 3 THEN 'pending'
    ELSE 'not_required'
  END as verification_status
FROM service_requests sr
WHERE sr.status IN ('completed', 'in_progress', 'accepted')
LIMIT 5
ON CONFLICT (id) DO NOTHING;

-- Verify the inserts
SELECT 
  p.id,
  p.transaction_id,
  p.amount,
  p.payment_method,
  p.status,
  c.first_name || ' ' || c.last_name as customer_name,
  sr.title as service_type
FROM payments p
LEFT JOIN user_profiles c ON p.customer_id = c.id
LEFT JOIN service_requests sr ON p.request_id = sr.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Final count
SELECT 
  'Summary' as info,
  COUNT(*) as total_payments,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  SUM(amount) as total_amount,
  SUM(platform_fee) as total_fees
FROM payments;
