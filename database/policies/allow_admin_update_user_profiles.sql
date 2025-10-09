-- Allow admin and super_admin to update user_profiles
-- Run this in Supabase SQL editor (or via psql as DB owner)

DROP POLICY IF EXISTS "Allow admins update user_profiles" ON public.user_profiles;

CREATE POLICY "Allow admins update user_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.user_type IN ('admin','super_admin')
  )
)
WITH CHECK (true);

-- Note: This policy allows authenticated admin/super_admin callers to UPDATE user_profiles rows.
-- It is safe for admin workflows like triggers that update a user's `updated_at` when a verification is approved.
