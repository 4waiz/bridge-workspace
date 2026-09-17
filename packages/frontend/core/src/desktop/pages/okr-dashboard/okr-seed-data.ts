/**
 * Canonical BRIDGE XPI roster + demo OKR content - the single source of truth
 * shared by:
 *   - the editor department picker (renders instantly, no "loading teams…")
 *   - the Excel template builder (Download) + parser (Upload)
 *   - the Supabase seed (supabase/seed.sql mirrors these numbers)
 *   - scripts/build-okr-template.mjs (writes the committed .xlsx artifact)
 *
 * Progress is NEVER stored as a magic number here: each Key Result carries
 * baseline / target / current and progress is DERIVED (krProgress below), the
 * exact same formula the Excel and the dashboard use. Change the numbers and
 * the whole system stays consistent.
 */

export const OKR_QUARTER = 'Q3';
export const OKR_YEAR = 2026;
export const OKR_QUARTER_LABEL = `${OKR_QUARTER} ${OKR_YEAR}`; // "Q3 2026"

// ---- Roster (order + names + accents match bridge_xpi_okrs.xlsx) -----------
export interface SeedTeam {
  key: string;
  name: string;
  accent: string;
  /**
   * Name of this team's own tab in the Excel workbook. Every team lead gets
   * exactly ONE tab and edits only that one - the upload importer matches on
   * the Team column, so the tab name is purely how a person finds their sheet.
   * Excel caps sheet names at 31 chars and forbids : \ / ? * [ ], which is why
   * the longer team names are abbreviated here.
   */
  tab: string;
}
// Array order IS the display order: build-okr-template.ts writes each team's
// index as teams.sort_order, and the dashboard sorts on that column. It is
// also the left-to-right tab order in the workbook.
export const OKR_TEAMS: SeedTeam[] = [
  { key: 'agile', name: 'Agile', accent: '#4c6ef5', tab: 'Agile' },
  {
    key: 'lean-six-sigma',
    name: 'Lean Six Sigma & Special Projects',
    accent: '#14b8a6',
    tab: 'Six Sigma',
  },
  { key: 'opex', name: 'Opex', accent: '#2eb85c', tab: 'Opex' },
  { key: 'industry-5', name: 'Industry 5.0', accent: '#f15a29', tab: 'I5.0' },
  { key: 'ai-analytics', name: 'AI & Analytics', accent: '#9b5de5', tab: 'AI' },
  {
    key: 'business-operation',
    name: 'Business Operation',
    accent: '#f5a623',
    tab: 'Business Ops',
  },
  {
    key: 'external-engagement',
    name: 'External Engagement',
    accent: '#ec4899',
    tab: 'External Engagement',
  },
];

/** The team whose Excel tab is `tab` (case/space tolerant), or null. */
export function teamForTab(tab: string): SeedTeam | null {
  const n = tab.toLowerCase().replace(/[^a-z0-9]/g, '');
  return (
    OKR_TEAMS.find(t => t.tab.toLowerCase().replace(/[^a-z0-9]/g, '') === n) ??
    null
  );
}

// ---- Demo content ----------------------------------------------------------
export interface SeedKeyResult {
  description: string;
  unit: string;
  baseline: number;
  target: number;
  current: number;
  initiative: string;
  owner: string;
}
export interface SeedObjective {
  title: string;
  keyResults: SeedKeyResult[];
}
export interface SeedTeamOkr {
  key: string;
  owner: string;
  objectives: SeedObjective[];
}

/** KR progress % - identical to the Excel formula, clamped to 0..100. */
export function krProgress(kr: {
  baseline: number;
  target: number;
  current: number;
}): number {
  // Progress = Current / Target, capped 0..100 (e.g. 3 of 4 = 75%).
  const raw = kr.target !== 0 ? kr.current / kr.target : kr.current > 0 ? 1 : 0;
  return Math.max(0, Math.min(100, Math.round(raw * 100)));
}

/** Objective progress = mean of its KR progresses (0 if no KRs). */
export function objectiveProgress(obj: {
  keyResults: { baseline: number; target: number; current: number }[];
}): number {
  if (!obj.keyResults.length) return 0;
  const sum = obj.keyResults.reduce((s, k) => s + krProgress(k), 0);
  return Math.round(sum / obj.keyResults.length);
}

