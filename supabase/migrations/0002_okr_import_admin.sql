-- =====================================================================
-- BRIDGE Flow — OKR Excel import: admin write policy + template storage
-- Run AFTER 0001_okr_dashboard.sql. Idempotent.
--
-- Why: the Excel template is an ORG-WIDE file (all teams). A normal user can
-- only write their own team (RLS from 0001). To let an admin upload the whole
-- workbook and regenerate every team's dashboard, we add an is_admin bypass to
-- the team-owned write policies, plus a public Storage bucket that holds the
-- downloadable template ("put it in the database").
-- =====================================================================

-- ---------- Helper: is the current user an admin? --------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  )
$$;

-- ---------- Team-owned tables: WRITE own team OR (admin => any team) --
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'okrs','objectives','key_results','initiatives','metrics','metric_points'
  ] loop
    execute format('drop policy if exists %I_write on public.%I', tbl, tbl);
    execute format(
      'create policy %I_write on public.%I for all to authenticated '
      || 'using (team_id = public.current_team_id() or public.is_admin()) '
      || 'with check (team_id = public.current_team_id() or public.is_admin())',
      tbl, tbl);
  end loop;
end $$;

-- ---------- Make yourself an admin (edit the email, then run) ---------
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');
-- Only admins can import the whole workbook; everyone else imports/edits just
-- their own team's section.

-- =====================================================================
-- Storage bucket for the downloadable Excel template
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('okr-templates', 'okr-templates', true)
on conflict (id) do update set public = true;

-- public can read the template; any signed-in user can (re)upload it
drop policy if exists okr_templates_read on storage.objects;
create policy okr_templates_read on storage.objects
  for select to public using (bucket_id = 'okr-templates');

drop policy if exists okr_templates_insert on storage.objects;
create policy okr_templates_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'okr-templates');

drop policy if exists okr_templates_update on storage.objects;
create policy okr_templates_update on storage.objects
  for update to authenticated using (bucket_id = 'okr-templates');
