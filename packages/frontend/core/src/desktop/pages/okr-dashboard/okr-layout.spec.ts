import { describe, expect, test } from 'vitest';

import { columnSpans, gridColumns } from './dashboard';
import { editableToFullObjective } from './okr-data';

/**
 * The wall board must never show an empty cell: seven teams plus the three
 * summary panels used to lay out as 6 + 4, leaving two holes bottom-right.
 */
describe('board grid', () => {
  test('7 teams + 3 panels lay out as two full rows of five', () => {
    expect(gridColumns(10)).toBe(5);
    expect(columnSpans(10, 5)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });

  test('a last row that does not divide evenly stretches to the edge', () => {
    const cols = gridColumns(11);
    const spans = columnSpans(11, cols);
    // every row, including the last, covers exactly `cols` columns
    const lastRow = spans.slice(spans.length - (11 % cols || cols));
    expect(lastRow.reduce((s, n) => s + n, 0)).toBe(cols);
  });

  test('every card count from 5 to 24 fills its rows', () => {
    for (let n = 5; n <= 24; n++) {
      const cols = gridColumns(n);
      const total = columnSpans(n, cols).reduce((s, x) => s + x, 0);
      expect(total % cols).toBe(0);
    }
  });
});

describe('editableToFullObjective', () => {
  test('carries the KR numbers and derives progress from them', () => {
    const full = editableToFullObjective(
      {
        title: 'Scale technical learning',
        progress: 0,
        keyResults: [
          {
            description: 'Bootcamp waves',
            unit: '',
            baseline: 0,
            target: 2,
            current: 1,
          },
          { description: '   ', unit: '', baseline: 0, target: 4, current: 4 },
        ],
        initiatives: [
          'Engineer Bootcamp Wave 2',
          '',
          'Engineer Bootcamp Wave 2',
        ],
      },
      'Marco Rodriguez'
    );

    // blank descriptions are dropped, so only the first KR survives
    expect(full.keyResults).toHaveLength(1);
    expect(full.keyResults[0]).toMatchObject({ target: 2, current: 1 });
    expect(full.keyResults[0].target_text).toContain('Target 2');
    // 1 of 2 → 50%, which beats the typed 0
    expect(full.progress).toBe(50);
    // duplicate + empty initiatives collapse to one, owned by the team leader
    expect(full.initiatives).toEqual([
      { description: 'Engineer Bootcamp Wave 2', owner: 'Marco Rodriguez' },
    ]);
  });
});
