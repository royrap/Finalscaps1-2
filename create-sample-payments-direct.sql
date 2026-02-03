-- Create sample payments for existing service requests
-- Run this in your Supabase SQL Editor

-- Insert sample payments based on existing completed service requests
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
  sr.id as request_id,
  sr.customer_id,
  sr.provider_id,
  COALESCE(sr.final_price, sr.estimated_price, 1500) as amount,
  ROUND(COALESCE(sr.final_price, sr.estimated_price, 1500) * 0.10, 2) as platform_fee,
  ROUND(COALESCE(sr.final_price, sr.estimated_price, 1500) * 0.90, 2) as provider_amount,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 0 THEN 'gcash'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 1 THEN 'paymongo'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 2 THEN 'cash'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 3 THEN 'paymaya'
    ELSE 'bank_transfer'
  END as payment_method,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 0 THEN 'gcash'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 1 THEN 'paymongo'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 2 THEN NULL
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 3 THEN 'paymaya'
    ELSE 'paymongo'
  END as payment_gateway,
  'TXN' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD(ROW_NUMBER() OVER()::TEXT, 3, '0') as transaction_id,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 4) = 0 THEN 'completed'
    WHEN MOD(ROW_NUMBER() OVER(), 4) = 1 THEN 'completed'
    WHEN MOD(ROW_NUMBER() OVER(), 4) = 2 THEN 'pending'
    ELSE 'completed'
  END as status,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 4) IN (0, 1, 3) THEN NOW()
    ELSE NULL
  END as processed_at,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 2 THEN TRUE
    ELSE FALSE
  END as payment_verification_required,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 2 THEN 'pending'
    ELSE 'not_required'
  END as verification_status,
  jsonb_build_object(
    'service_title', sr.title,
    'payment_date', NOW()::TEXT,
    'method', CASE 
      WHEN MOD(ROW_NUMBER() OVER(), 5) = 0 THEN 'gcash'
      WHEN MOD(ROW_NUMBER() OVER(), 5) = 1 THEN 'paymongo'
      WHEN MOD(ROW_NUMBER() OVER(), 5) = 2 THEN 'cash'
      WHEN MOD(ROW_NUMBER() OVER(), 5) = 3 THEN 'paymaya'
      ELSE 'bank_transfer'
    END
  ) as payment_details
FROM service_requests sr
WHERE sr.provider_id IS NOT NULL 
  AND sr.customer_id IS NOT NULL
LIMIT 10
ON CONFLICT DO NOTHING;

-- Display summary
SELECT 
  COUNT(*) as total_payments,
  SUM(amount) as total_revenue,
  SUM(platform_fee) as total_platform_fees,
  SUM(provider_amount) as total_provider_amount,
  ROUND(AVG(amount), 2) as average_payment,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
FROM payments;

-- Show recent payments
SELECT 
  p.id,
  p.transaction_id,
  p.amount,
  p.payment_method,
  p.status,
  p.created_at,
  u.first_name || ' ' || u.last_name as customer_name,
  sr.title as service_title
FROM payments p
LEFT JOIN user_profiles u ON u.id = p.customer_id
LEFT JOIN service_requests sr ON sr.id = p.request_id
ORDER BY p.created_at DESC
LIMIT 10;
