-- Temporarily disable RLS to insert sample payments
-- Run this in Supabase SQL Editor as an admin

-- Disable RLS temporarily (only admins can do this)
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Clear existing test payments if any
DELETE FROM payments WHERE transaction_id LIKE 'TXN%';

-- Insert sample payments based on existing service requests
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
  verification_status,
  payment_details
)
SELECT 
  sr.id as request_id,
  sr.customer_id,
  sr.provider_id,
  COALESCE(sr.final_price, sr.estimated_price, 1500.00)::numeric(10,2) as amount,
  ROUND(COALESCE(sr.final_price, sr.estimated_price, 1500.00) * 0.10, 2)::numeric(10,2) as platform_fee,
  ROUND(COALESCE(sr.final_price, sr.estimated_price, 1500.00) * 0.90, 2)::numeric(10,2) as provider_amount,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 0 THEN 'gcash'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 1 THEN 'paymongo'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 2 THEN 'cash'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 3 THEN 'paymaya'
    ELSE 'bank_transfer'
  END::character varying(50) as payment_method,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 0 THEN 'gcash'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 1 THEN 'paymongo'
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 2 THEN NULL
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 3 THEN 'paymaya'
    ELSE 'paymongo'
  END::character varying(50) as payment_gateway,
  ('TXN' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD(ROW_NUMBER() OVER()::TEXT, 3, '0'))::character varying(100) as transaction_id,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 4) = 0 THEN 'completed'
    WHEN MOD(ROW_NUMBER() OVER(), 4) = 1 THEN 'completed'
    WHEN MOD(ROW_NUMBER() OVER(), 4) = 2 THEN 'pending'
    ELSE 'completed'
  END::character varying(20) as status,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 4) IN (0, 1, 3) THEN NOW()
    ELSE NULL
  END as processed_at,
  NOW() - (RANDOM() * INTERVAL '30 days') as created_at,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 2 THEN TRUE
    ELSE FALSE
  END as payment_verification_required,
  CASE 
    WHEN MOD(ROW_NUMBER() OVER(), 5) = 2 THEN 'pending'
    ELSE 'not_required'
  END::text as verification_status,
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
LIMIT 15
ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Show summary
SELECT 
  '✅ PAYMENT CREATION SUMMARY' as info,
  COUNT(*) as total_payments,
  TO_CHAR(SUM(amount), 'FM₱999,999,990.00') as total_revenue,
  TO_CHAR(SUM(platform_fee), 'FM₱999,999,990.00') as total_platform_fees,
  TO_CHAR(SUM(provider_amount), 'FM₱999,999,990.00') as total_provider_amount,
  TO_CHAR(AVG(amount), 'FM₱999,999,990.00') as average_payment,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_payments
FROM payments
WHERE transaction_id LIKE 'TXN%';

-- Show recent payments with customer and service info
SELECT 
  '📋 RECENT PAYMENTS' as section,
  p.transaction_id,
  TO_CHAR(p.amount, 'FM₱999,999,990.00') as amount,
  p.payment_method,
  p.payment_gateway,
  p.status,
  COALESCE(c.first_name || ' ' || c.last_name, 'Unknown') as customer_name,
  COALESCE(sr.title, 'No Title') as service_title,
  TO_CHAR(p.created_at, 'Mon DD, YYYY HH24:MI') as created
FROM payments p
LEFT JOIN user_profiles c ON c.id = p.customer_id
LEFT JOIN service_requests sr ON sr.id = p.request_id
WHERE p.transaction_id LIKE 'TXN%'
ORDER BY p.created_at DESC
LIMIT 10;

-- Verify payment stats
SELECT 
  '📊 PAYMENT METHOD BREAKDOWN' as breakdown,
  payment_method,
  COUNT(*) as count,
  TO_CHAR(SUM(amount), 'FM₱999,999,990.00') as total_amount
FROM payments
WHERE transaction_id LIKE 'TXN%'
GROUP BY payment_method
ORDER BY COUNT(*) DESC;

SELECT 
  '📈 PAYMENT STATUS BREAKDOWN' as breakdown,
  status,
  COUNT(*) as count,
  TO_CHAR(SUM(amount), 'FM₱999,999,990.00') as total_amount,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM payments WHERE transaction_id LIKE 'TXN%')::numeric) * 100, 1) as percentage
FROM payments
WHERE transaction_id LIKE 'TXN%'
GROUP BY status
ORDER BY COUNT(*) DESC;

-- Final message
SELECT 
  '🎉 SUCCESS!' as message,
  'Your payments have been created!' as status,
  'Visit https://road-aid-system-tsyx.vercel.app/admin/payments to view them' as next_step;
