/**
 * Generates the committed OKR artifacts from the single TS source of truth
 * (okr-seed-data.ts):
 *
 *   1. packages/frontend/core/public/okr/bridge_xpi_okrs_template.xlsx
 *      - the Download template (served at /okr/... by Pages, and uploaded to
 *        Supabase Storage by the app). Instructions + Dashboard + ONE TAB PER
 *        TEAM LEAD, so each person edits only their own sheet.
 *   2. supabase/seed.sql
 *      - reseeds the 7-team roster + demo objectives / key results /
 *        initiatives so the DB matches the app + template.
 *
 * Run:  node_modules/.bin/tsx scripts/build-okr-template.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import JSZip from 'jszip';

import {
  objectiveProgress,
  OKR_DEMO,
  OKR_QUARTER,
  OKR_QUARTER_LABEL,
  OKR_TEAMS,
  OKR_YEAR,
  type SeedTeam,
  type SeedTeamOkr,
} from '../packages/frontend/core/src/desktop/pages/okr-dashboard/okr-seed-data';
import {
  type CellValue,
  DASHBOARD_COLS,
  DASHBOARD_HEADER,
  dashboardCaption,
  dashboardValues,
  instructionsLines,
  OKR_COLUMNS,
  TEAM_SHEET_COLS,
  teamSheetValues,
} from '../packages/frontend/core/src/desktop/pages/okr-dashboard/xlsx-lite';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

// keep in lockstep with okr-data.ts targetText()
function targetText(kr: {
  unit: string;
  baseline: number;
  target: number;
  current: number;
}): string {
  const u = kr.unit ? ` ${kr.unit}` : '';
  return `Target ${kr.target}${u} · now ${kr.current}${u} (baseline ${kr.baseline}${u})`;
}

function dedupInitiatives(obj: SeedTeamOkr['objectives'][number]) {
  const seen = new Set<string>();
  const out: { description: string; owner: string }[] = [];
  for (const kr of obj.keyResults) {
    const d = kr.initiative.trim();
    if (d && !seen.has(d.toLowerCase())) {
      seen.add(d.toLowerCase());
      out.push({ description: d, owner: kr.owner });
    }
  }
  return out;
}

// ===========================================================================
// 1. the .xlsx template
// ===========================================================================
//
// The LAYOUT (which value and which formula goes in which cell) comes from
// xlsx-lite.ts, shared with the in-browser fallback download so the two can
// never disagree. What lives here is the PRESENTATION: styles.xml + theme1.xml
// were lifted from the hand-designed workbook the team signed off on and are
// committed under scripts/okr-template-assets/, and the style indices below
// point into that stylesheet.

/** cellXfs indices inside scripts/okr-template-assets/styles.xml. */
const S = {
  instrTitle: 4,
  instrHead: 6,
  instrBody: 5,
  dashTitle: 3,
  dashCaption: 2,
  dashHeader: 7,
  dashTeam: 8,
  dashStatus: 9,
  dashPct: 10,
  dashObjective: 11,
  dashTip: 1,
  teamHeader: 12,
  teamCell: 13,
  teamPct: 14,
  teamStatus: 15,
  teamOwner: 16,
} as const;

