-- ================================================================
-- TIVO DESIGN CRM - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================================
-- TABLES
-- ================================================================

-- USERS table (team access list for the Tivo Design workspace)
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  email text not null unique,
  full_name text,
  role text default 'partner',       -- founder, partner
  approved boolean default true,
  workspace text default 'tivo_design'
);

-- LEADS table
create table if not exists leads (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Contact info
  client_name text not null,
  mobile_number text,
  whatsapp_number text,
  email text,

  -- Property details
  lead_source text,             -- Google Ads, Instagram, Referral, Website, Walk-in, Other
  property_type text,           -- 1BHK, 2BHK, 3BHK, Villa, Office, Retail, Other
  location text,
  scope text,                   -- Design only, Design + Execution, Turnkey Interior, Renovation
  approx_budget text,
  requirement_description text,

  -- Status
  current_stage text default 'New Lead',
  lead_priority text default 'Warm',  -- Hot, Warm, Cold
  assigned_to text,
  notes text,
  status_remarks text,
  last_contacted_date date,

  -- Follow-up info (legacy, from form)
  next_followup_date date,
  next_followup_time time,
  followup_type text,
  reminder_frequency text,

  -- BOQ tracking
  boq_shared boolean default false,
  boq_shared_date date,
  boq_amount text,
  boq_client_feedback text,
  boq_revision_required boolean,
  next_boq_followup_date date,

  -- Metadata
  created_by text,              -- user email
  workspace text default 'tivo_design'
);

-- FOLLOWUPS table
create table if not exists followups (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  date date not null,
  time time,
  type text,                    -- Call, WhatsApp, Meeting, BOQ Reminder, Site Visit
  notes text,
  reminder_frequency text default 'One time',
  status text default 'pending', -- pending, done
  completed_at timestamptz,
  created_by text,
  google_event_id text          -- Google Calendar event ID
);

-- LEAD NOTES table (quick notes + activity within leads)
create table if not exists lead_notes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  note text not null,
  action_type text default 'Note',  -- Note, Call, WhatsApp, BOQ, Meeting, etc.
  user_email text
);

-- ACTIVITY LOGS table
create table if not exists activity_logs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  user_email text,
  action text,                  -- Stage Changed, Follow-up Scheduled, etc.
  details text
);

-- WHATSAPP TEMPLATES table (optional, for custom templates)
create table if not exists whatsapp_templates (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  name text not null,
  body text not null,
  category text,
  workspace text default 'tivo_design'
);

-- Safe upgrades if you already ran an earlier version of this schema
alter table followups add column if not exists reminder_frequency text default 'One time';

