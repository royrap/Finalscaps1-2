-- Insert sample payments based on COMPLETED service requests
-- This creates payment records from existing service_requests that are 'completed'

WITH completed_requests AS (
  SELECT 
    sr.id as request_id,
    sr.customer_id,
    sr.provider_id,
    sr.final_price,
    sr.created_at
  FROM service_requests sr
  WHERE sr.status = 'completed' 
    AND sr.final_price IS NOT NULL
    AND sr.final_price > 0
    AND sr.provider_id IS NOT NULL
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
  created_at,
  payment_verification_required,
  verification_status
)
SELECT 
  request_id,
  customer_id,
  provider_id,
  final_price as amount,
  ROUND(final_price * 0.10, 2) as platform_fee,  -- 10% platform fee
  ROUND(final_price * 0.90, 2) as provider_amount,  -- 90% to provider
  CASE 
    WHEN random() < 0.3 THEN 'card'
    WHEN random() < 0.6 THEN 'gcash'
    ELSE 'cash'
  END as payment_method,
  CASE 
    WHEN random() < 0.5 THEN 'paymongo'
    ELSE 'manual'
  END as payment_gateway,
  'TXN-' || UPPER(SUBSTRING(MD5(request_id::text || NOW()::text) FROM 1 FOR 12)) as transaction_id,
  'completed' as status,
  NOW() - INTERVAL '1 hour' as processed_at,
  created_at,
  CASE 
    WHEN random() < 0.3 THEN true
    ELSE false
  END as payment_verification_required,
  CASE 
    WHEN random() < 0.3 THEN 'verified'
    ELSE 'not_required'
  END as verification_status
FROM completed_requests;

-- If walang completed requests, create from any request with final_price
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
  created_at,
  payment_verification_required,
  verification_status
)
SELECT 
  sr.id as request_id,
  sr.customer_id,
  COALESCE(sr.provider_id, (SELECT id FROM service_providers LIMIT 1)) as provider_id,
  COALESCE(sr.final_price, 1000.00) as amount,
  ROUND(COALESCE(sr.final_price, 1000.00) * 0.10, 2) as platform_fee,
  ROUND(COALESCE(sr.final_price, 1000.00) * 0.90, 2) as provider_amount,
  CASE (ROW_NUMBER() OVER ()) % 5
    WHEN 0 THEN 'card'
    WHEN 1 THEN 'gcash'
    WHEN 2 THEN 'paymaya'
    WHEN 3 THEN 'cash'
    ELSE 'bank_transfer'
  END as payment_method,
  CASE (ROW_NUMBER() OVER ()) % 2
    WHEN 0 THEN 'paymongo'
    ELSE 'manual'
  END as payment_gateway,
  'TXN-' || UPPER(SUBSTRING(MD5(sr.id::text || NOW()::text) FROM 1 FOR 12)) as transaction_id,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'completed'
    WHEN 1 THEN 'pending'
    ELSE 'processing'
  END as status,
  sr.created_at,
  CASE (ROW_NUMBER() OVER ()) % 4
    WHEN 0 THEN true
    ELSE false
  END as payment_verification_required,
  CASE (ROW_NUMBER() OVER ()) % 4
    WHEN 0 THEN 'pending'
    ELSE 'not_required'
  END as verification_status
FROM service_requests sr
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE request_id = sr.id)
LIMIT 5;

-- Display results
SELECT 
  p.id,
  p.transaction_id,
  p.amount,
  p.platform_fee,
  p.provider_amount,
  p.payment_method,
  p.status,
  sr.title as service,
  up.first_name || ' ' || up.last_name as customer_name
FROM payments p
JOIN service_requests sr ON p.request_id = sr.id
JOIN user_profiles up ON p.customer_id = up.id
ORDER BY p.created_at DESC;
