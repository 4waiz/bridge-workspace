-- =====================================================================
-- BRIDGE Flow - OKR: correct the team leader names + set the board order
-- Run AFTER 0002_okr_import_admin.sql. Idempotent.
--
-- Why: seed.sql spelled five of the seven leaders wrong, and the dashboard
-- listed teams in the order they happened to be seeded. okr-seed-data.ts (the
-- generated source for seed.sql) now carries both fixes for a fresh database;
-- this migration applies them to an already-deployed one, which a re-seed
-- would not touch.
--
-- The dashboard reads okrs.owner for the "Team leader" line on each card, and
-- initiatives carry their team leader's name too, so both tables are updated.
--
-- Name corrections:
--   Olaff pane       -> Olaf Penne
--   Ahtesham         -> Ahtesham Siddiqui
--   Sohel shaikh     -> Sohel Shaikh
--   Aurelia Alhajji  -> Aurelia Alhajali
--   Marco Rodregiuez -> Marco Rodriguez
--   (Mateus Rocha and Anoud Alhafedhi were already correct)
-- =====================================================================

-- ---------- Board order: teams.sort_order drives the card order ------
update public.teams set sort_order = v.ord
from (values
  ('agile',               1),
  ('lean-six-sigma',      2),
  ('opex',                3),
  ('industry-5',          4),
  ('ai-analytics',        5),
  ('business-operation',  6),
  ('external-engagement', 7)
) as v(team_key, ord)
where public.teams.key = v.team_key
  and public.teams.sort_order is distinct from v.ord;

-- ---------- Correct the misspellings, wherever they appear -----------
update public.okrs        set owner = 'Olaf Penne'       where owner = 'Olaff pane';
update public.initiatives set owner = 'Olaf Penne'       where owner = 'Olaff pane';

-- 'Ahtesham Akhtar' is listed too: an earlier revision of this migration used
-- that surname, so a database already run against it still lands on the right
-- name here.
update public.okrs        set owner = 'Ahtesham Siddiqui' where owner in ('Ahtesham', 'Ahtesham Akhtar');
update public.initiatives set owner = 'Ahtesham Siddiqui' where owner in ('Ahtesham', 'Ahtesham Akhtar');

update public.okrs        set owner = 'Sohel Shaikh'     where owner = 'Sohel shaikh';
update public.initiatives set owner = 'Sohel Shaikh'     where owner = 'Sohel shaikh';

update public.okrs        set owner = 'Aurelia Alhajali' where owner = 'Aurelia Alhajji';
update public.initiatives set owner = 'Aurelia Alhajali' where owner = 'Aurelia Alhajji';

update public.okrs        set owner = 'Marco Rodriguez'  where owner = 'Marco Rodregiuez';
update public.initiatives set owner = 'Marco Rodriguez'  where owner = 'Marco Rodregiuez';

-- ---------- Backstop: pin each team to its leader by team key --------
-- Catches rows whose owner was blank, or misspelled some other way, so the
-- board never shows an empty "Team leader:" for a team that has an OKR.
update public.okrs o
set owner = m.leader
from (values
  ('agile',               'Mateus Rocha'),
  ('lean-six-sigma',      'Marco Rodriguez'),
  ('opex',                'Ahtesham Siddiqui'),
  ('industry-5',          'Sohel Shaikh'),
  ('ai-analytics',        'Olaf Penne'),
  ('business-operation',  'Aurelia Alhajali'),
  ('external-engagement', 'Anoud Alhafedhi')
) as m(team_key, leader)
join public.teams t on t.key = m.team_key
where o.team_id = t.id
  and coalesce(nullif(trim(o.owner), ''), '') <> m.leader;

update public.initiatives i
set owner = m.leader
from (values
  ('agile',               'Mateus Rocha'),
  ('lean-six-sigma',      'Marco Rodriguez'),
  ('opex',                'Ahtesham Siddiqui'),
  ('industry-5',          'Sohel Shaikh'),
  ('ai-analytics',        'Olaf Penne'),
  ('business-operation',  'Aurelia Alhajali'),
  ('external-engagement', 'Anoud Alhafedhi')
) as m(team_key, leader)
join public.teams t on t.key = m.team_key
where i.team_id = t.id
  and coalesce(nullif(trim(i.owner), ''), '') <> m.leader;
