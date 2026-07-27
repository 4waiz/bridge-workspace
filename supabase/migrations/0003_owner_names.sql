-- =====================================================================
-- BRIDGE Flow - OKR: consolidate team leaders onto the four real owners
-- Run AFTER 0002_okr_import_admin.sql. Idempotent.
--
-- Why: seed.sql carried seven placeholder owner names, two of them misspelled
-- ("Marco Rodregiuez", "Sohel shaikh"). The department is actually led by four
-- people, so three teams move to an existing leader. seed.sql now produces
-- these names for a fresh database; this migration fixes the rows already in a
-- deployed one, which a re-seed would not touch.
--
-- The dashboard reads okrs.owner for the "Team leader" line, and initiatives
-- carry their team leader's name too, so both tables are updated.
--
-- Final mapping (team key -> leader):
--   agile               -> Mateus Rocha
--   ai-analytics        -> Sohel Shaikh      (was Olaff pane)
--   opex                -> Marco Rodriguez   (was Ahtesham)
--   industry-5          -> Sohel Shaikh      (spelling)
--   business-operation  -> Mateus Rocha      (was Aurelia Alhajji)
--   lean-six-sigma      -> Marco Rodriguez   (spelling)
--   external-engagement -> Anoud Alhafedhi
-- =====================================================================

-- ---------- Fix the two misspellings, wherever they appear -----------
update public.okrs        set owner = 'Marco Rodriguez' where owner = 'Marco Rodregiuez';
update public.initiatives set owner = 'Marco Rodriguez' where owner = 'Marco Rodregiuez';

update public.okrs        set owner = 'Sohel Shaikh'    where owner = 'Sohel shaikh';
update public.initiatives set owner = 'Sohel Shaikh'    where owner = 'Sohel shaikh';

-- ---------- Retire the three placeholder leaders ---------------------
update public.okrs        set owner = 'Sohel Shaikh'    where owner = 'Olaff pane';
update public.initiatives set owner = 'Sohel Shaikh'    where owner = 'Olaff pane';

update public.okrs        set owner = 'Marco Rodriguez' where owner = 'Ahtesham';
update public.initiatives set owner = 'Marco Rodriguez' where owner = 'Ahtesham';

update public.okrs        set owner = 'Mateus Rocha'    where owner = 'Aurelia Alhajji';
update public.initiatives set owner = 'Mateus Rocha'    where owner = 'Aurelia Alhajji';

-- ---------- Backstop: pin each team to its leader by team key --------
-- Catches rows whose owner was blank, or edited to something else entirely, so
-- the board never shows an empty "Team leader:" for a team that has an OKR.
update public.okrs o
set owner = m.leader
from (values
  ('agile',               'Mateus Rocha'),
  ('ai-analytics',        'Sohel Shaikh'),
  ('opex',                'Marco Rodriguez'),
  ('industry-5',          'Sohel Shaikh'),
  ('business-operation',  'Mateus Rocha'),
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
  ('ai-analytics',        'Sohel Shaikh'),
  ('opex',                'Marco Rodriguez'),
  ('industry-5',          'Sohel Shaikh'),
  ('business-operation',  'Mateus Rocha'),
  ('lean-six-sigma',      'Marco Rodriguez'),
  ('external-engagement', 'Anoud Alhafedhi')
) as m(team_key, leader)
join public.teams t on t.key = m.team_key
where i.team_id = t.id
  and coalesce(nullif(trim(i.owner), ''), '') <> m.leader;
