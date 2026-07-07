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
}
export const OKR_TEAMS: SeedTeam[] = [
  { key: 'agile', name: 'Agile', accent: '#4c6ef5' },
  { key: 'ai-analytics', name: 'AI & Analytics', accent: '#9b5de5' },
  { key: 'opex', name: 'Opex', accent: '#2eb85c' },
  { key: 'industry-5', name: 'Industry 5.0', accent: '#f15a29' },
  { key: 'business-operation', name: 'Business Operation', accent: '#f5a623' },
  {
    key: 'lean-six-sigma',
    name: 'Lean Six Sigma & Special Projects',
    accent: '#14b8a6',
  },
  {
    key: 'external-engagement',
    name: 'External Engagement',
    accent: '#ec4899',
  },
];

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
  const span = kr.target - kr.baseline;
  const raw =
    span === 0
      ? kr.current >= kr.target
        ? 1
        : 0
      : (kr.current - kr.baseline) / span;
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
    owner: 'Agile Chapter Lead',
    objectives: [
      {
        title: 'Speed up value delivery',
        keyResults: [
          kr(
            'Reduce lead time for changes',
            'days',
            12,
            4,
            6,
            'Trunk-based development + CI gates',
            'R. Mehta'
          ),
          kr(
            'Increase deployment frequency',
            '/week',
            2,
            10,
            8,
            'Automate the release pipeline',
            'R. Mehta'
          ),
          kr(
            'Cut sprint carry-over',
            '%',
            40,
            10,
            18,
            'WIP limits on every board',
            'S. Iqbal'
          ),
        ],
      },
      {
        title: 'Reduce technical debt',
        keyResults: [
          kr(
            'Raise unit-test coverage',
            '%',
            55,
            85,
            78,
            'Coverage gate at 80%',
            'N. Farah'
          ),
          kr(
            'Close critical code-smell issues',
            'count',
            120,
            20,
            44,
            'Weekly refactor day',
            'N. Farah'
          ),
          kr(
            'Reduce CI build time',
            'min',
            22,
            8,
            12,
            'Cache + parallel jobs',
            'T. Okoye'
          ),
        ],
      },
      {
        title: 'Grow agile-culture adoption',
        keyResults: [
          kr(
            'Teams running healthy retros',
            '%',
            40,
            90,
            74,
            'Retro coaching program',
            'L. Chen'
          ),
          kr(
            'Backlog refinement cadence met',
            '%',
            50,
            95,
            80,
            'Refinement templates',
            'L. Chen'
          ),
          kr(
            'Agile-maturity survey score',
            '/5',
            2.5,
            4.5,
            3.9,
            'Quarterly maturity assessment',
            'S. Iqbal'
          ),
        ],
      },
    ],
  },
  {
    key: 'ai-analytics',
    owner: 'Head of AI & Analytics',
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
            'A. Rahman'
          ),
          kr(
            'Monthly active AI-tool users',
            'users',
            40,
            300,
            165,
            'Enablement workshops',
            'A. Rahman'
          ),
          kr(
            'Manual hours saved per month',
            'hrs',
            0,
            800,
            420,
            'Automate top-10 workflows',
            'K. Suzuki'
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
            'D. Novak'
          ),
          kr(
            'Data-freshness SLA met',
            '%',
            60,
            98,
            82,
            'Pipeline monitoring + alerts',
            'D. Novak'
          ),
          kr(
            'Pipeline incident MTTR',
            'hrs',
            8,
            2,
            4,
            'On-call runbooks',
            'K. Suzuki'
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
            'M. Haidar'
          ),
          kr(
            'Certified prompt/BI practitioners',
            'people',
            4,
            30,
            15,
            'Internal certification track',
            'M. Haidar'
          ),
          kr(
            'Teams with an AI champion',
            '%',
            15,
            100,
            58,
            'Champion network',
            'A. Rahman'
          ),
        ],
      },
    ],
  },
  {
    key: 'opex',
    owner: 'Operational Excellence Lead',
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
            'H. Al-Amin'
          ),
          kr(
            'Vendor spend under contract',
            '%',
            62,
            95,
            90,
            'Renegotiate top vendors',
            'H. Al-Amin'
          ),
          kr(
            'Waste incidents (rework)',
            'count',
            220,
            60,
            88,
            'Root-cause + poka-yoke',
            'P. Ivanova'
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
            'P. Ivanova'
          ),
          kr(
            'Average cycle time',
            'days',
            9,
            3,
            4,
            'Remove non-value steps',
            'F. Costa'
          ),
          kr(
            'First-time-right rate',
            '%',
            75,
            97,
            92,
            'Standard work + checklists',
            'F. Costa'
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
            'H. Al-Amin'
          ),
          kr(
            'Processes with owner + KPI',
            '%',
            40,
            100,
            84,
            'Assign process owners',
            'F. Costa'
          ),
          kr(
            'Automation opportunities shipped',
            'count',
            0,
            20,
            15,
            'Automation backlog',
            'P. Ivanova'
          ),
        ],
      },
    ],
  },
  {
    key: 'industry-5',
    owner: 'Industry 5.0 Program Lead',
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
            'G. Bianchi'
          ),
          kr(
            'Connected assets (IoT)',
            'assets',
            0,
            150,
            38,
            'Sensor + gateway rollout',
            'G. Bianchi'
          ),
          kr(
            'Pilot OEE improvement',
            'pts',
            0,
            12,
            4,
            'Predictive maintenance',
            'Y. Tanaka'
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
            'S. Delacroix'
          ),
          kr(
            'Milestones delivered on time',
            '%',
            30,
            95,
            55,
            'Stage-gate governance',
            'S. Delacroix'
          ),
          kr(
            'Budget variance',
            '%',
            20,
            5,
            12,
            'Monthly cost control',
            'Y. Tanaka'
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
            'G. Bianchi'
          ),
          kr(
            'Cross-skilled operators',
            '%',
            10,
            70,
            34,
            'Rotation program',
            'S. Delacroix'
          ),
          kr(
            'Certified on new equipment',
            'people',
            0,
            60,
            22,
            'Vendor-led certification',
            'Y. Tanaka'
          ),
        ],
      },
    ],
  },
  {
    key: 'business-operation',
    owner: 'Business Operations Director',
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
            'C. Mbeki'
          ),
          kr(
            'On-time delivery',
            '%',
            82,
            98,
            94,
            'Capacity planning',
            'C. Mbeki'
          ),
          kr(
            'Plan-vs-actual variance',
            '%',
            18,
            6,
            9,
            'Weekly ops review',
            'R. Silva'
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
            'R. Silva'
          ),
          kr(
            'Requests auto-routed',
            '%',
            20,
            90,
            72,
            'Rules-based routing',
            'R. Silva'
          ),
          kr(
            'Approvals within SLA',
            '%',
            65,
            97,
            90,
            'Escalation reminders',
            'C. Mbeki'
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
            'A. Petrov'
          ),
          kr(
            'Tickets resolved first contact',
            '%',
            55,
            90,
            78,
            'Knowledge base',
            'A. Petrov'
          ),
          kr(
            'Quarterly satisfaction survey',
            '/5',
            3.1,
            4.5,
            4.0,
            'Feedback loops',
            'C. Mbeki'
          ),
        ],
      },
    ],
  },
  {
    key: 'lean-six-sigma',
    owner: 'Lean Six Sigma & Special Projects Lead',
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
            'V. Kumar'
          ),
          kr(
            'Projects with sustained gains',
            '%',
            40,
            90,
            62,
            '90-day control audits',
            'V. Kumar'
          ),
          kr(
            'Average project cycle time',
            'weeks',
            16,
            8,
            11,
            'Kaizen events',
            'E. Johansson'
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
            'E. Johansson'
          ),
          kr(
            'Black Belts certified',
            'people',
            1,
            8,
            4,
            'BB mentoring',
            'V. Kumar'
          ),
          kr(
            'Departments with a trained Belt',
            '%',
            30,
            100,
            66,
            'Belt placement plan',
            'E. Johansson'
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
            'V. Kumar'
          ),
          kr(
            'Projects with hard savings',
            '%',
            35,
            80,
            55,
            'Benefit-tracking template',
            'E. Johansson'
          ),
          kr(
            'Cost-of-poor-quality reduced',
            '%',
            12,
            4,
            8,
            'COPQ dashboard',
            'V. Kumar'
          ),
        ],
      },
    ],
  },
  {
    key: 'external-engagement',
    owner: 'External Engagement Lead',
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
            'N. Abbas'
          ),
          kr(
            'Joint initiatives launched',
            'count',
            1,
            8,
            3,
            'Co-innovation charters',
            'N. Abbas'
          ),
          kr(
            'Partner satisfaction',
            '/5',
            3.4,
            4.6,
            4.0,
            'Quarterly partner reviews',
            'J. Weber'
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
            'J. Weber'
          ),
          kr(
            'Earned media mentions',
            'count',
            15,
            120,
            52,
            'PR + analyst relations',
            'J. Weber'
          ),
          kr(
            'Community event participation',
            'events',
            3,
            24,
            10,
            'Event calendar',
            'N. Abbas'
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
            'N. Abbas'
          ),
          kr(
            'Engagement actions on time',
            '%',
            45,
            95,
            66,
            'Engagement tracker',
            'J. Weber'
          ),
          kr(
            'Stakeholder sentiment',
            '/5',
            3.0,
            4.5,
            3.6,
            'Pulse surveys',
            'N. Abbas'
          ),
        ],
      },
    ],
  },
];

export function demoForTeam(key: string): SeedTeamOkr | undefined {
  return OKR_DEMO.find(d => d.key === key);
}