/**
 * Status bands, in progress %. The one place the red / yellow / green cut-offs
 * live: the app's statusFromProgress() and the Excel Status formulas are both
 * built from these, so a number reads the same colour everywhere.
 *   ON_TRACK_FROM and up        -> On Track  (green)
 *   AT_RISK_FROM up to that     -> At Risk   (yellow)
 *   below AT_RISK_FROM          -> Off Track (red)
 */
export const ON_TRACK_FROM = 50;
export const AT_RISK_FROM = 20;

// short helper so the data table stays readable
const kr = (
  description: string,
  unit: string,
  baseline: number,
  target: number,
  current: number,
  initiative: string,
  owner: string
): SeedKeyResult => ({
  description,
  unit,
  baseline,
  target,
  current,
  initiative,
  owner,
});

export const OKR_DEMO: SeedTeamOkr[] = [
  {
    key: 'agile',
    owner: 'Mateus Rocha',
    objectives: [
      {
        title: 'Start to make BRIDGE the hub for Agile (MAGA)',
        keyResults: [
          kr(
            'Build strategic partnerships',
            'count',
            0,
            2,
            2,
            'Finalize the agreement PMI & Management',
            'Mateus Rocha'
          ),
          kr(
            'Launch 1 new trainings',
            'count',
            0,
            1,
            1,
            'CEO 4.0',
            'Mateus Rocha'
          ),
          kr(
            'Deliver Internal Hackathon',
            'count',
            0,
            1,
            1,
            'Hackathon (Internal or External)',
            'Mateus Rocha'
          ),
        ],
      },
      {
        title: 'Accelerate the adoption of EDGE 3.0 across the organization.',
        keyResults: [
          kr(
            'Form 20 agile champions',
            'count',
            0,
            20,
            20,
            'Delivery the Agile Champion Bootcamp',
            'Mateus Rocha'
          ),
          kr(
            'Complete the EDGE 3.0 process pilot',
            'count',
            0,
            1,
            1,
            'EDGE 3.0 Pilot',
            'Mateus Rocha'
          ),
          kr(
            'Approve jira from the cluster president',
            'count',
            0,
            1,
            1,
            'EDGE 3.0 Pilot',
            'Mateus Rocha'
          ),
        ],
      },
    ],
  },
  {
    key: 'ai-analytics',
    owner: 'Olaf Penne',
    objectives: [
      {
        title: 'Scale generative AI across operations',
        keyResults: [
          kr(
            'Business processes with an AI assist',
            'count',
            3,
            15,
            9,
            'Use-case intake + build squad',
            'Olaf Penne'
          ),
          kr(
            'Monthly active AI-tool users',
            'users',
            40,
            300,
            165,
            'Enablement workshops',
            'Olaf Penne'
          ),
          kr(
            'Manual hours saved per month',
            'hrs',
            0,
            800,
            420,
            'Automate top-10 workflows',
            'Olaf Penne'
          ),
        ],
      },
      {
        title: 'Stand up real-time data pipelines',
        keyResults: [
          kr(
            'Datasets available in near-real-time',
            'count',
            2,
            12,
            6,
            'Streaming ingestion platform',
            'Olaf Penne'
          ),
          kr(
            'Data-freshness SLA met',
            '%',
            60,
            98,
            82,
            'Pipeline monitoring + alerts',
            'Olaf Penne'
          ),
          kr(
            'Pipeline incident MTTR',
            'hrs',
            8,
            2,
            4,
            'On-call runbooks',
            'Olaf Penne'
          ),
        ],
      },
      {
        title: 'Build AI literacy in every team',
        keyResults: [
          kr(
            'Staff completing AI foundations',
            '%',
            10,
            80,
            46,
            'Role-based learning paths',
            'Olaf Penne'
          ),
          kr(
            'Certified prompt/BI practitioners',
            'people',
            4,
            30,
            15,
            'Internal certification track',
            'Olaf Penne'
          ),
          kr(
            'Teams with an AI champion',
            '%',
            15,
            100,
            58,
            'Champion network',
            'Olaf Penne'
          ),
        ],
      },
    ],
  },
  {
    key: 'opex',
    owner: 'Ahtesham Siddiqui',
    objectives: [
      {
        title: 'Reduce recurring operating costs',
        keyResults: [
          kr(
            'Annualised cost reduction',
            'AED k',
            0,
            1200,
            980,
            'Zero-based budgeting review',
            'Ahtesham Siddiqui'
          ),
          kr(
            'Vendor spend under contract',
            '%',
            62,
            95,
            90,
            'Renegotiate top vendors',
            'Ahtesham Siddiqui'
          ),
          kr(
            'Waste incidents (rework)',
            'count',
            220,
            60,
            88,
            'Root-cause + poka-yoke',
            'Ahtesham Siddiqui'
          ),
        ],
      },
      {
        title: 'Hit critical process SLAs',
        keyResults: [
          kr(
            'Priority requests within SLA',
            '%',
            70,
            98,
            94,
            'SLA dashboards + escalation',
            'Ahtesham Siddiqui'
          ),
          kr(
            'Average cycle time',
            'days',
            9,
            3,
            4,
            'Remove non-value steps',
            'Ahtesham Siddiqui'
          ),
          kr(
            'First-time-right rate',
            '%',
            75,
            97,
            92,
            'Standard work + checklists',
            'Ahtesham Siddiqui'
          ),
        ],
      },
      {
        title: 'Map & optimise core processes',
        keyResults: [
          kr(
            'Core processes documented',
            '%',
            45,
            100,
            88,
            'Process-mapping sprints',
            'Ahtesham Siddiqui'
          ),
          kr(
            'Processes with owner + KPI',
            '%',
            40,
            100,
            84,
            'Assign process owners',
            'Ahtesham Siddiqui'
          ),
          kr(
            'Automation opportunities shipped',
            'count',
            0,
            20,
            15,
            'Automation backlog',
            'Ahtesham Siddiqui'
          ),
        ],
      },
    ],
  },
  {
    key: 'industry-5',
    owner: 'Sohel Shaikh',
    objectives: [
      {
        title: 'Pilot advanced manufacturing',
        keyResults: [
          kr(
            'Smart-factory pilots live',
            'count',
            0,
            4,
            1,
            'Digital-twin pilot line',
            'Sohel Shaikh'
          ),
          kr(
            'Connected assets (IoT)',
            'assets',
            0,
            150,
            38,
            'Sensor + gateway rollout',
            'Sohel Shaikh'
          ),
          kr(
            'Pilot OEE improvement',
            'pts',
            0,
            12,
            4,
            'Predictive maintenance',
            'Sohel Shaikh'
          ),
        ],
      },
      {
        title: 'Execute approved investment',
        keyResults: [
          kr(
            'Capital plan executed',
            '%',
            0,
            100,
            42,
            'Phased procurement',
            'Sohel Shaikh'
          ),
          kr(
            'Milestones delivered on time',
            '%',
            30,
            95,
            55,
            'Stage-gate governance',
            'Sohel Shaikh'
          ),
          kr(
            'Budget variance',
            '%',
            20,
            5,
            12,
            'Monthly cost control',
            'Sohel Shaikh'
          ),
        ],
      },
      {
        title: 'Upskill the workforce',
        keyResults: [
          kr(
            'Employees upskilled (I5.0)',
            'people',
            0,
            120,
            46,
            'Skills academy',
            'Sohel Shaikh'
          ),
          kr(
            'Cross-skilled operators',
            '%',
            10,
            70,
            34,
            'Rotation program',
            'Sohel Shaikh'
          ),
          kr(
            'Certified on new equipment',
            'people',
            0,
            60,
            22,
            'Vendor-led certification',
            'Sohel Shaikh'
          ),
        ],
      },
    ],
  },
  {
    key: 'business-operation',
    owner: 'Aurelia Alhajali',
    objectives: [
      {
        title: 'Improve operational predictability',
        keyResults: [
          kr(
            'Forecast accuracy',
            '%',
            68,
            95,
            88,
            'Rolling forecast + S&OP',
            'Aurelia Alhajali'
          ),
          kr(
            'On-time delivery',
            '%',
            82,
            98,
            94,
            'Capacity planning',
            'Aurelia Alhajali'
          ),
          kr(
            'Plan-vs-actual variance',
            '%',
            18,
            6,
            9,
            'Weekly ops review',
            'Aurelia Alhajali'
          ),
        ],
      },
      {
        title: 'Shorten approval cycle time',
        keyResults: [
          kr(
            'Average approval turnaround',
            'days',
            6,
            1,
            2,
            'Digital approval workflows',
            'Aurelia Alhajali'
          ),
          kr(
            'Requests auto-routed',
            '%',
            20,
            90,
            72,
            'Rules-based routing',
            'Aurelia Alhajali'
          ),
          kr(
            'Approvals within SLA',
            '%',
            65,
            97,
            90,
            'Escalation reminders',
            'Aurelia Alhajali'
          ),
        ],
      },
      {
        title: 'Raise internal-stakeholder satisfaction',
        keyResults: [
          kr(
            'Internal NPS',
            'score',
            20,
            60,
            48,
            'Service-catalogue + SLAs',
            'Aurelia Alhajali'
          ),
          kr(
            'Tickets resolved first contact',
            '%',
            55,
            90,
            78,
            'Knowledge base',
            'Aurelia Alhajali'
          ),
          kr(
            'Quarterly satisfaction survey',
            '/5',
            3.1,
            4.5,
            4.0,
            'Feedback loops',
            'Aurelia Alhajali'
          ),
        ],
      },
    ],
  },
  {
    key: 'lean-six-sigma',
    owner: 'Marco Rodriguez',
    objectives: [
      {
        title: 'Deliver improvement projects',
        keyResults: [
          kr(
            'DMAIC projects completed',
            'count',
            0,
            18,
            10,
            'Project pipeline governance',
            'Marco Rodriguez'
          ),
          kr(
            'Projects with sustained gains',
            '%',
            40,
            90,
            62,
            '90-day control audits',
            'Marco Rodriguez'
          ),
          kr(
            'Average project cycle time',
            'weeks',
            16,
            8,
            11,
            'Kaizen events',
            'Marco Rodriguez'
          ),
        ],
      },
      {
        title: 'Certify Belts across the org',
        keyResults: [
          kr(
            'Green Belts certified',
            'people',
            6,
            40,
            24,
            'GB training cohorts',
            'Marco Rodriguez'
          ),
          kr(
            'Black Belts certified',
            'people',
            1,
            8,
            4,
            'BB mentoring',
            'Marco Rodriguez'
          ),
          kr(
            'Departments with a trained Belt',
            '%',
            30,
            100,
            66,
            'Belt placement plan',
            'Marco Rodriguez'
          ),
        ],
      },
      {
        title: 'Validate financial savings',
        keyResults: [
          kr(
            'Validated savings (finance-signed)',
            'AED k',
            0,
            900,
            500,
            'Finance validation gate',
            'Marco Rodriguez'
          ),
          kr(
            'Projects with hard savings',
            '%',
            35,
            80,
            55,
            'Benefit-tracking template',
            'Marco Rodriguez'
          ),
          kr(
            'Cost-of-poor-quality reduced',
            '%',
            12,
            4,
            8,
            'COPQ dashboard',
            'Marco Rodriguez'
          ),
        ],
      },
    ],
  },
  {
    key: 'external-engagement',
    owner: 'Anoud Alhafedhi',
    objectives: [
      {
        title: 'Grow partnerships & alliances',
        keyResults: [
          kr(
            'Active strategic partnerships',
            'count',
            4,
            16,
            9,
            'Partner outreach program',
            'Anoud Alhafedhi'
          ),
          kr(
            'Joint initiatives launched',
            'count',
            1,
            8,
            3,
            'Co-innovation charters',
            'Anoud Alhafedhi'
          ),
          kr(
            'Partner satisfaction',
            '/5',
            3.4,
            4.6,
            4.0,
            'Quarterly partner reviews',
            'Anoud Alhafedhi'
          ),
        ],
      },
      {
        title: 'Raise brand & thought leadership',
        keyResults: [
          kr(
            'Speaking slots / publications',
            'count',
            2,
            20,
            8,
            'Content + speaker bureau',
            'Anoud Alhafedhi'
          ),
          kr(
            'Earned media mentions',
            'count',
            15,
            120,
            52,
            'PR + analyst relations',
            'Anoud Alhafedhi'
          ),
          kr(
            'Community event participation',
            'events',
            3,
            24,
            10,
            'Event calendar',
            'Anoud Alhafedhi'
          ),
        ],
      },
      {
        title: 'Strengthen stakeholder engagement',
        keyResults: [
          kr(
            'Key stakeholders with a plan',
            '%',
            30,
            100,
            58,
            'Stakeholder mapping',
            'Anoud Alhafedhi'
          ),
          kr(
            'Engagement actions on time',
            '%',
            45,
            95,
            66,
            'Engagement tracker',
            'Anoud Alhafedhi'
          ),
          kr(
            'Stakeholder sentiment',
            '/5',
            3.0,
            4.5,
            3.6,
            'Pulse surveys',
            'Anoud Alhafedhi'
          ),
        ],
      },
    ],
  },
];

export function demoForTeam(key: string): SeedTeamOkr | undefined {
  return OKR_DEMO.find(d => d.key === key);
}
