-- =====================================================================
-- BRIDGE Flow - grant OKR admin to Dana and Sohel.
--
-- public.is_admin() (migration 0002) is what lets a person write OKR rows
-- for a team that is not their own. Without it the RLS policies accept only
-- `team_id = current_team_id()`, so "All departments" imports just the
-- uploader's own tab and returns the other six as "skipped".
--
-- Run AFTER 0001 and 0002. Idempotent - re-running changes nothing.
--
-- NOTE: this grants org-wide WRITE access to every team's OKRs. Keep the
-- list short and remove people who no longer need it (see the bottom).
-- =====================================================================

-- A person only appears in auth.users once they have signed in at least
-- once. Anyone listed here who has never signed in is silently skipped -
-- the verification query at the end is what tells you it worked.
insert into public.profiles (id, full_name, is_admin)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.email),
  true
from auth.users u
where lower(u.email) in (
  'dana.alteneiji@edgegroup.ae',
  'sohel.shaikh@edgegroup.ae'
)
on conflict (id) do update set is_admin = true;

-- ---------- Verify ----------------------------------------------------
-- Should list exactly the admins you expect. Run it after the insert.
select u.email, p.is_admin, t.name as team
from public.profiles p
join auth.users u on u.id = p.id
left join public.teams t on t.id = p.team_id
where p.is_admin
order by u.email;

-- ---------- To revoke later ------------------------------------------
--   update public.profiles set is_admin = false
--   where id = (select id from auth.users
--               where lower(email) = 'someone@edgegroup.ae');
