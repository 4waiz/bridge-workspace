/**
 * Tiny, dependency-light .xlsx read/write for the BRIDGE XPI OKR tracker.
 *
 * Uses jszip (already in the monorepo) for the zip container and hand-rolled
 * OOXML for the parts we need - no SheetJS/ExcelJS. Text cells are written as
 * inline strings (valid OOXML, read by Excel / Sheets / LibreOffice) so we
 * don't have to maintain a sharedStrings table on the way out.
 *
 *  - buildOkrWorkbook()  -> Uint8Array   (browser + Node; the Download template)
 *  - parseOkrWorkbook()  -> ParsedWorkbook (browser; the Upload importer)
 *
 * The parser only reads the "OKRs" sheet and is tolerant of column order,
 * shared vs. inline strings, and rows re-saved by Excel/Google Sheets.
 */
import JSZip from 'jszip';

import {
  krProgress,
  objectiveProgress,
  OKR_QUARTER,
  OKR_QUARTER_LABEL,
  OKR_TEAMS,
  OKR_YEAR,
  type SeedTeam,
  type SeedTeamOkr,
} from './okr-seed-data';

// ---- pace-based status (kept local to avoid an import cycle with okr-data.ts,
//      which imports THIS module). Mirrors okr-data.ts statusFromProgress:
//      status compares progress against how far into the quarter we are. ----
/** Fraction (0..100) of the current quarter elapsed today. */
function quarterExpectedPct(now: Date = new Date()): number {
  const q = parseInt(String(OKR_QUARTER).replace(/\D/g, ''), 10) || 1;
  const startMonth = (q - 1) * 3;
  const start = new Date(OKR_YEAR, startMonth, 1).getTime();
  const end = new Date(OKR_YEAR, startMonth + 3, 1).getTime();
  if (end <= start) return 0;
  const frac = (now.getTime() - start) / (end - start);
  return Math.max(0, Math.min(100, Math.round(frac * 100)));
}

function statusLabelFor(
  progress: number,
  expected: number = quarterExpectedPct()
): string {
  if (progress >= expected) return 'On Track';
  if (progress >= expected - 25) return 'At Risk';
  return 'Off Track';
}

// The 15 columns of the OKRs sheet, in order.
export const OKR_COLUMNS = [
  'Team',
  'Quarter',
  'Objective #',
  'Objective Description',
  'KR #',
  'KR Description',
  'Unit',
  'Baseline',
  'Target',
  'Current Value',
  'Progress (%)',
  'Status',
  'Initiatives',
  'Owner',
  'Comments',
] as const;

