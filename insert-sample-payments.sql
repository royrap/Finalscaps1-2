-- Insert sample payment data
-- First, let's check what service requests we have with providers

WITH sample_requests AS (
  SELECT 
    id,
    customer_id,
    provider_id,
    COALESCE(final_price, 1500) as amount
  FROM service_requests
  WHERE provider_id IS NOT NULL
  LIMIT 5
)
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
  payment_verification_required,
  verification_status,
  payment_details
)
SELECT
  id as request_id,
  customer_id,
  provider_id,
  amount,
  ROUND(amount * 0.10, 2) as platform_fee,
  ROUND(amount * 0.90, 2) as provider_amount,
  CASE (ROW_NUMBER() OVER ())::int % 5
    WHEN 0 THEN 'card'
    WHEN 1 THEN 'gcash'
    WHEN 2 THEN 'paymaya'
    WHEN 3 THEN 'cash'
    ELSE 'bank_transfer'
  END as payment_method,
  CASE (ROW_NUMBER() OVER ())::int % 4
    WHEN 0 THEN 'paymongo'
    WHEN 1 THEN 'gcash'
    WHEN 2 THEN 'paymaya'
    ELSE NULL
  END as payment_gateway,
  'TXN' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || (ROW_NUMBER() OVER ())::text as transaction_id,
  CASE (ROW_NUMBER() OVER ())::int % 5
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'processing'
    ELSE 'completed'
  END as status,
  CASE 
    WHEN (ROW_NUMBER() OVER ())::int % 5 >= 2 THEN NOW()
    ELSE NULL
  END as processed_at,
  CASE (ROW_NUMBER() OVER ())::int % 5
    WHEN 3 THEN true
    ELSE false
  END as payment_verification_required,
  CASE (ROW_NUMBER() OVER ())::int % 5
    WHEN 3 THEN 'pending'
    ELSE 'not_required'
  END as verification_status,
  jsonb_build_object(
    'payment_date', NOW(),
    'payment_type', 'service_payment'
  ) as payment_details
FROM sample_requests;

-- Check the inserted data
SELECT 
  COUNT(*) as total_payments,
  SUM(amount) as total_revenue,
  SUM(platform_fee) as total_fees,
  SUM(provider_amount) as total_provider_amount
FROM payments;

-- Show sample records
SELECT 
  id,
  transaction_id,
  amount,
  platform_fee,
  provider_amount,
  payment_method,
  payment_gateway,
  status,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;
