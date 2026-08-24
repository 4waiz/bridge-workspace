-- =====================================================================
-- BRIDGE Flow - Business Ops Dashboard: the full-screen overlay image
-- Run AFTER 0003_owner_names.sql. Idempotent.
--
-- The OKR dashboard runs unattended on a wall screen and alternates every 30
-- seconds between the OKR board and one full-screen image. That image is
-- swapped from the OKR editor ("Business Ops Dashboard" panel), so it has to
-- live server-side rather than in the bundle: the file goes to Storage and the
-- row below points at whichever upload is current.
--
-- Single row by construction (id is fixed to 'current' by a check), so the
-- dashboard can select it without ordering and realtime carries every change.
-- =====================================================================

create table if not exists public.business_ops_overlay (
  id          text primary key default 'current' check (id = 'current'),
  image_path  text,                       -- path inside the business-ops bucket
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

insert into public.business_ops_overlay (id) values ('current')
on conflict (id) do nothing;

alter table public.business_ops_overlay enable row level security;

-- Everyone signed in sees the same overlay; anyone signed in can swap it (the
-- panel that does so is behind a passphrase in the editor UI).
drop policy if exists business_ops_overlay_read on public.business_ops_overlay;
create policy business_ops_overlay_read on public.business_ops_overlay
  for select to authenticated using (true);

drop policy if exists business_ops_overlay_write on public.business_ops_overlay;
create policy business_ops_overlay_write on public.business_ops_overlay
  for update to authenticated using (true) with check (true);

drop policy if exists business_ops_overlay_insert on public.business_ops_overlay;
create policy business_ops_overlay_insert on public.business_ops_overlay
  for insert to authenticated with check (true);

-- ---------- Storage bucket for the overlay images --------------------
-- Public so the wall screen can render the image straight from its URL.
insert into storage.buckets (id, name, public)
values ('business-ops', 'business-ops', true)
on conflict (id) do update set public = true;

drop policy if exists business_ops_read on storage.objects;
create policy business_ops_read on storage.objects
  for select to public using (bucket_id = 'business-ops');

drop policy if exists business_ops_insert on storage.objects;
create policy business_ops_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'business-ops');

drop policy if exists business_ops_update on storage.objects;
create policy business_ops_update on storage.objects
  for update to authenticated using (bucket_id = 'business-ops');

drop policy if exists business_ops_delete on storage.objects;
create policy business_ops_delete on storage.objects
  for delete to authenticated using (bucket_id = 'business-ops');

-- ---------- Realtime so the wall screen swaps without a reload -------
do $$
begin
  alter publication supabase_realtime add table public.business_ops_overlay;
exception when duplicate_object then null;
end $$;