-- ================================================================
-- INDEXES
-- ================================================================
create index if not exists idx_leads_workspace on leads(workspace);
create index if not exists idx_leads_stage on leads(current_stage);
create index if not exists idx_leads_priority on leads(lead_priority);
create index if not exists idx_leads_assigned on leads(assigned_to);
create index if not exists idx_users_email on users(email);
create index if not exists idx_users_workspace on users(workspace);
create index if not exists idx_followups_lead on followups(lead_id);
create index if not exists idx_followups_date on followups(date);
create index if not exists idx_followups_status on followups(status);
create index if not exists idx_notes_lead on lead_notes(lead_id);
create index if not exists idx_activity_lead on activity_logs(lead_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

alter table users enable row level security;
alter table leads enable row level security;
alter table followups enable row level security;
alter table lead_notes enable row level security;
alter table activity_logs enable row level security;
alter table whatsapp_templates enable row level security;

-- APPROVED EMAILS list (add your team emails here)
create or replace function is_approved_user()
returns boolean as $$
begin
  return exists (
    select 1
    from public.users u
    where lower(u.email) = lower(auth.jwt() ->> 'email')
      and u.approved = true
      and u.workspace = 'tivo_design'
  )
  or lower(auth.jwt() ->> 'email') in (
    'rushabhyeole2003@gmail.com',   -- Replace/add founder email
    'tivoodesign@gmail.com'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Initial approved users. Replace these emails before launch.
insert into users (email, full_name, role, approved, workspace)
values
  ('rushabhyeole03@gmail.com', 'Rushabh Yeole', 'founder', true, 'tivo_design'),
  ('founder@tivodesign.com', 'Founder', 'founder', true, 'tivo_design'),
  ('partner@tivodesign.com', 'Partner', 'partner', true, 'tivo_design')
on conflict (email) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  approved = excluded.approved,
  workspace = excluded.workspace;

drop policy if exists "Approved users can read users" on users;
drop policy if exists "Approved users can manage users" on users;
drop policy if exists "Approved users can read leads" on leads;
drop policy if exists "Approved users can insert leads" on leads;
drop policy if exists "Approved users can update leads" on leads;
drop policy if exists "Approved users can delete leads" on leads;
drop policy if exists "Approved users can manage followups" on followups;
drop policy if exists "Approved users can manage notes" on lead_notes;
drop policy if exists "Approved users can manage logs" on activity_logs;
drop policy if exists "Approved users can manage templates" on whatsapp_templates;

-- USERS policies
create policy "Approved users can read users"
  on users for select to authenticated
  using (is_approved_user() and workspace = 'tivo_design');

create policy "Approved users can manage users"
  on users for all to authenticated
  using (is_approved_user() and workspace = 'tivo_design')
  with check (is_approved_user() and workspace = 'tivo_design');

-- LEADS policies
create policy "Approved users can read leads"
  on leads for select to authenticated
  using (is_approved_user() and workspace = 'tivo_design');

create policy "Approved users can insert leads"
  on leads for insert to authenticated
  with check (is_approved_user() and workspace = 'tivo_design');

create policy "Approved users can update leads"
  on leads for update to authenticated
  using (is_approved_user() and workspace = 'tivo_design')
  with check (is_approved_user() and workspace = 'tivo_design');

create policy "Approved users can delete leads"
  on leads for delete to authenticated
  using (is_approved_user() and workspace = 'tivo_design');

-- FOLLOWUPS policies
create policy "Approved users can manage followups"
  on followups for all to authenticated
  using (
    is_approved_user()
    and exists (select 1 from leads where leads.id = followups.lead_id and leads.workspace = 'tivo_design')
  )
  with check (
    is_approved_user()
    and exists (select 1 from leads where leads.id = followups.lead_id and leads.workspace = 'tivo_design')
  );

-- LEAD NOTES policies
create policy "Approved users can manage notes"
  on lead_notes for all to authenticated
  using (
    is_approved_user()
    and exists (select 1 from leads where leads.id = lead_notes.lead_id and leads.workspace = 'tivo_design')
  )
  with check (
    is_approved_user()
    and exists (select 1 from leads where leads.id = lead_notes.lead_id and leads.workspace = 'tivo_design')
  );

-- ACTIVITY LOGS policies
create policy "Approved users can manage logs"
  on activity_logs for all to authenticated
  using (
    is_approved_user()
    and exists (select 1 from leads where leads.id = activity_logs.lead_id and leads.workspace = 'tivo_design')
  )
  with check (
    is_approved_user()
    and exists (select 1 from leads where leads.id = activity_logs.lead_id and leads.workspace = 'tivo_design')
  );

-- WHATSAPP TEMPLATES policies
create policy "Approved users can manage templates"
  on whatsapp_templates for all to authenticated
  using (is_approved_user() and workspace = 'tivo_design')
  with check (is_approved_user() and workspace = 'tivo_design');

-- ================================================================
-- UPDATED_AT trigger
-- ================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_leads_updated_at on leads;

create trigger update_leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- ================================================================
-- SUPABASE AUTH: Google OAuth
-- In Supabase Dashboard:
-- 1. Go to Authentication > Providers
-- 2. Enable Google
-- 3. Add your Google Client ID and Secret
-- 4. Add callback URL to Google Console:
--    https://<your-project>.supabase.co/auth/v1/callback
-- ================================================================

