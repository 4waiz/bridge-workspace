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
 * The workbook gives every team lead their OWN tab. The parser reads all of
 * them and is tolerant of column order, shared vs. inline strings, and rows
 * re-saved by Excel/Google Sheets. Teams are keyed off the Team column, never
 * the tab name, so a renamed tab still imports.
 */
import JSZip from 'jszip';

import {
  krProgress,
  objectiveProgress,
  OKR_QUARTER_LABEL,
  OKR_TEAMS,
  type SeedTeam,
  type SeedTeamOkr,
  teamForTab,
} from './okr-seed-data';

// The 15 columns of every team tab, in order.
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

/** A literal cell value, or `{ f }` for a formula cell. */
export type CellValue = string | number | null | undefined | { f: string };

function cellXml(ref: string, value: CellValue, style?: number): string {
  const s = style ? ` s="${style}"` : '';
  if (value && typeof value === 'object' && 'f' in value) {
    // No cached <v>: the workbook sets fullCalcOnLoad, so Excel / Sheets /
    // LibreOffice compute these the moment the file opens.
    return `<c r="${ref}"${s}><f>${escapeXml(value.f)}</f></c>`;
  }
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

// ---------------------------------------------------------------------------
// Shared layout + formula vocabulary.
//
// scripts/build-okr-template.ts builds the styled artifact people actually
// download and imports these same helpers, so the shipped workbook and this
// in-browser fallback can never drift apart on layout or maths.
// ---------------------------------------------------------------------------

/** Quoted sheet prefix for use in a formula, e.g. `'Business Ops'!`. */
export function sheetRef(tab: string): string {
  return `'${tab.replace(/'/g, "''")}'!`;
}

/**
 * Column K - KR progress. Deliberately the exact twin of krProgress() in
 * okr-seed-data.ts: Current / Target, clamped to 0..1. MEDIAN(0, x, 1) is the
 * shortest clamp in Excel; a zero Target divides by zero and IFERROR catches
 * it. If you change one of the two, change the other.
 */
export function progressFormula(row: number): string {
  return `IFERROR(MEDIAN(0,J${row}/I${row},1),0)`;
}

/**
 * Column L - KR status. Off Track when the KR has not been measured yet, or
 * when Current has moved the wrong way from Baseline; otherwise On Track.
 */
export function statusFormula(row: number): string {
  return `IF(OR(AND(J${row}=0,I${row}<>0),(J${row}-H${row})*(I${row}-H${row})<0),"Off Track","On Track")`;
}

/** The Dashboard's rollup formulas for one team's tab (rows `first`..`last`). */
export function dashboardFormulas(tab: string, first: number, last: number) {
  const ref = sheetRef(tab);
  const L = `${ref}$L$${first}:$L$${last}`;
  const K = `${ref}$K$${first}:$K$${last}`;
  const C = `${ref}$C$${first}:$C$${last}`;
  const D = `${ref}$D$${first}:$D$${last}`;
  return {
    status: `IF(COUNTIF(${L},"Off Track")>0,"Off Track",IF(COUNTIF(${L},"At Risk")>0,"At Risk","On Track"))`,
    overall: `IFERROR(AVERAGE(${K}),0)`,
    objTitle: (n: number) => `IFERROR(INDEX(${D},MATCH(${n},${C},0)),"")`,
    objPct: (n: number) => `IFERROR(AVERAGEIF(${C},${n},${K}),0)`,
  };
}

/** Column widths for a team tab. */
export const TEAM_SHEET_COLS = [
  { min: 1, max: 1, width: 24 },
  { min: 2, max: 3, width: 10 },
  { min: 4, max: 4, width: 34 },
  { min: 5, max: 5, width: 7 },
  { min: 6, max: 6, width: 34 },
  { min: 7, max: 7, width: 9 },
  { min: 8, max: 9, width: 10 },
  { min: 10, max: 12, width: 12 },
  { min: 13, max: 13, width: 34 },
  { min: 14, max: 14, width: 16 },
  { min: 15, max: 15, width: 26 },
];

/** Column widths for the Dashboard tab. */
export const DASHBOARD_COLS = [
  { min: 1, max: 1, width: 22 },
  { min: 2, max: 2, width: 13 },
  { min: 3, max: 3, width: 14 },
  { min: 4, max: 4, width: 26 },
  { min: 5, max: 5, width: 9 },
  { min: 6, max: 6, width: 26 },
  { min: 7, max: 7, width: 9 },
  { min: 8, max: 8, width: 26 },
  { min: 9, max: 9, width: 9 },
];

export interface InstructionLine {
  text: string;
  kind: 'title' | 'head' | 'body';
}

/** The lines of the Instructions tab, in order. */
export function instructionsLines(
  demo: SeedTeamOkr[],
  teams: SeedTeam[]
): InstructionLine[] {
  const lines: InstructionLine[] = [
    { text: `BRIDGE XPI - OKR Tracker - ${OKR_QUARTER_LABEL}`, kind: 'title' },
    { text: '', kind: 'body' },
    { text: 'Everyone has their own tab', kind: 'head' },
    {
      text: '1. Find the tab with your team name along the bottom - that is YOUR sheet, and the only one you edit.',
      kind: 'body',
    },
    {
      text: '2. Leave every other tab alone. When you upload, only your own team is imported; the rest are ignored.',
      kind: 'body',
    },
    { text: '', kind: 'body' },
    { text: 'How to fill in your tab', kind: 'head' },
    {
      text: '3. Each row is ONE Key Result (KR). One Objective with 3 KRs = 3 rows, so 3 Objectives = 9 rows.',
      kind: 'body',
    },
    {
      text: '4. Fill in: Objective Description, KR Description, Unit, Baseline, Target, Current Value, Initiatives, Owner, Comments.',
      kind: 'body',
    },
    {
      text: "5. Do NOT edit Team, 'Progress (%)' or 'Status' - Team identifies your sheet, the other two are calculated.",
      kind: 'body',
    },
    {
      text: "6. Update 'Current Value' whenever you have a new number (suggested cadence: bi-weekly or monthly).",
      kind: 'body',
    },
    { text: '', kind: 'body' },
    { text: 'Pushing your numbers to the dashboard', kind: 'head' },
    {
      text: '7. Save this file, then open BRIDGE Flow, go to OKR Quarterly Plan and press "Upload & import".',
      kind: 'body',
    },
    {
      text: '8. Check the preview - it shows only your team - then press "Push to dashboard" to make it live.',
      kind: 'body',
    },
    { text: '', kind: 'body' },
    { text: 'How Progress and Status are calculated', kind: 'head' },
    {
      text: 'Progress (%) = Current Value / Target, capped at 100%. (e.g. 3 of 4 = 75%)',
      kind: 'body',
    },
    {
      text: 'Green  - On Track:   Current is progressing toward, at, or beyond the Target',
      kind: 'body',
    },
    {
      text: 'Red    - Off Track:  Current is worse than the Baseline, or not measured yet (0)',
      kind: 'body',
    },
    { text: '', kind: 'body' },
    { text: 'Who owns which tab', kind: 'head' },
  ];
  for (const team of teams) {
    const owner = demo.find(d => d.key === team.key)?.owner ?? '';
    lines.push({
      text: `    ${team.tab}   ->   ${team.name}${owner ? `   -   ${owner}` : ''}`,
      kind: 'body',
    });
  }
  return lines;
}

/** The data rows for one team's tab, as flat cell arrays starting at row 2. */
export function teamSheetValues(
  team: SeedTeam,
  okr: SeedTeamOkr | undefined
): CellValue[][] {
  const out: CellValue[][] = [];
  const objectives = okr?.objectives ?? [];
  let r = 2;
  for (let oi = 0; oi < objectives.length; oi++) {
    const obj = objectives[oi];
    for (let ki = 0; ki < obj.keyResults.length; ki++) {
      const kr = obj.keyResults[ki];
      out.push([
        team.name, // A  Team
        OKR_QUARTER_LABEL, // B  Quarter
        oi + 1, // C  Objective #
        obj.title, // D  Objective Description
        ki + 1, // E  KR #
        kr.description, // F  KR Description
        kr.unit, // G  Unit
        kr.baseline, // H  Baseline
        kr.target, // I  Target
        kr.current, // J  Current Value
        { f: progressFormula(r) }, // K  Progress (%)
        { f: statusFormula(r) }, // L  Status
        kr.initiative, // M  Initiatives
        kr.owner, // N  Owner
        '', // O  Comments
      ]);
      r++;
    }
  }
  return out;
}

/** The Dashboard's 9 cells for one team, given how many rows its tab holds. */
export function dashboardValues(team: SeedTeam, rowCount: number): CellValue[] {
  const f = dashboardFormulas(team.tab, 2, Math.max(2, rowCount + 1));
  return [
    team.name,
    { f: f.status },
    { f: f.overall },
    { f: f.objTitle(1) },
    { f: f.objPct(1) },
    { f: f.objTitle(2) },
    { f: f.objPct(2) },
    { f: f.objTitle(3) },
    { f: f.objPct(3) },
  ];
}

/** The Dashboard header row, in order. */
export const DASHBOARD_HEADER = [
  'Team',
  'Status',
  'Overall Progress',
  'Objective 1',
  '% Obj 1',
  'Objective 2',
  '% Obj 2',
  'Objective 3',
  '% Obj 3',
] as const;

/** Row 2 of the Dashboard: the quarter caption, read off the first team tab. */
export function dashboardCaption(teams: SeedTeam[]): string {
  const ref = sheetRef(teams[0]?.tab ?? 'Agile');
  return `"Quarter: "&${ref}B2&"   |   Auto-updated from each team's tab"`;
}

function instructionsRows(demo: SeedTeamOkr[], teams: SeedTeam[]): string[] {
  return instructionsLines(demo, teams).map((l, i) =>
    rowXml(i + 1, [l.text], l.kind !== 'body')
  );
}

function dashboardRows(demo: SeedTeamOkr[], teams: SeedTeam[]): string[] {
  const rows: string[] = [];
  rows.push(rowXml(1, [`BRIDGE XPI - OKRs ${OKR_QUARTER_LABEL}`], true));
  rows.push(rowXml(2, [{ f: dashboardCaption(teams) }]));
  rows.push(rowXml(4, [...DASHBOARD_HEADER], true));
  let r = 5;
  for (const team of teams) {
    const okr = demo.find(x => x.key === team.key);
    rows.push(
      rowXml(r++, dashboardValues(team, teamSheetValues(team, okr).length))
    );
  }
  return rows;
}

function teamSheetRows(team: SeedTeam, okr: SeedTeamOkr | undefined): string[] {
  const rows: string[] = [rowXml(1, [...OKR_COLUMNS], true)];
  teamSheetValues(team, okr).forEach((v, i) => rows.push(rowXml(i + 2, v)));
  return rows;
}

/**
 * Build the workbook: Instructions, Dashboard, then ONE TAB PER TEAM LEAD.
 * Returns raw xlsx bytes usable in the browser (wrap in Blob) or Node.
 *
 * This is the in-browser fallback download - correct shape and formulas, plain
 * formatting. The copy people normally get is the styled artifact under
 * public/okr/, generated by scripts/build-okr-template.ts from the same layout
 * helpers above.
 */
export async function buildOkrWorkbook(
  demo: SeedTeamOkr[],
  teams: SeedTeam[] = OKR_TEAMS
): Promise<Uint8Array> {
  const zip = new JSZip();
  // sheet1 = Instructions, sheet2 = Dashboard, sheet3.. = one per team
  const sheetCount = teams.length + 2;
  const sheetNums = Array.from({ length: sheetCount }, (_, i) => i + 1);
  const tabs = ['Instructions', 'Dashboard', ...teams.map(t => t.tab)];

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${sheetNums
  .map(
    n =>
      `<Override PartName="/xl/worksheets/sheet${n}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  )
  .join('')}
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
<sheets>${tabs
      .map(
        (name, i) =>
          `<sheet name="${escapeXml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
      )
      .join('')}</sheets>
<calcPr calcId="0" fullCalcOnLoad="1"/>
</workbook>`
  );

  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheetNums
  .map(
    n =>
      `<Relationship Id="rId${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${n}.xml"/>`
  )
  .join('')}
<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );

  zip.file('xl/styles.xml', STYLES_XML);
  zip.file(
    'xl/worksheets/sheet1.xml',
    sheetXml(instructionsRows(demo, teams), [{ min: 1, max: 1, width: 110 }])
  );
  zip.file(
    'xl/worksheets/sheet2.xml',
    sheetXml(dashboardRows(demo, teams), DASHBOARD_COLS, true)
  );
  teams.forEach((team, i) => {
    const okr = demo.find(x => x.key === team.key);
    zip.file(
      `xl/worksheets/sheet${i + 3}.xml`,
      sheetXml(teamSheetRows(team, okr), TEAM_SHEET_COLS, true)
    );
  });

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
  /** Workbook tab these rows came from - each team lead owns exactly one. */
  sheetName: string;
  quarter: string;
  owner: string;
  objectives: ParsedObjective[];
}
export interface ParsedWorkbook {
  teams: ParsedTeamOkr[];
  /** Names of every OKR-shaped tab we read (Instructions/Dashboard excluded). */
  sheetNames: string[];
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
 * Parse an uploaded .xlsx into structured per-team OKRs, reading every team
 * tab in the workbook. Browser only (uses DOMParser).
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

  // ---- collect every OKR-shaped worksheet --------------------------------
  // The workbook carries ONE TAB PER TEAM LEAD (plus Instructions / Dashboard),
  // so we scan them all and merge the rows. A sheet counts as an OKR sheet only
  // when its header row carries Team + Objective Description + a KR-level
  // column ("KR #" or "KR Description"). That last clause is what rules out the
  // Dashboard, which also has a Team column and per-objective headings but no
  // KR columns; the Instructions sheet has no header row at all.
  const teamsMap = new Map<string, ParsedTeamOkr>();
  const sheetNames: string[] = [];

  for (const sheetName of nameToRid.keys()) {
    const path = pathFor(sheetName);
    if (!path) continue;
    const xml = await zip.file(path)?.async('string');
    if (!xml) continue;
    const grid = sheetToGrid(xml, shared);
    if (!grid.length) continue;

    // locate this sheet's header row
    let headerRowIdx = -1;
    let col: Record<string, number> = {};
    for (let i = 0; i < grid.length; i++) {
      const cells = grid[i];
      if (!cells) continue;
      const found: Record<string, number> = {};
      cells.forEach((label, j) => {
        const key = HEADER_MAP[normHeader(label ?? '')];
        if (key && found[key] === undefined) found[key] = j;
      });
      const isOkrHeader =
        found.team !== undefined &&
        found.objTitle !== undefined &&
        (found.krDesc !== undefined || found.krNum !== undefined);
      if (isOkrHeader) {
        headerRowIdx = i;
        col = found;
        break;
      }
    }
    if (headerRowIdx < 0) continue; // not an OKR sheet

    sheetNames.push(sheetName);

    const at = (row: string[], key: string): string =>
      col[key] === undefined ? '' : (row[col[key]] ?? '').toString();

    const seenHere = new Set<string>();

    for (let i = headerRowIdx + 1; i < grid.length; i++) {
      const row = grid[i];
      if (!row) continue;
      const teamName = at(row, 'team').trim();
      if (!teamName) continue;

      const teamKey = normHeader(teamName);
      seenHere.add(teamName);

      let team = teamsMap.get(teamKey);
      if (!team) {
        team = {
          teamName,
          sheetName,
          quarter: at(row, 'quarter').trim() || OKR_QUARTER_LABEL,
          owner: '',
          objectives: [],
        };
        teamsMap.set(teamKey, team);
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

    // Integrity check: rows filed under someone else's tab. Harmless for the
    // import (we key off the Team column, never the tab name) but worth saying
    // out loud - it usually means a lead pasted into the wrong sheet.
    const tabTeam = teamForTab(sheetName);
    if (tabTeam) {
      const strays = [...seenHere].filter(
        n => normHeader(n) !== normHeader(tabTeam.name)
      );
      if (strays.length) {
        warnings.push(
          `The "${sheetName}" tab belongs to ${tabTeam.name} but also has rows for ${strays.join(', ')}.`
        );
      }
    }
  }

  if (!sheetNames.length) {
    throw new Error(
      'No OKR sheet found in this workbook. Every team has its own tab with Team, Objective Description and KR Description columns - please use the downloaded template.'
    );
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

  return { teams, sheetNames, warnings };
}
