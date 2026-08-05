-- AdTrack core schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) for your project.
-- All tables use Row Level Security so each user can only see their own data.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- user_preferences
-- ---------------------------------------------------------------------------
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  metrics_preference text not null default 'ask' check (metrics_preference in ('manual', 'sync', 'ask')),
  notification_settings jsonb not null default '{}'::jsonb,
  dashboard_layout jsonb,
  onboarding_survey jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users manage their own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  voice_guidelines text,
  compliance_rules jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.brands enable row level security;

create policy "Users manage their own brands"
  on public.brands for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- creative_sets (parent)
-- ---------------------------------------------------------------------------
create table if not exists public.creative_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  platform text not null,
  format text not null check (format in ('Image', 'Video', 'Carousel')),
  funnel_stage text not null check (funnel_stage in ('TOFU', 'MOFU', 'BOFU')),
  angle text not null,
  hook_type text not null,
  version int not null default 1,
  status text not null default 'Draft' check (status in ('Draft', 'In Review', 'Live', 'Paused', 'Rejected', 'Archived', 'Testing')),
  hook_text text default '',
  primary_text text default '',
  headline text default '',
  description text default '',
  cta text default '',
  notes text default '',
  compliance_score int default 80,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creative_sets enable row level security;

create policy "Users manage their own creative sets"
  on public.creative_sets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- creative_variants (child size variants)
-- ---------------------------------------------------------------------------
create table if not exists public.creative_variants (
  id uuid primary key default gen_random_uuid(),
  creative_set_id uuid not null references public.creative_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  placement_label text not null,
  width int not null,
  height int not null,
  asset_type text not null check (asset_type in ('image', 'video')),
  asset_url text,
  created_at timestamptz not null default now()
);

alter table public.creative_variants enable row level security;

create policy "Users manage their own creative variants"
  on public.creative_variants for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- creative_comments
-- ---------------------------------------------------------------------------
create table if not exists public.creative_comments (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references public.creative_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.creative_comments enable row level security;

create policy "Users manage comments on their own creatives"
  on public.creative_comments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- campaigns / ad_sets / ads
-- ---------------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  platform text not null,
  external_id text,
  name text not null,
  status text not null default 'Draft' check (status in ('Active', 'Paused', 'Ended', 'Draft')),
  objective text,
  roas_target numeric,
  start_date date,
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;
create policy "Users manage their own campaigns"
  on public.campaigns for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.ad_sets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'Active' check (status in ('Active', 'Paused')),
  created_at timestamptz not null default now()
);

alter table public.ad_sets enable row level security;
create policy "Users manage their own ad sets"
  on public.ad_sets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  ad_set_id uuid not null references public.ad_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  creative_set_id uuid references public.creative_sets(id) on delete set null,
  name text not null,
  status text not null default 'Active' check (status in ('Active', 'Paused')),
  created_at timestamptz not null default now()
);

alter table public.ads enable row level security;
create policy "Users manage their own ads"
  on public.ads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- metrics (daily performance rollups per creative/campaign/platform)
-- ---------------------------------------------------------------------------
create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('creative_set', 'campaign', 'ad_set', 'ad')),
  entity_id uuid not null,
  platform text not null,
  date date not null,
  impressions bigint default 0,
  clicks bigint default 0,
  spend numeric default 0,
  conversions bigint default 0,
  revenue numeric default 0,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, date)
);

alter table public.metrics enable row level security;
create policy "Users manage their own metrics"
  on public.metrics for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- audiences
-- ---------------------------------------------------------------------------
create table if not exists public.audiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  name text not null,
  type text not null check (type in ('Broad', 'Custom', 'Lookalike')),
  estimated_size bigint,
  source text,
  created_at timestamptz not null default now()
);

alter table public.audiences enable row level security;
create policy "Users manage their own audiences"
  on public.audiences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ab_tests
-- ---------------------------------------------------------------------------
create table if not exists public.ab_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  hypothesis text,
  variables_tested text,
  status text not null default 'Draft' check (status in ('Running', 'Completed', 'Draft')),
  confidence numeric,
  lift numeric,
  winner text check (winner in ('A', 'B')),
  learnings text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

alter table public.ab_tests enable row level security;
create policy "Users manage their own ab tests"
  on public.ab_tests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- alerts
-- ---------------------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('fatigue', 'budget', 'ctr', 'policy')),
  severity text not null check (severity in ('warning', 'danger')),
  title text not null,
  description text,
  related_entity_id uuid,
  created_at timestamptz not null default now()
);

alter table public.alerts enable row level security;
create policy "Users manage their own alerts"
  on public.alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  schedule text,
  share_token text unique,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;
create policy "Users manage their own reports"
  on public.reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- integrations (encrypted OAuth tokens)
-- ---------------------------------------------------------------------------
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'syncing', 'error')),
  access_token_encrypted text,
  refresh_token_encrypted text,
  account_label text,
  sync_frequency text default 'daily' check (sync_frequency in ('hourly', '6h', 'daily')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, platform, account_label)
);

alter table public.integrations enable row level security;
create policy "Users manage their own integrations"
  on public.integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for creative assets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('creative-assets', 'creative-assets', true)
on conflict (id) do nothing;

create policy "Users upload to their own folder"
  on storage.objects for insert
  with check (bucket_id = 'creative-assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users manage their own creative assets"
  on storage.objects for all
  using (bucket_id = 'creative-assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Creative assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'creative-assets');
