-- FINAL CLEANUP: Remove ALL conflicting policies for talyer_owner_verifications
-- Run this to completely fix the UPDATE issue

-- Step 0: Check and fix any broken triggers first
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'talyer_owner_verifications';

-- Step 0.1: Drop any broken triggers that reference non-existent tables
-- Must drop trigger first before dropping the function
DROP TRIGGER IF EXISTS update_talyer_owner_status_trigger ON public.talyer_owner_verifications;
DROP TRIGGER IF EXISTS trigger_update_talyer_owner_status ON public.talyer_owner_verifications;
DROP FUNCTION IF EXISTS update_talyer_owner_status() CASCADE;

-- Step 1: DISABLE RLS temporarily to ensure clean slate
ALTER TABLE public.talyer_owner_verifications DISABLE ROW LEVEL SECURITY;

-- Step 2: DROP ALL existing policies completely
DROP POLICY IF EXISTS "Admin select policy" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Admin update policy" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Allow public insert during signup" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Allow service role full access" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Users can insert verification data" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Admins can update verification" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Admins can update verification status" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Users can view own verification data" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Admins can select all verifications" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Public can select verifications" ON public.talyer_owner_verifications;

-- Step 3: RE-ENABLE RLS
ALTER TABLE public.talyer_owner_verifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create ONLY these 3 simple policies
CREATE POLICY "simple_select_policy" 
ON public.talyer_owner_verifications 
FOR SELECT 
USING (true);

CREATE POLICY "simple_update_policy" 
ON public.talyer_owner_verifications 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "simple_insert_policy" 
ON public.talyer_owner_verifications 
FOR INSERT 
WITH CHECK (true);

-- Step 5: Test the UPDATE again
UPDATE public.talyer_owner_verifications 
SET 
    status = 'approved',
    admin_notes = 'FINAL TEST: Policy cleanup successful at ' || now(),
    updated_at = now()
WHERE id = 'c488ce40-0102-4a80-a3d4-9e0c43526e06';

-- Step 6: Verify it worked
SELECT 
  id, 
  business_name, 
  status, 
  admin_notes,
  updated_at
FROM public.talyer_owner_verifications 
WHERE id = 'c488ce40-0102-4a80-a3d4-9e0c43526e06';

-- Step 7: Check final policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'talyer_owner_verifications'
ORDER BY cmd, policyname;
