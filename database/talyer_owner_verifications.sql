-- Create the talyer_owner_verifications table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.talyer_owner_verifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  business_name character varying not null,
  business_permit_url text not null,
  valid_id_url text not null,
  id_type character varying not null default 'national_id'::character varying,
  permit_expiry_date date null,
  id_expiry_date date null,
  status character varying not null default 'pending'::character varying,
  admin_notes text null,
  reviewed_by uuid null,
  reviewed_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  business_address text null,
  contact_person character varying null,
  phone_number character varying null,
  email character varying null,
  is_permit_expired boolean not null default false,
  is_id_expired boolean not null default false,
  tamper_flags jsonb not null default '[]'::jsonb,
  verification_score integer not null default 0,
  constraint talyer_owner_verifications_pkey primary key (id),
  constraint talyer_owner_verifications_user_id_key unique (user_id),
  constraint talyer_owner_verifications_reviewed_by_fkey foreign KEY (reviewed_by) references auth.users (id) on delete set null,
  constraint talyer_owner_verifications_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint talyer_owner_verifications_score_check check (
    (
      (verification_score >= 0)
      and (verification_score <= 100)
    )
  ),
  constraint talyer_owner_verifications_id_type_check check (
    (
      (id_type)::text = any (
        (
          array[
            'drivers_license'::character varying,
            'umid'::character varying,
            'national_id'::character varying,
            'passport'::character varying,
            'philsys_id'::character varying,
            'other'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint talyer_owner_verifications_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'under_review'::character varying,
            'approved'::character varying,
            'rejected'::character varying,
            'additional_info_required'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

-- Create indexes for performance
create index IF not exists idx_talyer_verifications_user_id on public.talyer_owner_verifications using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_talyer_verifications_status on public.talyer_owner_verifications using btree (status) TABLESPACE pg_default;

create index IF not exists idx_talyer_verifications_reviewed_by on public.talyer_owner_verifications using btree (reviewed_by) TABLESPACE pg_default;

create index IF not exists idx_talyer_verifications_created_at on public.talyer_owner_verifications using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_talyer_verifications_score on public.talyer_owner_verifications using btree (verification_score) TABLESPACE pg_default;

-- Create the trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_talyer_owner_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the shop owner's status based on verification approval
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.user_profiles 
    SET updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (drop first if exists to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_update_talyer_owner_status ON public.talyer_owner_verifications;
CREATE TRIGGER trigger_update_talyer_owner_status
  AFTER UPDATE ON public.talyer_owner_verifications 
  FOR EACH ROW
  EXECUTE FUNCTION update_talyer_owner_status();

-- Enable RLS (Row Level Security)
ALTER TABLE public.talyer_owner_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow admins to view all verifications" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Allow admins to update verifications" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Allow shop owners to insert their verification" ON public.talyer_owner_verifications;
DROP POLICY IF EXISTS "Allow shop owners to view their own verification" ON public.talyer_owner_verifications;

-- RLS Policies for admin access
CREATE POLICY "Allow admins to view all verifications" ON public.talyer_owner_verifications
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.user_type IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow admins to update verifications" ON public.talyer_owner_verifications
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.user_type IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow shop owners to insert their verification" ON public.talyer_owner_verifications
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.user_type = 'shop_owner'
    )
  );

CREATE POLICY "Allow shop owners to view their own verification" ON public.talyer_owner_verifications
  FOR SELECT 
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.user_type = 'shop_owner'
    )
  );

-- Insert sample data for testing
INSERT INTO public.talyer_owner_verifications (
  user_id, business_name, business_permit_url, valid_id_url, id_type,
  permit_expiry_date, id_expiry_date, status, admin_notes,
  business_address, contact_person, phone_number, email,
  is_permit_expired, is_id_expired, tamper_flags, verification_score
) VALUES 
(
  gen_random_uuid(), 
  'Juan''s Auto Repair Shop',
  'https://example.com/permits/permit1.jpg',
  'https://example.com/ids/id1.jpg',
  'drivers_license',
  '2025-12-31',
  '2027-06-15',
  'pending',
  NULL,
  '123 Main Street, Quezon City, Metro Manila',
  'Juan Dela Cruz',
  '+63917-123-4567',
  'juan@autorepair.com',
  false,
  false,
  '[]'::jsonb,
  85
),
(
  gen_random_uuid(),
  'Maria''s Motorcycle Services', 
  'https://example.com/permits/permit2.jpg',
  'https://example.com/ids/id2.jpg',
  'national_id',
  '2024-12-31',
  '2026-03-20',
  'under_review',
  'Business permit seems legitimate, checking address verification',
  '456 Rizal Avenue, Makati City, Metro Manila',
  'Maria Santos',
  '+63922-987-6543',
  'maria@motocycle.ph',
  true,
  false,
  '["Document quality inconsistent"]'::jsonb,
  65
),
(
  gen_random_uuid(),
  'Rodriguez Tire & Battery Center',
  'https://example.com/permits/permit3.jpg', 
  'https://example.com/ids/id3.jpg',
  'umid',
  '2026-08-30',
  '2028-11-10',
  'approved',
  'All documents verified. Business location confirmed.',
  '789 EDSA, Pasig City, Metro Manila',
  'Pedro Rodriguez',
  '+63915-555-1234',
  'pedro@tirebattery.com',
  false,
  false,
  '[]'::jsonb,
  92
);