/** dxf indices inside that same stylesheet (red / amber / green fills). */
const DXF = {
  teamOffTrack: 0,
  teamAtRisk: 1,
  teamOnTrack: 2,
  dashOffTrack: 3,
  dashAtRisk: 4,
  dashOnTrack: 5,
} as const;

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colLetter(n: number): string {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** One styled cell. */
function cell(ref: string, value: CellValue, style: number): string {
  const s = ` s="${style}"`;
  if (value && typeof value === 'object' && 'f' in value) {
    // No cached <v>; the workbook sets fullCalcOnLoad so every reader computes
    // these on open.
    return `<c r="${ref}"${s}><f>${esc(value.f)}</f></c>`;
  }
  if (value === null || value === undefined || value === '') {
    return `<c r="${ref}"${s}/>`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}"${s}><v>${value}</v></c>`;
  }
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(
    String(value)
  )}</t></is></c>`;
}

/** One row; `styles` is per-column, falling back to its last entry. */
function row(
  index: number,
  values: CellValue[],
  styles: number[],
  attrs = ''
): string {
  const cells = values
    .map((v, i) =>
      cell(
        `${colLetter(i + 1)}${index}`,
        v,
        styles[i] ?? styles[styles.length - 1] ?? 0
      )
    )
    .join('');
  return `<row r="${index}"${attrs}>${cells}</row>`;
}

function colsXml(cols: { min: number; max: number; width: number }[]): string {
  return `<cols>${cols
    .map(
      c =>
        `<col min="${c.min}" max="${c.max}" width="${c.width}" customWidth="1"/>`
    )
    .join('')}</cols>`;
}

/**
 * A worksheet part. `tail` carries the post-sheetData elements and MUST already
 * be in schema order: mergeCells, conditionalFormatting, dataValidations,
 * pageMargins.
 */
function worksheet(
  body: string,
  opts: { cols?: string; freeze?: number; gridlines?: boolean; tail?: string }
): string {
  const view = `<sheetView${opts.gridlines === false ? ' showGridLines="0"' : ''} workbookViewId="0">${
    opts.freeze
      ? `<pane ySplit="${opts.freeze}" topLeftCell="A${opts.freeze + 1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/>`
      : ''
  }</sheetView>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews>${view}</sheetViews><sheetFormatPr defaultColWidth="8.6328125" defaultRowHeight="14.5"/>${
    opts.cols ?? ''
  }<sheetData>${body}</sheetData>${opts.tail ?? ''}<pageMargins left="0.75" right="0.75" top="1" bottom="1" header="0.51" footer="0.51"/></worksheet>`;
}

function instructionsSheet(demo: SeedTeamOkr[], teams: SeedTeam[]): string {
  const styleFor = {
    title: S.instrTitle,
    head: S.instrHead,
    body: S.instrBody,
  };
  const body = instructionsLines(demo, teams)
    .map((line, i) => row(i + 1, [line.text], [styleFor[line.kind]]))
    .join('');
  return worksheet(body, {
    cols: colsXml([{ min: 1, max: 1, width: 110 }]),
    gridlines: false,
  });
}

function dashboardSheet(demo: SeedTeamOkr[], teams: SeedTeam[]): string {
  const rows: string[] = [];
  rows.push(
    row(
      1,
      [`BRIDGE XPI - OKRs ${OKR_QUARTER_LABEL}`],
      [S.dashTitle],
      ' ht="39.75" customHeight="1"'
    )
  );
  rows.push(
    row(2, [{ f: dashboardCaption(teams) }], [S.dashCaption], ' ht="15.5"')
  );
  rows.push(row(4, [...DASHBOARD_HEADER], [S.dashHeader]));

  const teamStyles = [
    S.dashTeam,
    S.dashStatus,
    S.dashPct,
    S.dashObjective,
    S.dashPct,
    S.dashObjective,
    S.dashPct,
    S.dashObjective,
    S.dashPct,
  ];
  const first = 5;
  teams.forEach((team, i) => {
    const okr = demo.find(d => d.key === team.key);
    const rowCount = teamSheetValues(team, okr).length;
    rows.push(
      row(
        first + i,
        dashboardValues(team, rowCount),
        teamStyles,
        ' ht="30" customHeight="1"'
      )
    );
  });

  const last = first + teams.length - 1;
  const tipRow = last + 2;
  rows.push(
    row(
      tipRow,
      [
        'TV tip: open the Dashboard tab in Excel Online, press F11 (full screen) and hide the ribbon (View > Show). ' +
          'Leave it open all day - it recalculates as each lead updates their own tab.',
      ],
      [S.dashTip]
    )
  );

  const bar = (col: string) =>
    `<conditionalFormatting sqref="${col}${first}:${col}${last}"><cfRule type="dataBar" priority="5"><dataBar><cfvo type="num" val="0"/><cfvo type="num" val="1"/><color rgb="FF1F77B4"/></dataBar></cfRule></conditionalFormatting>`;

  const tail =
    `<mergeCells count="3"><mergeCell ref="A1:J1"/><mergeCell ref="A2:J2"/><mergeCell ref="A${tipRow}:J${tipRow}"/></mergeCells>` +
    `<conditionalFormatting sqref="B${first}:B${last}">` +
    `<cfRule type="expression" dxfId="${DXF.dashOnTrack}" priority="2"><formula>$B${first}="On Track"</formula></cfRule>` +
    `<cfRule type="expression" dxfId="${DXF.dashAtRisk}" priority="3"><formula>$B${first}="At Risk"</formula></cfRule>` +
    `<cfRule type="expression" dxfId="${DXF.dashOffTrack}" priority="4"><formula>$B${first}="Off Track"</formula></cfRule>` +
    `</conditionalFormatting>` +
    ['C', 'E', 'G', 'I'].map(bar).join('');

  return worksheet(rows.join(''), {
    cols: colsXml(DASHBOARD_COLS),
    freeze: 4,
    gridlines: false,
    tail,
  });
}

function teamSheet(team: SeedTeam, okr: SeedTeamOkr | undefined): string {
  const values = teamSheetValues(team, okr);
  const dataStyles = [
    S.teamCell, // A Team
    S.teamCell, // B Quarter
    S.teamCell, // C Objective #
    S.teamCell, // D Objective Description
    S.teamCell, // E KR #
    S.teamCell, // F KR Description
    S.teamCell, // G Unit
    S.teamCell, // H Baseline
    S.teamCell, // I Target
    S.teamCell, // J Current Value
    S.teamPct, // K Progress (%)
    S.teamStatus, // L Status
    S.teamCell, // M Initiatives
    S.teamOwner, // N Owner
    S.teamCell, // O Comments
  ];
  const rows = [row(1, [...OKR_COLUMNS], [S.teamHeader])];
  values.forEach((v, i) => rows.push(row(i + 2, v, dataStyles)));

  const last = Math.max(2, values.length + 1);
  // Column A is locked to this team's own name: a one-entry dropdown. Nobody
  // can retype their tab into another department, which is what keeps "upload
  // only your own sheet" true even before the app checks it.
  const tail =
    `<conditionalFormatting sqref="L2:L${last}">` +
    `<cfRule type="expression" dxfId="${DXF.teamOnTrack}" priority="2"><formula>$L2="On Track"</formula></cfRule>` +
    `<cfRule type="expression" dxfId="${DXF.teamAtRisk}" priority="3"><formula>$L2="At Risk"</formula></cfRule>` +
    `<cfRule type="expression" dxfId="${DXF.teamOffTrack}" priority="4"><formula>$L2="Off Track"</formula></cfRule>` +
    `</conditionalFormatting>` +
    // errorTitle is capped at 32 chars by the format, error at 255 - go over
    // and Excel offers to "repair" the file on open.
    `<dataValidations count="1"><dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" errorTitle="This tab belongs to one team" error="Leave the Team column as ${esc(
      team.name
    )} and edit only this tab - it is the sheet that gets imported for you." sqref="A2:A${last}"><formula1>"${esc(
      team.name
    )}"</formula1></dataValidation></dataValidations>`;

  return worksheet(rows.join(''), {
    cols: colsXml(TEAM_SHEET_COLS),
    freeze: 1,
    tail,
  });
}

