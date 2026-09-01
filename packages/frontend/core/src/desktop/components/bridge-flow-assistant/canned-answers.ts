/**
 * Offline answer bank for the in-product assistant.
 *
 * The assistant used to proxy every question to Gemini, which meant shipping an
 * API key in the bundle and showing a "key missing" error whenever it wasn't
 * set. The questions people actually ask it are a small, stable set about how
 * to use the workspace, so those answers are written out here and matched by
 * keyword instead - no key, no network call, no failure state.
 */

type CannedAnswer = {
  id: string;
  /** Lowercase single words or phrases; a phrase matches as a substring. */
  keywords: string[];
  answer: string;
};

// Punctuation out, single-spaced, padded so ` word ` matches whole tokens only
// (otherwise "tag" would match "vantage").
function normalize(question: string) {
  return ` ${question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;
}

function hits(padded: string, keyword: string) {
  if (keyword.includes(' ')) {
    return padded.includes(keyword);
  }
  return padded.includes(` ${keyword} `) || padded.includes(` ${keyword}s `);
}

const ANSWERS: CannedAnswer[] = [
  {
    id: 'getting-started',
    keywords: [
      'get started',
      'getting started',
      'start',
      'begin',
      'new user',
      'onboarding',
      'checklist',
      'first',
      'setup',
      'set up',
      'tour',
    ],
    answer: [
      'Welcome to BRIDGE Flow. Here is the shortest path to a workspace that feels like yours:',
      '1. Create your first doc from the sidebar - every page starts as a blank canvas you can write on straight away.\n2. Give it a title on the first line. That title is what search and the doc list will show.\n3. Make two or three folders for the areas you actually work in, and drag the doc into one.\n4. Star the two docs you open most so they sit at the top of the sidebar under Favorites.\n5. Open Settings and pick your theme and default font.',
      'That is genuinely enough to start. Tags, collections and the whiteboard are worth adding later, once you have enough pages that finding things takes more than a glance.',
    ].join('\n\n'),
  },
  {
    id: 'organize',
    keywords: [
      'organize',
      'organise',
      'organized',
      'folder',
      'tag',
      'collection',
      'favorite',
      'favourite',
      'structure',
      'sort',
      'categorize',
      'label',
      'group',
    ],
    answer: [
      'Folders, tags, collections and favorites solve four different problems - using each for its own job keeps them from overlapping:',
      '**Folders** are for where something lives. One home per doc, mirroring how you think about your work (Projects, Meetings, Research). Keep the list short.\n\n**Tags** are for what something is about. A doc can carry several, so use them for themes that cut across folders - `#q3`, `#customer`, `#draft`.\n\n**Collections** are saved views. Define a rule once ("everything tagged #draft") and the collection keeps itself up to date.\n\n**Favorites** are for right now - the handful of docs in flight this week. Prune them often.',
      'A good rule of thumb: if you find yourself making a folder for something you would describe with an adjective, it probably wants to be a tag instead.',
    ].join('\n\n'),
  },
  {
    id: 'search',
    keywords: [
      'search',
      'find',
      'lookup',
      'look up',
      'locate',
      'missing',
      'where is',
      'quick search',
      'filter',
    ],
    answer: [
      'Search is the fastest way around the workspace once you have more than a few dozen docs.',
      'Open quick search with **Ctrl/Cmd + K** from anywhere. It matches on titles and body text, so a half-remembered phrase from the middle of a page is enough to get you back to it.',
      'Two things that make it much sharper: give docs real titles rather than leaving them "Untitled", and tag as you go. Once tags are in place you can filter to a theme and skim, instead of guessing at wording.',
      'If you keep running the same search, save it as a collection - it becomes a permanent entry in the sidebar that stays current on its own.',
    ].join('\n\n'),
  },
  {
    id: 'docs',
    keywords: [
      'doc',
      'note',
      'page',
      'write',
      'writing',
      'edit',
      'text',
      'markdown',
      'format',
      'block',
      'heading',
      'table',
      'list',
    ],
    answer: [
      'Docs in BRIDGE Flow are built from blocks - each paragraph, heading, list, image or table is a block you can drag to reorder.',
      'Type **/** on an empty line to open the block menu; that is where headings, checklists, tables, code blocks, dividers and embeds live. Markdown shortcuts also work inline, so `#` plus space becomes a heading and `-` plus space starts a list.',
      'Select any text to get the formatting toolbar for bold, italic, links and inline code. To move a block, grab the handle on its left edge and drag.',
      'The first line of the page acts as its title, so start there - it is what shows up in search, the sidebar and any collection the doc appears in.',
    ].join('\n\n'),
  },
  {
    id: 'whiteboard',
    keywords: [
      'whiteboard',
      'canvas',
      'edgeless',
      'draw',
      'diagram',
      'sticky',
      'shape',
      'infinite',
      'board',
      'sketch',
      'mind map',
    ],
    answer: [
      'Every doc has two modes, and they are the same content seen two ways. Page mode is the linear document; edgeless mode is an infinite canvas. Toggle between them from the switch in the top-right of the doc.',
      'On the canvas you can add shapes, connectors, sticky notes, freehand pen strokes, images and frames - and you can drop existing docs onto it as linked cards, which is what makes it useful for planning rather than just drawing.',
      'Anything you write in page mode shows up on the canvas as a note block you can move around, so you can draft linearly and then rearrange spatially without copying anything.',
      'Frames are worth learning early: they group a region of the canvas so you can move a whole cluster at once.',
    ].join('\n\n'),
  },
  {
    id: 'okr',
    keywords: [
      'okr',
      'objective',
      'key result',
      'dashboard',
      'goal',
      'target',
      'progress',
      'on track',
      'quarter',
      'team progress',
    ],
    answer: [
      'The OKR area has three views that work together:',
      'The **dashboard** is the read-only rollup - every team, their objectives, and a progress bar per objective plus an overall figure and an on-track / at-risk / off-track count.\n\nThe **editor** is where you enter objectives and key results for your team. Progress is calculated from current value against target, so you update the number and the percentage follows.\n\nAn **objective detail** view opens when you click any objective on the dashboard, showing its key results and how it compares to the team average.',
      'Status is derived, not set by hand - an objective reads as on track when its progress is keeping pace with how far into the quarter you are.',
    ].join('\n\n'),
  },
  {
    id: 'share',
    keywords: [
      'share',
      'sharing',
      'collaborate',
      'collaboration',
      'invite',
      'team',
      'member',
      'permission',
      'together',
      'comment',
      'publish',
      'link',
    ],
    answer: [
      'Sharing works per doc. Open the doc you want to share and use the Share control in the top-right.',
      'From there you can invite specific people to the workspace, or publish the doc to a link for anyone who has it. Published links are read-only unless you grant edit access explicitly, so they are safe to send outside the team.',
      'When two people have the same doc open, edits sync live and you will see the other cursor moving. There is no save button - changes are committed as you type.',
      'If you are sharing a whole area of work rather than one page, share a collection instead: it stays current as docs are added, so you do not have to re-send links.',
    ].join('\n\n'),
  },
  {
    id: 'settings',
    keywords: [
      'setting',
      'preference',
      'theme',
      'dark mode',
      'light mode',
      'appearance',
      'font',
      'language',
      'customize',
      'configure',
      'account',
      'profile',
    ],
    answer: [
      'Settings live behind your avatar in the bottom-left of the sidebar.',
      'The **Appearance** section covers light and dark theme, the default font for docs, and display density. **Account** is where your name and email live. **Workspace** covers the workspace name, icon and member list.',
      'Two settings are worth changing on day one: pick the theme that matches your system so the app does not glare at you, and set the default font - it applies to every new doc, which saves formatting each one by hand.',
      'Changes save as you make them, so you can close the panel whenever you are done.',
    ].join('\n\n'),
  },
  {
    id: 'shortcuts',
    keywords: [
      'shortcut',
      'keyboard',
      'hotkey',
      'key binding',
      'faster',
      'quicker',
      'speed up',
    ],
    answer: [
      'The handful worth committing to memory:',
      '**Ctrl/Cmd + K** - quick search, and the fastest way to jump to any doc\n**Ctrl/Cmd + N** - new doc\n**/** - block menu, on any empty line\n**Ctrl/Cmd + B / I / U** - bold, italic, underline\n**Ctrl/Cmd + Z** and **Ctrl/Cmd + Shift + Z** - undo and redo\n**Esc** - close the current panel or overlay',
      'Markdown shortcuts are the other big time save while writing: `#` plus space for a heading, `-` plus space for a bullet, `[]` plus space for a checkbox, and backticks around text for inline code.',
    ].join('\n\n'),
  },
  {
    id: 'voice',
    keywords: [
      'voice',
      'speak',
      'speech',
      'microphone',
      'mic',
      'dictate',
      'talk',
      'audio',
      'read aloud',
    ],
    answer: [
      'This panel has two separate voice features.',
      '**Voice** turns on your microphone and transcribes what you say into the question box, so you can ask without typing. It relies on the browser speech API, which means Chrome or Edge - Safari and Firefox will tell you it is unavailable.',
      '**Speak** goes the other way: when it is on, my replies are read out loud. It is a toggle, so it stays on until you switch it off.',
      'Both are browser features and run on your machine, so nothing is sent anywhere for either one.',
    ].join('\n\n'),
  },
  {
    id: 'import-export',
    keywords: [
      'import',
      'export',
      'migrate',
      'backup',
      'download',
      'pdf',
      'notion',
      'markdown file',
      'html',
      'move from',
    ],
    answer: [
      'To bring work in, use Import from the workspace menu. Markdown, HTML and Notion exports all come through with their structure intact - headings, lists and tables survive the trip. Bring folders over in batches rather than all at once so you can fix anything that lands oddly.',
      'To get work out, open the doc menu and choose Export. A single doc can go out as Markdown, HTML or PDF; PDF is the right pick for anything you are sending to someone outside the workspace.',
      'For a full backup, export the workspace from Settings rather than exporting docs one at a time.',
    ].join('\n\n'),
  },
  {
    id: 'trash',
    keywords: [
      'trash',
      'delete',
      'deleted',
      'remove',
      'restore',
      'recover',
      'undo delete',
      'bin',
      'lost',
      'gone',
    ],
    answer: [
      'Deleting a doc moves it to Trash rather than destroying it, so a wrong click is recoverable.',
      'Open Trash from the bottom of the sidebar to see everything you have removed. Each entry can be restored to where it came from, and restoring puts it back in its original folder with its tags intact.',
      'Emptying the trash is the only irreversible step - there is no recovery after that, so it is worth a look through the list before you confirm.',
      'If a doc has simply gone missing rather than been deleted, try quick search with **Ctrl/Cmd + K** first; more often than not it has been dragged into an unexpected folder.',
    ].join('\n\n'),
  },
  {
    id: 'capabilities',
    keywords: [
      'what can you do',
      'who are you',
      'help me',
      'capabilities',
      'what do you do',
      'how do you work',
      'about you',
    ],
    answer: [
      'I am the in-product guide for BRIDGE Flow. I can walk you through how the workspace works and how to get it organized.',
      'Things I can help with: getting started as a new user, the difference between folders, tags, collections and favorites, searching and finding docs, writing and formatting, the whiteboard canvas, the OKR dashboard and editor, sharing and collaboration, settings, keyboard shortcuts, import and export, and recovering deleted docs.',
      'What I cannot do is act on the workspace for you - I will not create, edit or move anything. I explain where things are and what to click, and you stay in control of the actual changes.',
      'Ask in your own words, or tap one of the buttons above to start.',
    ].join('\n\n'),
  },
];

const FALLBACK = [
  'I do not have a prepared answer for that one.',
  'I can help with getting started, organizing with folders, tags, collections and favorites, searching, writing and formatting docs, the whiteboard canvas, the OKR dashboard, sharing and collaboration, settings, keyboard shortcuts, import and export, and restoring deleted docs.',
  'Try asking about one of those and I will walk you through it step by step.',
].join('\n\n');

/**
 * Pick the best-matching prepared answer for `question`, scoring each entry by
 * how many of its keywords appear. Falls back to a menu of what is covered when
 * nothing matches.
 */
export function answerFor(question: string): string {
  const padded = normalize(question);

  let best: CannedAnswer | null = null;
  let bestScore = 0;

  for (const entry of ANSWERS) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (hits(padded, keyword)) {
        // Phrases are far more specific than single words, so weight them up.
        score += keyword.includes(' ') ? 3 : 1;
      }
    }
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }

  return best ? best.answer : FALLBACK;
}
