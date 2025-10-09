-- Migration: add shop_address to shops
-- Reason: the verification approval trigger references shops.shop_address which does not exist
-- Run this in Supabase SQL editor (or via psql) to fix the runtime error

ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS shop_address text;

-- Optional: backfill shop_address from approved verifications where owner_id matches verification.user_id
-- Uncomment and run if you want to populate addresses from existing approved verification records
-- UPDATE public.shops s
-- SET shop_address = v.business_address, updated_at = now()
-- FROM public.talyer_owner_verifications v
-- WHERE s.owner_id = v.user_id AND v.status = 'approved' AND v.business_address IS NOT NULL;

-- Note: After running this migration, the existing trigger that updates shops.shop_address will no longer fail.