async function buildStyledWorkbook(
  demo: SeedTeamOkr[],
  teams: SeedTeam[]
): Promise<Uint8Array> {
  const assets = resolve(HERE, 'okr-template-assets');
  const stylesXml = readFileSync(resolve(assets, 'styles.xml'), 'utf-8');
  const themeXml = readFileSync(resolve(assets, 'theme1.xml'), 'utf-8');

  const tabs = ['Instructions', 'Dashboard', ...teams.map(t => t.tab)];
  const n = tabs.length;
  const nums = Array.from({ length: n }, (_, i) => i + 1);
  const themeRid = n + 1;
  const stylesRid = n + 2;

  const zip = new JSZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${nums
      .map(
        i =>
          `<Override PartName="/xl/worksheets/sheet${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
      )
      .join(
        ''
      )}<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`
  );

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
  );

  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="15500" activeTab="1"/></bookViews><sheets>${tabs
      .map(
        (name, i) =>
          `<sheet name="${esc(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
      )
      .join(
        ''
      )}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`
  );

  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${nums
      .map(
        i =>
          `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i}.xml"/>`
      )
      .join(
        ''
      )}<Relationship Id="rId${themeRid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/><Relationship Id="rId${stylesRid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
  );

  zip.file('xl/styles.xml', stylesXml);
  zip.file('xl/theme/theme1.xml', themeXml);
  zip.file('xl/worksheets/sheet1.xml', instructionsSheet(demo, teams));
  zip.file('xl/worksheets/sheet2.xml', dashboardSheet(demo, teams));
  teams.forEach((team, i) => {
    zip.file(
      `xl/worksheets/sheet${i + 3}.xml`,
      teamSheet(
        team,
        demo.find(d => d.key === team.key)
      )
    );
  });

  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

async function writeTemplate() {
  const out = resolve(
    ROOT,
    'packages/frontend/core/public/okr/bridge_xpi_okrs_template.xlsx'
  );
  const bytes = await buildStyledWorkbook(OKR_DEMO, OKR_TEAMS);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, bytes);
  console.log(
    `wrote ${out} (${bytes.length} bytes, ${OKR_TEAMS.length + 2} sheets)`
  );
}

// ===========================================================================
// 2. supabase/seed.sql
// ===========================================================================
function buildSeedSql(): string {
  const rosterValues = OKR_TEAMS.map(
    (t, i) =>
      `  ('${t.key}', '${t.name.replace(/'/g, "''")}', '${t.accent}', ${i + 1})`
  ).join(',\n');
  const rosterKeys = OKR_TEAMS.map(t => `'${t.key}'`).join(', ');

  // demo payload the DO block iterates
  const payload = OKR_DEMO.map(team => ({
    key: team.key,
    owner: team.owner,
    objectives: team.objectives.map(o => ({
      title: o.title,
      progress: objectiveProgress(o),
      key_results: o.keyResults
        .filter(k => k.description)
        .map(k => ({ description: k.description, target_text: targetText(k) })),
      initiatives: dedupInitiatives(o),
    })),
  }));
  const json = JSON.stringify(payload, null, 2).replace(/'/g, "''");

  return `-- =====================================================================
-- BRIDGE Flow - OKR seed (7 BRIDGE XPI teams + demo objectives/KRs/initiatives)
-- GENERATED by scripts/build-okr-template.ts from okr-seed-data.ts - do not
-- hand-edit; change the TS source and re-run the script.
-- Run AFTER 0001_okr_dashboard.sql and 0002_okr_import_admin.sql. Idempotent.
-- Progress here = mean of each objective's KR progress. Live status is derived
-- app-side and is PACE-based (progress vs quarter elapsed), so the stored
-- progress below is the only source of truth; status is computed on read.
-- =====================================================================

-- ---------- The 7 BRIDGE XPI teams (matches bridge_xpi_okrs.xlsx) -----
insert into public.teams (key, name, accent, sort_order) values
${rosterValues}
on conflict (key) do update
  set name = excluded.name, accent = excluded.accent, sort_order = excluded.sort_order;

-- ---------- Move users off retired teams, then drop them --------------
do $$
declare m record;
  remap jsonb := '[
    {"from":"ai","to":"ai-analytics"},
    {"from":"business-ops","to":"business-operation"},
    {"from":"lean","to":"lean-six-sigma"},
    {"from":"six-sigma","to":"lean-six-sigma"}
  ]'::jsonb;
begin
  for m in select value as v from jsonb_array_elements(remap) loop
    update public.profiles
      set team_id = (select id from public.teams where key = (m.v->>'to'))
      where team_id = (select id from public.teams where key = (m.v->>'from'));
  end loop;
end $$;

delete from public.teams where key not in (${rosterKeys});

-- ---------- Backfill profiles for users created before the trigger ---
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', u.email)
from auth.users u
on conflict (id) do nothing;

-- ---------- Demo OKRs + objectives + key results + initiatives -------
do $$
declare
  okr uuid;
  obj_id uuid;
  team_row public.teams;
  t jsonb;
  o jsonb;
  kr jsonb;
  it jsonb;
  pos int;
  kpos int;
  ipos int;
  seed_data jsonb := '${json}'::jsonb;
begin
  for t in select * from jsonb_array_elements(seed_data) loop
    select * into team_row from public.teams where key = (t->>'key');
    if not found then continue; end if;

    insert into public.okrs (team_id, quarter, year, area, owner, focus_note)
    values (team_row.id, '${OKR_QUARTER}', ${OKR_YEAR}, 'Excellence Department',
            (t->>'owner'), 'Focus on the results that drive the biggest impact.')
    on conflict (team_id, quarter, year) do update set owner = excluded.owner
    returning id into okr;

    -- clearing objectives cascades to key_results + initiatives
    delete from public.objectives where okr_id = okr;

    pos := 1;
    for o in select * from jsonb_array_elements(t->'objectives') loop
      insert into public.objectives (okr_id, team_id, position, title, progress)
      values (okr, team_row.id, pos, (o->>'title'), (o->>'progress')::int)
      returning id into obj_id;

      kpos := 1;
      for kr in select * from jsonb_array_elements(coalesce(o->'key_results','[]'::jsonb)) loop
        insert into public.key_results (objective_id, team_id, position, description, target_text)
        values (obj_id, team_row.id, kpos, (kr->>'description'), (kr->>'target_text'));
        kpos := kpos + 1;
      end loop;

      ipos := 1;
      for it in select * from jsonb_array_elements(coalesce(o->'initiatives','[]'::jsonb)) loop
        insert into public.initiatives (objective_id, team_id, position, description, owner)
        values (obj_id, team_row.id, ipos, (it->>'description'), (it->>'owner'));
        ipos := ipos + 1;
      end loop;

      pos := pos + 1;
    end loop;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- To edit a team's OKR in-app, pick your department (sets profiles.team_id).
-- To import the whole workbook, set profiles.is_admin = true (see 0002).
-- ---------------------------------------------------------------------
`;
}

function writeSeed() {
  const out = resolve(ROOT, 'supabase/seed.sql');
  writeFileSync(out, buildSeedSql());
  console.log(`wrote ${out}`);
}

async function main() {
  await writeTemplate();
  writeSeed();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