// ===========================================================================
// WRITE
// ===========================================================================

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colLetter(n: number): string {
  // 1 -> A, 26 -> Z, 27 -> AA
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

type CellValue = string | number | null | undefined;

function cellXml(ref: string, value: CellValue, style?: number): string {
  const s = style ? ` s="${style}"` : '';
  if (value === null || value === undefined || value === '') {
    return `<c r="${ref}"${s}/>`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}"${s}><v>${value}</v></c>`;
  }
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${escapeXml(
    String(value)
  )}</t></is></c>`;
}

/** Build one <row> from a flat array of cell values (col A = index 0). */
function rowXml(
  rowIndex: number,
  values: CellValue[],
  headerRow = false
): string {
  const cells = values
    .map((v, i) =>
      cellXml(`${colLetter(i + 1)}${rowIndex}`, v, headerRow ? 1 : undefined)
    )
    .join('');
  return `<row r="${rowIndex}">${cells}</row>`;
}

function sheetXml(
  rows: string[],
  cols?: { min: number; max: number; width: number }[],
  freezeHeader = false
): string {
  const colsXml = cols?.length
    ? `<cols>${cols
        .map(
          c =>
            `<col min="${c.min}" max="${c.max}" width="${c.width}" customWidth="1"/>`
        )
        .join('')}</cols>`
    : '';
  const views = freezeHeader
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${views}${colsXml}<sheetData>${rows.join(
    ''
  )}</sheetData></worksheet>`;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

function instructionsRows(teams: SeedTeam[]): string[] {
  const lines: CellValue[][] = [
    [`BRIDGE XPI - OKR Tracker - ${OKR_QUARTER_LABEL}`],
    [''],
    ['How to fill in this file'],
    ["1. Go to the 'OKRs' tab - that is the only sheet you need to edit."],
    ['2. Each row is ONE Key Result (KR). One Objective with 3 KRs = 3 rows.'],
    [
      '3. Fill in: Objective Description, KR Description, Unit, Baseline, Target, Current Value, Initiatives, Owner.',
    ],
    ["4. Leave 'Progress (%)' and 'Status' - they are recomputed on upload."],
    [
      '5. Up to 3 Objectives per team and 3 KRs per Objective (rows are pre-created for every team).',
    ],
    [
      "6. Update 'Current Value' whenever you have a new number (suggested cadence: bi-weekly or monthly).",
    ],
    [
      '7. Upload this file in the OKR editor (Upload & import) to regenerate the dashboard.',
    ],
    [''],
    ['How Status is calculated'],
    [
      'Progress (%) = (Current Value − Baseline) / (Target − Baseline), capped 0–100%.',
    ],
    [
      'A Current Value of 0 counts as "not measured yet" (0%). Beating the target caps at 100%.',
    ],
    [
      'Status is PACE-based: it compares Progress with how far into the quarter we are',
    ],
    ['(month 1 ≈ 33%, month 2 ≈ 66%, end ≈ 100%).'],
    ['Green  - On Track:   at or ahead of the expected pace'],
    ['Yellow - At Risk:    up to 25 points behind pace'],
    ['Red    - Off Track:  more than 25 points behind pace'],
    [''],
    ['Teams in this tracker'],
    [teams.map(t => t.name).join('  |  ')],
    [''],
    [
      'Tip: keep the Dashboard tab open on a TV - it reflects the latest upload.',
    ],
  ];
  return lines.map((v, i) => rowXml(i + 1, v, i === 0));
}

function dashboardRows(demo: SeedTeamOkr[], teams: SeedTeam[]): string[] {
  const rows: string[] = [];
  rows.push(rowXml(1, [`BRIDGE XPI - OKRs ${OKR_QUARTER_LABEL}`], true));
  const header = [
    'Team',
    'Status',
    'Overall Progress',
    'Objective 1',
    '% Obj 1',
    'Objective 2',
    '% Obj 2',
    'Objective 3',
    '% Obj 3',
  ];
  rows.push(rowXml(3, header, true));
  let r = 4;
  for (const team of teams) {
    const d = demo.find(x => x.key === team.key);
    const objs = d?.objectives ?? [];
    const progs = objs.map(o => objectiveProgress(o));
    const overall = progs.length
      ? Math.round(progs.reduce((s, p) => s + p, 0) / progs.length)
      : 0;
    rows.push(
      rowXml(r++, [
        team.name,
        statusLabelFor(overall),
        overall,
        objs[0]?.title ?? '',
        progs[0] ?? '',
        objs[1]?.title ?? '',
        progs[1] ?? '',
        objs[2]?.title ?? '',
        progs[2] ?? '',
      ])
    );
  }
  return rows;
}

function okrsRows(demo: SeedTeamOkr[], teams: SeedTeam[]): string[] {
  const rows: string[] = [rowXml(1, [...OKR_COLUMNS], true)];
  let r = 2;
  for (const team of teams) {
    const d = demo.find(x => x.key === team.key);
    const objectives = d?.objectives ?? [];
    for (let oi = 0; oi < objectives.length; oi++) {
      const obj = objectives[oi];
      for (let ki = 0; ki < obj.keyResults.length; ki++) {
        const kr = obj.keyResults[ki];
        const p = krProgress(kr);
        rows.push(
          rowXml(r++, [
            team.name, // Team
            OKR_QUARTER_LABEL, // Quarter
            oi + 1, // Objective #
            obj.title, // Objective Description
            ki + 1, // KR #
            kr.description, // KR Description
            kr.unit, // Unit
            kr.baseline, // Baseline
            kr.target, // Target
            kr.current, // Current Value
            p, // Progress (%)
            statusLabelFor(p), // Status
            kr.initiative, // Initiatives
            kr.owner, // Owner
            '', // Comments
          ])
        );
      }
    }
  }
  return rows;
}

/**
 * Build the 3-sheet workbook (Instructions / Dashboard / OKRs). Returns raw
 * xlsx bytes usable in the browser (wrap in Blob) or Node (write to disk).
 */
export async function buildOkrWorkbook(
  demo: SeedTeamOkr[],
  teams: SeedTeam[] = OKR_TEAMS
): Promise<Uint8Array> {
  const zip = new JSZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
  );

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );

  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
