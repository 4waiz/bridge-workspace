-- =====================================================================
-- BRIDGE Flow - OKR: correct the team leader names
-- Run AFTER 0002_okr_import_admin.sql. Idempotent.
--
-- Why: seed.sql spelled five of the seven leaders wrong. seed.sql now carries
-- the corrected names for a fresh database; this migration fixes the rows in an
-- already-deployed one, which a re-seed would not touch.
--
-- The dashboard reads okrs.owner for the "Team leader" line on each card, and
-- initiatives carry their team leader's name too, so both tables are updated.
--
-- Corrections:
--   Olaff pane       -> Olaf Penne
--   Ahtesham         -> Ahtesham Akhtar
--   Sohel shaikh     -> Sohel Shaikh
--   Aurelia Alhajji  -> Aurelia Alhajali
--   Marco Rodregiuez -> Marco Rodriguez
--   (Mateus Rocha and Anoud Alhafedhi were already correct)
-- =====================================================================

-- ---------- Correct the misspellings, wherever they appear -----------
update public.okrs        set owner = 'Olaf Penne'      where owner = 'Olaff pane';
update public.initiatives set owner = 'Olaf Penne'      where owner = 'Olaff pane';

update public.okrs        set owner = 'Ahtesham Akhtar' where owner = 'Ahtesham';
update public.initiatives set owner = 'Ahtesham Akhtar' where owner = 'Ahtesham';

update public.okrs        set owner = 'Sohel Shaikh'    where owner = 'Sohel shaikh';
update public.initiatives set owner = 'Sohel Shaikh'    where owner = 'Sohel shaikh';

update public.okrs        set owner = 'Aurelia Alhajali' where owner = 'Aurelia Alhajji';
update public.initiatives set owner = 'Aurelia Alhajali' where owner = 'Aurelia Alhajji';

update public.okrs        set owner = 'Marco Rodriguez' where owner = 'Marco Rodregiuez';
update public.initiatives set owner = 'Marco Rodriguez' where owner = 'Marco Rodregiuez';

-- ---------- Backstop: pin each team to its leader by team key --------
-- Catches rows whose owner was blank, or misspelled some other way, so the
-- board never shows an empty "Team leader:" for a team that has an OKR.
update public.okrs o
set owner = m.leader
from (values
  ('agile',               'Mateus Rocha'),
  ('ai-analytics',        'Olaf Penne'),
  ('opex',                'Ahtesham Akhtar'),
  ('industry-5',          'Sohel Shaikh'),
  ('business-operation',  'Aurelia Alhajali'),
  ('lean-six-sigma',      'Marco Rodriguez'),
  ('external-engagement', 'Anoud Alhafedhi')
) as m(team_key, leader)
join public.teams t on t.key = m.team_key
where o.team_id = t.id
  and coalesce(nullif(trim(o.owner), ''), '') <> m.leader;

update public.initiatives i
set owner = m.leader
from (values
  ('agile',               'Mateus Rocha'),
  ('ai-analytics',        'Olaf Penne'),
  ('opex',                'Ahtesham Akhtar'),
  ('industry-5',          'Sohel Shaikh'),
  ('business-operation',  'Aurelia Alhajali'),
  ('lean-six-sigma',      'Marco Rodriguez'),
  ('external-engagement', 'Anoud Alhafedhi')
) as m(team_key, leader)
join public.teams t on t.key = m.team_key
where i.team_id = t.id
  and coalesce(nullif(trim(i.owner), ''), '') <> m.leader;
