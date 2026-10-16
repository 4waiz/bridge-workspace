import { afterEach, describe, expect, test } from 'vitest';

import {
  activeOkr,
  fetchDashboardModel,
  quarterDay,
  quarterExpectedPct,
  quarterOf,
  statusFromProgress,
} from './okr-data';

/** Noon, local time - well clear of any midnight a time zone could shift. */
const on = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day, 12);

describe('the OKR period follows the calendar', () => {
  test('quarters run Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec', () => {
    expect(quarterOf(on(2026, 1, 1))).toEqual({ quarter: 'Q1', year: 2026 });
    expect(quarterOf(on(2026, 3, 31))).toEqual({ quarter: 'Q1', year: 2026 });
    expect(quarterOf(on(2026, 7, 1))).toEqual({ quarter: 'Q3', year: 2026 });
    expect(quarterOf(on(2026, 10, 16))).toEqual({ quarter: 'Q4', year: 2026 });
    expect(quarterOf(on(2026, 12, 31))).toEqual({ quarter: 'Q4', year: 2026 });
  });

  test('the pace benchmark restarts with the quarter', () => {
    // 15.5 of Q4's 92 days gone by midday on 16 October.
    expect(quarterExpectedPct('Q4', 2026, on(2026, 10, 16))).toBe(17);
    expect(quarterDay('Q4', 2026, on(2026, 10, 16))).toEqual({
      day: 16,
      days: 92,
    });
    // What a hard-coded Q3 asked for in October: a quarter already over.
    expect(quarterExpectedPct('Q3', 2026, on(2026, 10, 16))).toBe(100);
  });

  test('progress is judged against the new pace', () => {
    expect(statusFromProgress(32, 17)).toBe('on_track');
    expect(statusFromProgress(12, 17)).toBe('at_risk');
    expect(statusFromProgress(32, 100)).toBe('off_track');
  });
});

describe('activeOkr', () => {
  const okr = (quarter: string, year: number) => ({
    id: `${quarter}-${year}`,
    quarter,
    year,
  });

  test("carries last quarter's OKR forward until this one has its own", () => {
    expect(activeOkr([okr('Q3', 2026)], 'Q4', 2026)?.id).toBe('Q3-2026');
    expect(activeOkr([okr('Q3', 2026), okr('Q4', 2026)], 'Q4', 2026)?.id).toBe(
      'Q4-2026'
    );
  });

  test('takes the latest earlier quarter, across a year boundary', () => {
    expect(activeOkr([okr('Q3', 2026), okr('Q4', 2026)], 'Q1', 2027)?.id).toBe(
      'Q4-2026'
    );
    expect(activeOkr([okr('Q4', 2025), okr('Q2', 2026)], 'Q4', 2026)?.id).toBe(
      'Q2-2026'
    );
  });

  test('a quarter set up ahead of time is not live yet', () => {
    expect(activeOkr([okr('Q4', 2026), okr('Q1', 2027)], 'Q4', 2026)?.id).toBe(
      'Q4-2026'
    );
    expect(activeOkr([okr('Q1', 2027)], 'Q4', 2026)).toBeNull();
    expect(activeOkr([], 'Q4', 2026)).toBeNull();
  });
});

// ---- the dashboard model, over an in-memory Supabase ----------------------
type Row = Record<string, any>;

/** A supabase-js query: awaitable for its rows, chainable until then. */
interface FakeQuery extends Promise<{ data: Row[]; error: null }> {
  select: () => FakeQuery;
  order: (key: string) => FakeQuery;
}

/** Just the query surface fetchDashboardModel uses. */
function fakeSupabase(tables: Record<string, Row[]>) {
  const query = (rows: Row[]): FakeQuery =>
    Object.assign(Promise.resolve({ data: rows, error: null }), {
      select: () => query(rows),
      order: (key: string) =>
        query([...rows].sort((a, b) => (a[key] ?? 0) - (b[key] ?? 0))),
    });
  return {
    from: (table: string) => query(tables[table] ?? []),
    channel: () => ({}),
    removeChannel: () => {},
    auth: { getUser: async () => ({ data: { user: null } }) },
  };
}

/** The period `n` quarters away from the current one. */
function shift(n: number): { quarter: string; year: number } {
  const now = quarterOf();
  const i = now.year * 4 + Number(now.quarter.slice(1)) - 1 + n;
  return { quarter: `Q${(i % 4) + 1}`, year: Math.floor(i / 4) };
}

describe('fetchDashboardModel', () => {
  afterEach(() => {
    delete (globalThis as any).__bridgeSupabase;
  });

  test('shows each team only the OKR it is working to now', async () => {
    const now = shift(0);
    const last = shift(-1);
    (globalThis as any).__bridgeSupabase = fakeSupabase({
      teams: [
        { id: 'agile', key: 'agile', name: 'Agile', sort_order: 0 },
        { id: 'opex', key: 'opex', name: 'Opex', sort_order: 1 },
      ],
      okrs: [
        // Agile has started the new quarter; Opex has not yet.
        { id: 'agile-last', team_id: 'agile', ...last, owner: 'Old lead' },
        { id: 'agile-now', team_id: 'agile', ...now, owner: 'Mateus Rocha' },
        { id: 'opex-last', team_id: 'opex', ...last, owner: 'Ahtesham' },
      ],
      objectives: [
        {
          id: 'a1',
          okr_id: 'agile-last',
          team_id: 'agile',
          position: 1,
          progress: 90,
        },
        {
          id: 'a2',
          okr_id: 'agile-now',
          team_id: 'agile',
          position: 1,
          progress: 20,
        },
        {
          id: 'o1',
          okr_id: 'opex-last',
          team_id: 'opex',
          position: 1,
          progress: 54,
        },
      ],
    });

    const model = await fetchDashboardModel();
    const [agile, opex] = model.teams;

    // The new quarter's objectives replace the old ones, never sit beside them.
    expect(agile.objectives.map(o => o.id)).toEqual(['a2']);
    expect(agile.owner).toBe('Mateus Rocha');
    // Not started yet: last quarter carries on, its progress untouched.
    expect(opex.objectives.map(o => o.id)).toEqual(['o1']);
    expect(opex.progress).toBe(54);
    expect(opex.owner).toBe('Ahtesham');
    expect(model.overall).toBe(37);
  });
});
