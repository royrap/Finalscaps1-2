-- Complete fix for verification approval trigger failures
-- Run this in Supabase SQL editor to fix all missing column errors

-- Step 1: Add all missing columns that the trigger references
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS shop_email text;

-- Verify all required columns exist
-- (shop_address and shop_phone should already exist from previous migrations)

-- Step 2: Create a defensive trigger function that won't fail on missing columns
-- This replaces any existing trigger function with a safe version
CREATE OR REPLACE FUNCTION update_talyer_owner_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only execute on status change to 'approved'
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Always safe: update user_profiles.updated_at
    UPDATE public.user_profiles
      SET updated_at = NOW()
      WHERE id = NEW.user_id;
    
    -- Defensively update shops table if a shop exists for this user
    -- Only set fields that have non-null values from the verification
    UPDATE public.shops
    SET
      shop_name = COALESCE(NULLIF(NEW.business_name, ''), shop_name),
      shop_address = CASE 
        WHEN NEW.business_address IS NOT NULL AND NEW.business_address != '' 
        THEN NEW.business_address 
        ELSE shop_address 
      END,
      shop_phone = CASE 
        WHEN NEW.phone_number IS NOT NULL AND NEW.phone_number != '' 
        THEN NEW.phone_number 
        ELSE shop_phone 
      END,
      shop_email = CASE 
        WHEN NEW.email IS NOT NULL AND NEW.email != '' 
        THEN NEW.email 
        ELSE shop_email 
      END,
      updated_at = NOW()
    WHERE owner_id = NEW.user_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Ensure the trigger exists and uses our defensive function
DROP TRIGGER IF EXISTS trigger_update_talyer_owner_status ON public.talyer_owner_verifications;
CREATE TRIGGER trigger_update_talyer_owner_status
  AFTER UPDATE ON public.talyer_owner_verifications 
  FOR EACH ROW
  EXECUTE FUNCTION update_talyer_owner_status();

-- Step 4: Clean up any duplicate/conflicting triggers
DROP TRIGGER IF EXISTS tr_talyer_verification_approved ON public.talyer_owner_verifications;

-- Step 5: Optional - backfill existing approved verifications into shops
-- Uncomment to run backfill:
/*
UPDATE public.shops s
SET 
  shop_address = COALESCE(v.business_address, s.shop_address),
  shop_phone = COALESCE(v.phone_number, s.shop_phone),
  shop_email = COALESCE(v.email, s.shop_email),
  updated_at = now()
FROM public.talyer_owner_verifications v
WHERE s.owner_id = v.user_id 
  AND v.status = 'approved' 
  AND (v.business_address IS NOT NULL OR v.phone_number IS NOT NULL OR v.email IS NOT NULL);
*/

-- Verification queries (run after migration):
-- 1. Check all required columns exist:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'shops' AND column_name IN ('shop_address','shop_phone','shop_email');

-- 2. Test the trigger with a direct update:
-- UPDATE public.talyer_owner_verifications SET status = 'approved', updated_at = now() WHERE id = '<some-id>';
