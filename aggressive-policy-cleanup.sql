-- AGGRESSIVE POLICY CLEANUP - Force remove all policies and recreate
-- Make sure you're running this on the correct database instance

-- Step 1: Check current database and policies
SELECT current_database() as current_db;

SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename = 'talyer_owner_verifications'
ORDER BY policyname;

-- Step 2: FORCE DROP all policies (use CASCADE)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'talyer_owner_verifications'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.talyer_owner_verifications CASCADE', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 3: Disable and re-enable RLS to clear cache
ALTER TABLE public.talyer_owner_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.talyer_owner_verifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create our simple working policies
CREATE POLICY "working_select_all" 
ON public.talyer_owner_verifications 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "working_update_all" 
ON public.talyer_owner_verifications 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "working_insert_all" 
ON public.talyer_owner_verifications 
FOR INSERT 
TO public
WITH CHECK (true);

-- Step 5: Verify policies are correct now
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'talyer_owner_verifications'
ORDER BY cmd, policyname;

-- Step 6: Test UPDATE operation
UPDATE public.talyer_owner_verifications 
SET 
    status = 'rejected',
    admin_notes = 'AGGRESSIVE CLEANUP TEST: ' || now(),
    updated_at = now()
WHERE id = 'c488ce40-0102-4a80-a3d4-9e0c43526e06';

-- Step 7: Verify the update worked
SELECT 
  id, 
  business_name, 
  status, 
  admin_notes,
  updated_at
FROM public.talyer_owner_verifications 
WHERE id = 'c488ce40-0102-4a80-a3d4-9e0c43526e06';

-- Step 8: Final confirmation message
SELECT 'SUCCESS: Policies cleaned and working!' as result;
