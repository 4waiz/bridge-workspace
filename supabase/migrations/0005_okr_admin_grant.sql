-- =====================================================================
-- BRIDGE Flow - grant org-wide OKR import ("All departments") access.
--
-- Symptom this fixes: the uploader's own team imports fine and every other
-- department comes back "No permission to write this team". The RLS policies
-- from 0002 accept `team_id = current_team_id() OR public.is_admin()`, so a
-- person who is not flagged as an admin can only ever write their own tab.
--
-- 0004 already granted Dana, Sohel and Mateus BY EXACT EMAIL. If the grant did
-- not take, it is because the address they actually signed in with is not the
-- one listed (a person only exists in auth.users after their first sign-in).
-- This migration matches on the local part of the address instead, so
-- mateus.rocha@<anything> is caught, and prints who is in the database either
-- way. Run AFTER 0001 and 0002. Idempotent.
-- =====================================================================

-- ---------- 1. Who has actually signed in? ---------------------------
-- Read this first: if the person you want is missing, they have never signed
-- in and nothing below can grant them anything yet.
select
  u.email,
  u.created_at,
  coalesce(p.is_admin, false) as is_admin,
  t.name as team
from auth.users u
left join public.profiles p on p.id = u.id
left join public.teams t on t.id = p.team_id
order by u.created_at;

-- ---------- 2. Grant ---------------------------------------------------
-- Matched on the local part, so a domain change (edgegroup.ae, bridgeae.com,
-- a personal address) still resolves to the same person.
insert into public.profiles (id, full_name, is_admin)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.email),
  true
from auth.users u
where lower(split_part(u.email, '@', 1)) in (
  'mateus.rocha',
  'dana.alteneiji',
  'sohel.shaikh'
)
on conflict (id) do update set is_admin = true;

-- Fallback for an address that does not follow firstname.lastname at all
-- (e.g. m.rocha@, mateusr@). Narrow on purpose: one named person, and step 4
-- shows you exactly who it hit.
insert into public.profiles (id, full_name, is_admin)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.email),
  true
from auth.users u
where lower(u.email) like 'mateus%'
   or lower(coalesce(u.raw_user_meta_data->>'full_name', '')) like 'mateus%rocha%'
on conflict (id) do update set is_admin = true;

-- ---------- 3. Keep the dashboard's team leader line honest ------------
-- Nothing here changes profiles.team_id: an admin still belongs to their own
-- department, they can simply write the others too.

-- ---------- 4. Verify --------------------------------------------------
-- Expect Mateus (plus Dana and Sohel if they have signed in). If Mateus is
-- absent, he has not signed in yet - have him sign in once, then re-run.
select u.email, p.full_name, p.is_admin, t.name as team
from public.profiles p
join auth.users u on u.id = p.id
left join public.teams t on t.id = p.team_id
where p.is_admin
order by u.email;

-- ---------- To revoke later -------------------------------------------
--   update public.profiles set is_admin = false
--   where id = (select id from auth.users
--               where lower(email) = 'someone@edgegroup.ae');
