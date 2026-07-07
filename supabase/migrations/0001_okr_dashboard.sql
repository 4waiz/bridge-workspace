-- =====================================================================
-- BRIDGE Flow - OKR + Operational Excellence Dashboard schema
-- Project: kcmwwaxajeaojkpjbjjl
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- Idempotent: safe to re-run.
--
-- Model:
--   teams (6 fixed) 1─┬─* okrs ──* objectives ─┬─* key_results
--                     │                        └─* initiatives
--                     └─* metrics ──* metric_points   (the dashboard time-series)
--   profiles links an auth user to exactly one team.
--
-- RLS: every signed-in user can READ everything (the rollup dashboard),
--      but can only WRITE rows belonging to their own team.
-- =====================================================================

-- ---------- Teams (the 6 fixed teams) --------------------------------
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  name        text not null,
  accent      text not null default '#f15a29',   -- hex used on the dashboard
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- Profiles: auth user -> team ------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  team_id     uuid references public.teams(id) on delete set null,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- OKR: one per team per quarter ----------------------------
create table if not exists public.okrs (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  quarter     text not null default 'Q1',
  year        int  not null default extract(year from now())::int,
  area        text,
  owner       text,
  focus_note  text,
  updated_at  timestamptz not null default now(),
  unique (team_id, quarter, year)
);

-- ---------- Objectives (max 3 per OKR) -------------------------------
create table if not exists public.objectives (
  id          uuid primary key default gen_random_uuid(),
  okr_id      uuid not null references public.okrs(id) on delete cascade,
  team_id     uuid not null references public.teams(id) on delete cascade, -- denormalized for RLS/realtime
  position    int  not null,
  title       text,
  statement   text,
  progress    int  not null default 0,   -- 0..100, drives the dashboard status colour
  updated_at  timestamptz not null default now()
);
-- older DBs created before `progress` existed:
alter table public.objectives add column if not exists progress int not null default 0;

-- ---------- Key results ----------------------------------------------
create table if not exists public.key_results (
  id           uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.objectives(id) on delete cascade,
  team_id      uuid not null references public.teams(id) on delete cascade,
  position     int  not null,
  description  text,
  target_text  text,
  updated_at   timestamptz not null default now()
);

-- ---------- Initiatives ----------------------------------------------
create table if not exists public.initiatives (
  id           uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.objectives(id) on delete cascade,
  team_id      uuid not null references public.teams(id) on delete cascade,
  position     int  not null,
  description  text,
  owner        text,
  updated_at   timestamptz not null default now()
);

-- ---------- Metrics: the "3 data analyses" per team ------------------
create table if not exists public.metrics (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null references public.teams(id) on delete cascade,
  name         text not null,
  unit         text not null default '%',
  target_type  text not null default 'max' check (target_type in ('min','max')),
  target_value numeric,
  sort_order   int  not null default 0,
  updated_at   timestamptz not null default now()
);

-- ---------- Metric points: monthly time series (drives the sparkline
--            + up/down/stable trend on the dashboard) -----------------
create table if not exists public.metric_points (
  id         uuid primary key default gen_random_uuid(),
  metric_id  uuid not null references public.metrics(id) on delete cascade,
  team_id    uuid not null references public.teams(id) on delete cascade,
  period     date not null,
  value      numeric,
  unique (metric_id, period)
);

create index if not exists idx_objectives_team on public.objectives(team_id);
create index if not exists idx_key_results_obj on public.key_results(objective_id);
create index if not exists idx_initiatives_obj on public.initiatives(objective_id);
create index if not exists idx_metrics_team    on public.metrics(team_id);
create index if not exists idx_points_metric   on public.metric_points(metric_id);

-- ---------- Helper: the current user's team --------------------------
create or replace function public.current_team_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select team_id from public.profiles where id = auth.uid()
$$;

-- ---------- Auto-create a profile row when a user signs up -----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name',
             new.email)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.teams          enable row level security;
alter table public.profiles       enable row level security;
alter table public.okrs           enable row level security;
alter table public.objectives     enable row level security;
alter table public.key_results    enable row level security;
alter table public.initiatives    enable row level security;
alter table public.metrics        enable row level security;
alter table public.metric_points  enable row level security;

-- teams: read-only to clients (managed by seed / admin)
drop policy if exists teams_read on public.teams;
create policy teams_read on public.teams
  for select to authenticated using (true);

-- profiles: read all (to show member names), update only your own row
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select to authenticated using (true);
drop policy if exists profiles_write_own on public.profiles;
create policy profiles_write_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = auth.uid());

-- team-owned tables: READ all, WRITE only your team's rows.
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'okrs','objectives','key_results','initiatives','metrics','metric_points'
  ] loop
    execute format('drop policy if exists %I_read on public.%I', tbl, tbl);
    execute format(
      'create policy %I_read on public.%I for select to authenticated using (true)',
      tbl, tbl);
    execute format('drop policy if exists %I_write on public.%I', tbl, tbl);
    execute format(
      'create policy %I_write on public.%I for all to authenticated '
      || 'using (team_id = public.current_team_id()) '
      || 'with check (team_id = public.current_team_id())',
      tbl, tbl);
  end loop;
end $$;

-- =====================================================================
-- Realtime - publish the tables the live dashboard subscribes to
-- =====================================================================
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'teams','okrs','objectives','key_results','initiatives','metrics','metric_points'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    exception when duplicate_object then null;  -- already published
    end;
  end loop;
end $$;
