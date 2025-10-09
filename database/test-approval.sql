-- Test script to verify the approval trigger works
-- Run this AFTER running complete-trigger-cleanup.sql

-- Step 1: Check if required columns exist
SELECT 'Checking shop columns...' as step;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'shops' 
  AND column_name IN ('shop_address','shop_phone','shop_email')
ORDER BY column_name;

-- Step 2: Find a real verification ID to test with
SELECT 'Finding verification to test...' as step;
SELECT id, business_name, status, user_id 
FROM public.talyer_owner_verifications 
WHERE status != 'approved'  -- don't test on already approved ones
ORDER BY created_at DESC 
LIMIT 3;

-- Step 3: Test the approval on the first non-approved verification
-- Replace this with a DO block that finds and updates automatically
DO $$
DECLARE
    test_id uuid;
    original_status text;
BEGIN
    -- Find first non-approved verification
    SELECT id, status INTO test_id, original_status
    FROM public.talyer_owner_verifications 
    WHERE status != 'approved'
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        RAISE NOTICE 'Testing approval on verification: % (was: %)', test_id, original_status;
        
        -- Test the approval
        UPDATE public.talyer_owner_verifications 
        SET status = 'approved', 
            admin_notes = 'Test approval - migration verification',
            reviewed_at = now(),
            updated_at = now() 
        WHERE id = test_id;
        
        RAISE NOTICE 'Approval test completed successfully!';
        
        -- Revert back to original status if desired
        -- UPDATE public.talyer_owner_verifications 
        -- SET status = original_status,
        --     admin_notes = null,
        --     reviewed_at = null
        -- WHERE id = test_id;
        
    ELSE
        RAISE NOTICE 'No non-approved verifications found for testing';
    END IF;
END $$;

-- Step 4: Verify the shops table was updated
SELECT 'Checking shops updates...' as step;
SELECT s.id, s.owner_id, s.shop_name, s.shop_address, s.shop_phone, s.shop_email, s.updated_at
FROM public.shops s
JOIN public.talyer_owner_verifications v ON s.owner_id = v.user_id
WHERE v.status = 'approved'
ORDER BY s.updated_at DESC
LIMIT 5;
