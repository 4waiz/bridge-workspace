-- =====================================================================
-- BRIDGE Flow - give Key Results real NUMBERS.
--
-- Until now a KR only carried `target_text`, a rendered sentence like
--   "Target 20 count · now 8 (baseline 0)"
-- so the numbers behind the dashboard existed only in the Excel workbook.
-- That made the round trip impossible: a slider wrote a typed percentage
-- with no Current/Target behind it, so nothing could be written back into
-- an Excel cell that computes =Current/Target.
--
-- After this migration the DB holds the same four numbers the workbook
-- holds, objective progress is DERIVED from them, and edits flow both
-- ways without either side inventing a value.
--
-- Safe to re-run. Run AFTER 0001 and 0002.
-- =====================================================================

alter table public.key_results
  add column if not exists unit     text,
  add column if not exists baseline numeric,
  add column if not exists target   numeric,
  add column if not exists current  numeric;

-- ---------- Backfill from the rendered target_text --------------------
-- Only touches rows that have not been given numbers yet, so re-running
-- this migration never clobbers real edits.
update public.key_results
set
  target = nullif(
    (regexp_match(target_text, 'Target[[:space:]]+(-?[0-9]+(?:\.[0-9]+)?)'))[1], ''
  )::numeric,
  current = nullif(
    (regexp_match(target_text, 'now[[:space:]]+(-?[0-9]+(?:\.[0-9]+)?)'))[1], ''
  )::numeric,
  baseline = nullif(
    (regexp_match(target_text, 'baseline[[:space:]]+(-?[0-9]+(?:\.[0-9]+)?)'))[1], ''
  )::numeric,
  unit = nullif(
    btrim((regexp_match(target_text, 'Target[[:space:]]+-?[0-9]+(?:\.[0-9]+)?[[:space:]]*([^·]*)'))[1]),
    ''
  )
where target_text is not null
  and target is null;

-- ---------- Keep target_text in step with the numbers -----------------
-- target_text stays as the human-readable label the drill-down shows, but
-- it is now DERIVED: the numbers are the source of truth. This trigger
-- rewrites it on every insert/update so the two can never disagree.
create or replace function public.kr_render_target_text()
returns trigger
language plpgsql
as $$
declare u text;
begin
  if new.target is null and new.current is null and new.baseline is null then
    return new;  -- text-only KR (nothing numeric to render)
  end if;
  u := case when coalesce(new.unit, '') = '' then '' else ' ' || new.unit end;
  new.target_text :=
    'Target ' || coalesce(new.target::text, '?') || u ||
    ' · now ' || coalesce(new.current::text, '0') || u ||
    ' (baseline ' || coalesce(new.baseline::text, '0') || u || ')';
  return new;
end $$;

drop trigger if exists kr_render_target_text on public.key_results;
create trigger kr_render_target_text
  before insert or update on public.key_results
  for each row execute function public.kr_render_target_text();

-- ---------- Progress helper (mirrors krProgress() in TypeScript) ------
-- Current / Target, clamped to 0..100 for the objectives.progress column.
-- The Excel workbook deliberately does NOT clamp, so a KR beating its
-- target reads 125% there and 100% here.
create or replace function public.kr_progress(
  p_target numeric, p_current numeric
) returns int
language sql
immutable
as $$
  select greatest(0, least(100, round(
    case
      when p_target is null then 0
      when p_target = 0 then case when coalesce(p_current, 0) > 0 then 100 else 0 end
      else coalesce(p_current, 0) / p_target * 100
    end
  )))::int
$$;

-- ---------- Recompute objectives.progress from a KR change ------------
-- objectives.progress becomes the mean of its KRs' progress whenever the
-- objective HAS numeric KRs. Objectives without them keep whatever was
-- typed, so nothing that predates this migration is wiped.
create or replace function public.objective_sync_progress()
returns trigger
language plpgsql
as $$
declare
  oid uuid := coalesce(new.objective_id, old.objective_id);
  avg_progress int;
begin
  select round(avg(public.kr_progress(target, current)))::int
    into avg_progress
  from public.key_results
  where objective_id = oid and target is not null;

  if avg_progress is not null then
    update public.objectives
      set progress = avg_progress, updated_at = now()
    where id = oid and progress is distinct from avg_progress;
  end if;

  return null;
end $$;

drop trigger if exists kr_sync_objective_progress on public.key_results;
create trigger kr_sync_objective_progress
  after insert or update or delete on public.key_results
  for each row execute function public.objective_sync_progress();

-- ---------- Backfill objective progress from the new numbers ----------
update public.objectives o
set progress = sub.avg_progress
from (
  select objective_id, round(avg(public.kr_progress(target, current)))::int as avg_progress
  from public.key_results
  where target is not null
  group by objective_id
) sub
where o.id = sub.objective_id
  and o.progress is distinct from sub.avg_progress;