<sheet name="Instructions" sheetId="1" r:id="rId1"/>
<sheet name="Dashboard" sheetId="2" r:id="rId2"/>
<sheet name="OKRs" sheetId="3" r:id="rId3"/>
</sheets>
</workbook>`
  );

  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );

  zip.file('xl/styles.xml', STYLES_XML);
  zip.file(
    'xl/worksheets/sheet1.xml',
    sheetXml(instructionsRows(teams), [{ min: 1, max: 1, width: 96 }])
  );
  zip.file(
    'xl/worksheets/sheet2.xml',
    sheetXml(
      dashboardRows(demo, teams),
      [
        { min: 1, max: 1, width: 34 },
        { min: 2, max: 3, width: 16 },
        { min: 4, max: 8, width: 30 },
      ],
      true
    )
  );
  zip.file(
    'xl/worksheets/sheet3.xml',
    sheetXml(
      okrsRows(demo, teams),
      [
        { min: 1, max: 1, width: 34 },
        { min: 2, max: 2, width: 10 },
        { min: 3, max: 5, width: 11 },
        { min: 4, max: 4, width: 34 },
        { min: 6, max: 6, width: 40 },
        { min: 7, max: 7, width: 10 },
        { min: 8, max: 11, width: 12 },
        { min: 12, max: 12, width: 11 },
        { min: 13, max: 13, width: 34 },
        { min: 14, max: 15, width: 18 },
      ],
      true
    )
  );

  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

// ===========================================================================
// READ
// ===========================================================================

export interface ParsedKeyResult {
  description: string;
  unit: string;
  baseline: number;
  target: number;
  current: number;
  initiative: string;
  owner: string;
  comment: string;
  progress: number;
}
export interface ParsedObjective {
  number: number;
  title: string;
  keyResults: ParsedKeyResult[];
  progress: number;
}
export interface ParsedTeamOkr {
  teamName: string;
  quarter: string;
  owner: string;
  objectives: ParsedObjective[];
}
export interface ParsedWorkbook {
  teams: ParsedTeamOkr[];
  warnings: string[];
}

function text(el: Element | null | undefined): string {
  return (el?.textContent ?? '').trim();
}

function normHeader(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// header label -> our canonical field key
const HEADER_MAP: Record<string, string> = {
  team: 'team',
  quarter: 'quarter',
  objective: 'objNum',
  objectivenumber: 'objNum',
  obj: 'objNum',
  objectivedescription: 'objTitle',
  objective1: 'objTitle', // guard against odd exports
  kr: 'krNum',
  krnumber: 'krNum',
  krdescription: 'krDesc',
  keyresult: 'krDesc',
  keyresultdescription: 'krDesc',
  unit: 'unit',
  baseline: 'baseline',
  target: 'target',
  currentvalue: 'current',
  current: 'current',
  progress: 'progress',
  status: 'status',
  initiatives: 'initiative',
  initiative: 'initiative',
  owner: 'owner',
  comments: 'comment',
  comment: 'comment',
};

function colRefToIndex(ref: string): number {
  // "D5" -> 3 (0-based col index)
  const m = /^([A-Z]+)/.exec(ref);
  if (!m) return -1;
  let n = 0;
  for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}
function readSharedStrings(doc: Document | null): string[] {
  if (!doc) return [];
  const out: string[] = [];
  const sis = doc.getElementsByTagName('si');
  for (const si of Array.from(sis)) {
    const ts = si.getElementsByTagName('t');
    let s = '';
    for (const tEl of Array.from(ts)) s += tEl.textContent ?? '';
    out.push(s);
  }
  return out;
}

function cellText(c: Element, shared: string[]): string {
  const t = c.getAttribute('t');
  if (t === 's') {
    const idx = Number(text(c.getElementsByTagName('v')[0]));
    return shared[idx] ?? '';
  }
  if (t === 'inlineStr') {
    const is = c.getElementsByTagName('is')[0];
    const ts = is?.getElementsByTagName('t');
    let s = '';
    if (ts) for (const tEl of Array.from(ts)) s += tEl.textContent ?? '';
    return s.trim();
  }
  // 'str' (formula result) or number/boolean
  return text(c.getElementsByTagName('v')[0]);
}

function toNumber(s: string): number {
  if (s == null || s === '') return 0;
  const n = Number(String(s).replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function parseDoc(xml: string): Document {
  return new DOMParser().parseFromString(xml, 'application/xml');
}

/** Read a worksheet into a dense 2D string grid. */
function sheetToGrid(xml: string, shared: string[]): string[][] {
  const doc = parseDoc(xml);
  const rows = doc.getElementsByTagName('row');
  const grid: string[][] = [];
  for (let i = 0; i < rows.length; i++) {
    const rEl = rows[i];
    const rowNum = Number(rEl.getAttribute('r')) || i + 1;
    const cells = rEl.getElementsByTagName('c');
    const arr: string[] = [];
    for (let j = 0; j < cells.length; j++) {
      const c = cells[j];
      const ref = c.getAttribute('r') ?? '';
      const ci = ref ? colRefToIndex(ref) : j;
      arr[ci] = cellText(c, shared);
    }
    grid[rowNum - 1] = arr;
  }
  return grid;
}

/**
 * Parse an uploaded .xlsx into structured per-team OKRs (reads the "OKRs"
 * sheet). Browser only (uses DOMParser).
 */
export async function parseOkrWorkbook(
  data: ArrayBuffer | Uint8Array
): Promise<ParsedWorkbook> {
  const warnings: string[] = [];
  const zip = await JSZip.loadAsync(data);

  const wbXml = await zip.file('xl/workbook.xml')?.async('string');
  const relsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('string');
  if (!wbXml || !relsXml) {
    throw new Error('This does not look like a valid .xlsx workbook.');
  }

  // sheet name -> r:id ; r:id -> worksheet path
  const wbDoc = parseDoc(wbXml);
  const sheetEls = wbDoc.getElementsByTagName('sheet');
  const nameToRid = new Map<string, string>();
  for (const el of Array.from(sheetEls)) {
    const name = el.getAttribute('name') ?? '';
    const rid =
      el.getAttribute('r:id') ??
      el.getAttributeNS(
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'id'
      ) ??
      '';
    nameToRid.set(name, rid);
  }
  const relsDoc = parseDoc(relsXml);
  const relEls = relsDoc.getElementsByTagName('Relationship');
  const ridToTarget = new Map<string, string>();
  for (const el of Array.from(relEls)) {
    ridToTarget.set(
      el.getAttribute('Id') ?? '',
      el.getAttribute('Target') ?? ''
    );
  }
  const pathFor = (name: string): string | null => {
    const rid = nameToRid.get(name);
    const tgt = rid ? ridToTarget.get(rid) : undefined;
    if (!tgt) return null;
    return tgt.startsWith('/')
      ? tgt.slice(1)
      : `xl/${tgt.replace(/^\.\//, '')}`;
  };

  // shared strings (optional)
  const ssXml = await zip.file('xl/sharedStrings.xml')?.async('string');
  const shared = readSharedStrings(ssXml ? parseDoc(ssXml) : null);

  // find the OKRs sheet: by name, else by header content
  let okrPath = pathFor(
    [...nameToRid.keys()].find(n => normHeader(n) === 'okrs') ?? 'OKRs'
  );
  let grid: string[][] | null = null;
  if (okrPath) {
    const xml = await zip.file(okrPath)?.async('string');
    if (xml) grid = sheetToGrid(xml, shared);
  }
  if (!grid) {
    // fallback: scan every worksheet for a header row containing our columns
    for (const name of nameToRid.keys()) {
      const p = pathFor(name);
      if (!p) continue;
      const xml = await zip.file(p)?.async('string');
      if (!xml) continue;
      const g = sheetToGrid(xml, shared);
      if (
        g.some(r =>
          r?.some(c => normHeader(c ?? '') === 'objectivedescription')
        )
      ) {
        grid = g;
        okrPath = p;
        break;
      }
    }
  }
  if (!grid || !grid.length) {
    throw new Error('Could not find an "OKRs" sheet in this workbook.');
  }

  // locate the header row
  const headerRowIdx = grid.findIndex(r =>
    r?.some(c => normHeader(c ?? '') === 'team')
  );
  if (headerRowIdx < 0) {
    throw new Error(
      'The OKRs sheet is missing its header row (no "Team" column).'
    );
  }
  const header = grid[headerRowIdx];
  const col: Record<string, number> = {};
  header.forEach((label, i) => {
    const key = HEADER_MAP[normHeader(label ?? '')];
    if (key && col[key] === undefined) col[key] = i;
  });
  if (col.team === undefined || col.objTitle === undefined) {
    throw new Error(
      'The OKRs sheet header is missing required columns (Team / Objective Description).'
    );
  }

  const at = (row: string[], key: string): string =>
    col[key] === undefined ? '' : (row[col[key]] ?? '').toString();

  // group rows -> teams -> objectives
  const teamsMap = new Map<string, ParsedTeamOkr>();
  for (let i = headerRowIdx + 1; i < grid.length; i++) {
    const row = grid[i];
    if (!row) continue;
    const teamName = at(row, 'team').trim();
    if (!teamName) continue;

    let team = teamsMap.get(teamName);
    if (!team) {
      team = {
        teamName,
        quarter: at(row, 'quarter').trim() || OKR_QUARTER_LABEL,
        owner: '',
        objectives: [],
      };
      teamsMap.set(teamName, team);
    }

    const objNumRaw = at(row, 'objNum').trim();
    const objTitle = at(row, 'objTitle').trim();
    const objNum = objNumRaw ? Number(objNumRaw) : team.objectives.length + 1;

    let obj = team.objectives.find(o => o.number === objNum);
    if (!obj) {
      obj = { number: objNum, title: objTitle, keyResults: [], progress: 0 };
      team.objectives.push(obj);
    } else if (!obj.title && objTitle) {
      obj.title = objTitle;
    }

    const krDesc = at(row, 'krDesc').trim();
    const baseline = toNumber(at(row, 'baseline'));
    const target = toNumber(at(row, 'target'));
    const current = toNumber(at(row, 'current'));
    const owner = at(row, 'owner').trim();
    if (owner && !team.owner) team.owner = owner;

    // skip fully-empty KR rows (no desc, no numbers)
    const hasData =
      krDesc ||
      at(row, 'unit').trim() ||
      at(row, 'baseline').trim() ||
      at(row, 'target').trim() ||
      at(row, 'current').trim() ||
      at(row, 'initiative').trim();
    if (!hasData && !objTitle) continue;
    if (!hasData) continue; // objective with no KR data yet

    obj.keyResults.push({
      description: krDesc,
      unit: at(row, 'unit').trim(),
      baseline,
      target,
      current,
      initiative: at(row, 'initiative').trim(),
      owner,
      comment: at(row, 'comment').trim(),
      progress: krProgress({ baseline, target, current }),
    });
  }

  // finalise: sort, drop empty objectives/teams, compute progress
  const teams: ParsedTeamOkr[] = [];
  for (const team of teamsMap.values()) {
    team.objectives = team.objectives
      .filter(o => o.keyResults.length > 0 || o.title)
      .sort((a, b) => a.number - b.number)
      .map(o => ({ ...o, progress: objectiveProgress(o) }));
    if (team.objectives.length) teams.push(team);
  }
  if (!teams.length) {
    warnings.push('No filled-in OKR rows were found in the file.');
  }

  return { teams, warnings };
}
