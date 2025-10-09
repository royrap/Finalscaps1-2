-- Migration: add shop_phone to shops
-- Reason: the verification approval trigger references shops.shop_phone which does not exist
-- Run this in Supabase SQL editor (or via psql) to fix the runtime error

ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS shop_phone text;

-- Optional: backfill shop_phone from approved verifications where owner_id matches verification.user_id
-- Uncomment and run if you want to populate phone numbers from existing approved verification records
-- UPDATE public.shops s
-- SET shop_phone = v.phone_number, updated_at = now()
-- FROM public.talyer_owner_verifications v
-- WHERE s.owner_id = v.user_id AND v.status = 'approved' AND v.phone_number IS NOT NULL;

-- Note: After running this migration, the existing trigger that updates shops.shop_phone will no longer fail.
