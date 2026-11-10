-- Review and adapt this schema before production use.
-- Public campaign publishing is intentionally NOT enabled by this starter.
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  location text not null,
  summary text not null,
  organiser_name text not null,
  contact_method text,
  contact_value text,
  payment_instructions text,
  consent_to_publish boolean not null default false,
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','rejected')),
  publication_status text not null default 'draft'
    check (publication_status in ('draft','published','archived')),
  created_at timestamptz not null default now()
);

-- SECURITY TODO before enabling any public workflow:
-- 1. Enable RLS on campaigns.
-- 2. Add a private admin role and policies.
-- 3. Permit public SELECT only for published campaigns.
-- 4. Route submissions through a server-side function with validation/rate limiting.
-- 5. Never expose service-role credentials in browser code.
-- 6. Keep identity documents private; do not store them in a public bucket.
