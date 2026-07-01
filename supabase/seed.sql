-- =====================================================================
-- BRIDGE Flow — OKR dashboard seed data (status / progress model)
-- Run AFTER 0001_okr_dashboard.sql. Idempotent.
-- Status is derived from objective progress %:  >=70 on-track (green),
-- >=50 at-risk (yellow), <50 off-track (red).
-- =====================================================================

-- ---------- The 6 fixed teams ----------------------------------------
insert into public.teams (key, name, accent, sort_order) values
  ('agile',        'Agile',               '#4c6ef5', 1),
  ('lean',         'Lean',                '#2eb85c', 2),
  ('six-sigma',    'Six Sigma',           '#f15a29', 3),
  ('industry-5',   'Industry 5.0',        '#16191f', 4),
  ('ai',           'AI',                  '#9b5de5', 5),
  ('business-ops', 'Business Operations', '#f5a623', 6)
on conflict (key) do update
  set name = excluded.name, accent = excluded.accent, sort_order = excluded.sort_order;

-- ---------- Backfill profiles for users created before the trigger ---
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', u.email)
from auth.users u
on conflict (id) do nothing;

-- ---------- One OKR + 3 objectives (with progress) per team ----------
-- Objective titles + values are lifted from the reference dashboard so the
-- board looks alive immediately. Everything here is editable in the app.
do $$
declare
  okr uuid;
  seed_data jsonb := '[
    {"team":"agile",        "objs":[["Speed up value delivery",78],["Reduce tech debt",82],["Agile culture adoption",74]]},
    {"team":"lean",         "objs":[["Reduce recurring op. costs",83],["Critical process SLA",86],["Processes mapped & optimised",77]]},
    {"team":"six-sigma",    "objs":[["Lean projects completed",58],["Black/Green Belts certified",60],["Validated financial savings",56]]},
    {"team":"industry-5",   "objs":[["Pilot advanced manufacturing",25],["Approved investment executed",45],["Employees upskilled",44]]},
    {"team":"ai",           "objs":[["Scale generative AI in ops",55],["Real-time data pipelines",60],["Teams trained in AI tools",57]]},
    {"team":"business-ops", "objs":[["Improve op. predictability",80],["Approval cycle time",75],["Internal stakeholder satisfaction",68]]}
  ]'::jsonb;
  row jsonb;
  team_row public.teams;
  obj jsonb;
  pos int;
begin
  for row in select * from jsonb_array_elements(seed_data) loop
    select * into team_row from public.teams where key = (row->>'team');
    if not found then continue; end if;

    insert into public.okrs (team_id, quarter, year, area, owner, focus_note)
    values (team_row.id, 'Q3', 2026, 'Excellence Department', team_row.name,
            'Focus on the results that drive the biggest impact.')
    on conflict (team_id, quarter, year) do update set area = excluded.area
    returning id into okr;

    delete from public.objectives where okr_id = okr;

    pos := 1;
    for obj in select * from jsonb_array_elements(row->'objs') loop
      insert into public.objectives (okr_id, team_id, position, title, progress)
      values (okr, team_row.id, pos, (obj->>0), (obj->>1)::int);
      pos := pos + 1;
    end loop;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- To put yourself on a team so you can EDIT its OKR, run (with your email):
--   update public.profiles set team_id = (select id from public.teams where key = 'agile')
--   where id = (select id from auth.users where email = 'you@example.com');
-- (The in-app department picker also sets this for you.)
-- ---------------------------------------------------------------------
