import {
  DatabaseTableViewIcon,
  EdgelessIcon,
  ImportIcon,
  PageIcon,
  PlusIcon,
  ViewLayersIcon,
} from '@blocksuite/icons/rc';
import { usePageHelper } from '@bridgeflow/core/blocksuite/block-suite-page-list/utils';
import { buildOkrBoard } from '@bridgeflow/core/blocksuite/templates/okr-board';
import { WorkspaceDialogService } from '@bridgeflow/core/modules/dialogs';
import type { DocRecord } from '@bridgeflow/core/modules/doc';
import { DocsService } from '@bridgeflow/core/modules/doc';
import { DocDisplayMetaService } from '@bridgeflow/core/modules/doc-display-meta';
import { WorkbenchService } from '@bridgeflow/core/modules/workbench';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { inferOpenMode } from '@bridgeflow/core/utils';
import track from '@bridgeflow/track';
import { useLiveData, useService } from '@kanban-studios/infra';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';

import * as styles from './styles.css';

// -- EDGE-flavoured colour palette for object icons --
const ICON_COLORS = {
  orange: { bg: 'rgba(241, 90, 41, 0.12)', fg: '#f15a29' },
  blue: { bg: 'rgba(56, 132, 255, 0.12)', fg: '#3884FF' },
  purple: { bg: 'rgba(134, 94, 255, 0.12)', fg: '#865EFF' },
  green: { bg: 'rgba(46, 184, 92, 0.12)', fg: '#2EB85C' },
  pink: { bg: 'rgba(237, 74, 138, 0.12)', fg: '#ED4A8A' },
  teal: { bg: 'rgba(0, 184, 212, 0.12)', fg: '#00B8D4' },
  amber: { bg: 'rgba(245, 166, 35, 0.12)', fg: '#F5A623' },
  indigo: { bg: 'rgba(88, 101, 242, 0.12)', fg: '#5865F2' },
} as const;

type IconColor = (typeof ICON_COLORS)[keyof typeof ICON_COLORS];

// -- Inline SVGs for canvas-native object types (no extra icon deps) --
const svgProps = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const AiSparkIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5 10.1 7.6z" />
    <path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
  </svg>
);

const FlowIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <rect x="3" y="4" width="7" height="5" rx="1.2" />
    <rect x="14" y="15" width="7" height="5" rx="1.2" />
    <path d="M6.5 9v4a2 2 0 0 0 2 2h5" />
  </svg>
);

const TimelineIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M4 6h10M4 12h16M4 18h7" />
    <circle cx="17" cy="6" r="1.6" />
    <circle cx="13" cy="18" r="1.6" />
  </svg>
);

const TargetIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </svg>
);

// ----------------------------------------------------------------------------
// Create-new tiles
// ----------------------------------------------------------------------------

interface QuickStartItem {
  id: string;
  icon: ReactNode;
  label: string;
  hint: string;
  color: IconColor;
  onClick: (e?: MouseEvent) => void;
}

const QuickStartCard = ({ item }: { item: QuickStartItem }) => {
  const iconStyle: CSSProperties = {
    background: item.color.bg,
    color: item.color.fg,
  };
  return (
    <button
      className={styles.quickStartCard}
      onClick={item.onClick}
      tabIndex={0}
      aria-label={`Create ${item.label}`}
    >
      <span className={styles.quickStartIcon} style={iconStyle}>
        {item.icon}
      </span>
      <span className={styles.quickStartLabel}>{item.label}</span>
      <span className={styles.quickStartHint}>{item.hint}</span>
    </button>
  );
};

// ----------------------------------------------------------------------------
// Recent boards
// ----------------------------------------------------------------------------

// Deterministic mock collaborator + tag data keyed off the doc id so cards feel
// alive without persisting anything. Replaced by real presence data later.
const COLLAB_PALETTE = ['#f15a29', '#3884FF', '#865EFF', '#2EB85C', '#ED4A8A'];
const TAG_POOL = ['Product', 'Strategy', 'Research', 'Design', 'Planning'];

function hashString(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

interface RecentDocCardProps {
  docId: string;
  onClick: () => void;
}

const RecentDocCard = memo(function RecentDocCard({
  docId,
  onClick,
}: RecentDocCardProps) {
  const docDisplayMetaService = useService(DocDisplayMetaService);
  const docsService = useService(DocsService);

  const docRecord = useLiveData(docsService.list.doc$(docId));
  const title = useLiveData(docRecord?.title$);
  const Icon = useLiveData(docDisplayMetaService.icon$(docId));
  const updatedDate = useLiveData(
    docRecord?.meta$.map(
      (m: { updatedDate?: number } | undefined) => m?.updatedDate
    )
  );

  const [now] = useState(() => Date.now());
  const timeAgo = useMemo(() => {
    if (!updatedDate) return '';
    const diff = now - updatedDate;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(updatedDate).toLocaleDateString();
  }, [updatedDate, now]);

  const meta = useMemo(() => {
    const h = hashString(docId);
    const collabCount = (h % 3) + 1;
    const isPrivate = h % 2 === 0;
    const tag = TAG_POOL[h % TAG_POOL.length];
    const collaborators = Array.from({ length: collabCount }, (_, i) => ({
      color: COLLAB_PALETTE[(h + i) % COLLAB_PALETTE.length],
      letter: String.fromCharCode(65 + ((h + i * 7) % 26)),
    }));
    return { collaborators, isPrivate, tag };
  }, [docId]);

  if (!docRecord) return null;

  return (
    <button className={styles.recentCard} onClick={onClick} tabIndex={0}>
      <div className={styles.recentThumb} aria-hidden="true">
        <span className={styles.recentThumbIcon}>
          <Icon />
        </span>
      </div>
      <div className={styles.recentBody}>
        <span className={styles.recentCardTitle}>{title || 'Untitled'}</span>
        <div className={styles.recentCardMeta}>
          <span className={styles.recentTag}>{meta.tag}</span>
          <span className={styles.recentDot} />
          <span>{meta.isPrivate ? 'Private' : 'Team'}</span>
          {timeAgo && (
            <>
              <span className={styles.recentDot} />
              <span>{timeAgo}</span>
            </>
          )}
        </div>
      </div>
      <div className={styles.avatarCluster}>
        {meta.collaborators.map((c, i) => (
          <span
            key={i}
            className={styles.avatar}
            style={{ background: c.color }}
          >
            {c.letter}
          </span>
        ))}
      </div>
    </button>
  );
});

// ----------------------------------------------------------------------------
// Template cards
// ----------------------------------------------------------------------------

interface TemplateItem {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  uses: string;
  color: IconColor;
  onClick: (e?: MouseEvent) => void;
}

const TemplateCard = ({ item }: { item: TemplateItem }) => {
  const iconStyle: CSSProperties = {
    background: item.color.bg,
    color: item.color.fg,
  };
  return (
    <button className={styles.templateCard} onClick={item.onClick} tabIndex={0}>
      <span
        className={styles.templatePreview}
        style={{ background: item.color.bg }}
        aria-hidden="true"
      >
        <span
          className={styles.templatePreviewIcon}
          style={{ color: item.color.fg }}
        >
          {item.icon}
        </span>
      </span>
      <span className={styles.templateCardTitle}>{item.title}</span>
      <span className={styles.templateCardDescription}>{item.description}</span>
      <span className={styles.templateUses}>
        <span className={styles.templateIconSmall} style={iconStyle}>
          {item.icon}
        </span>
        {item.uses} uses
      </span>
    </button>
  );
};

// ----------------------------------------------------------------------------
// Spaces
// ----------------------------------------------------------------------------

interface SpaceItem {
  id: string;
  name: string;
  count: string;
  color: string;
  onClick: () => void;
}

const SpaceCard = ({ item }: { item: SpaceItem }) => (
  <button className={styles.spaceCard} onClick={item.onClick} tabIndex={0}>
    <span className={styles.spaceDot} style={{ background: item.color }} />
    <span className={styles.spaceBody}>
      <span className={styles.spaceName}>{item.name}</span>
      <span className={styles.spaceCount}>{item.count}</span>
    </span>
  </button>
);

// ----------------------------------------------------------------------------
// AI recommendations
// ----------------------------------------------------------------------------

interface AiRecItem {
  id: string;
  title: string;
  hint: string;
  prompt: string;
}

const AiRecCard = ({ item }: { item: AiRecItem }) => {
  const handleClick = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('bridge:open-assistant', {
        detail: { prompt: item.prompt },
      })
    );
  }, [item.prompt]);
  return (
    <button className={styles.aiRecCard} onClick={handleClick} tabIndex={0}>
      <span className={styles.aiRecIcon} aria-hidden="true">
        <AiSparkIcon />
      </span>
      <span className={styles.aiRecBody}>
        <span className={styles.aiRecTitle}>{item.title}</span>
        <span className={styles.aiRecHint}>{item.hint}</span>
      </span>
      <span className={styles.aiRecArrow} aria-hidden="true">
        →
      </span>
    </button>
  );
};

// ----------------------------------------------------------------------------
// Dashboard
// ----------------------------------------------------------------------------

export const WorkspaceHome = memo(function WorkspaceHome() {
  const workspaceService = useService(WorkspaceService);
  const docsService = useService(DocsService);
  const workbench = useService(WorkbenchService).workbench;
  const workspaceDialogService = useService(WorkspaceDialogService);

  const currentWorkspace = workspaceService.workspace;
  const workspaceName = useLiveData(currentWorkspace.name$);

  const { createPage, createEdgeless } = usePageHelper(
    currentWorkspace.docCollection
  );

  const allDocs = useLiveData(docsService.list.docs$);
  const recentDocIds = useMemo(() => {
    return allDocs
      .filter((doc: DocRecord) => {
        const meta = doc.meta$.value;
        return meta && !meta.trash;
      })
      .sort((a: DocRecord, b: DocRecord) => {
        const aDate = a.meta$.value?.updatedDate || 0;
        const bDate = b.meta$.value?.updatedDate || 0;
        return (bDate as number) - (aDate as number);
      })
      .slice(0, 6)
      .map((doc: DocRecord) => doc.id);
  }, [allDocs]);

  const handleCreatePage = useCallback(
    (e?: MouseEvent) => {
      createPage('page', { at: inferOpenMode(e) });
      track.$.navigationPanel.$.createDoc();
    },
    [createPage]
  );

  const handleCreateEdgeless = useCallback(
    (e?: MouseEvent) => {
      createEdgeless({ at: inferOpenMode(e) });
      track.$.navigationPanel.$.createDoc();
    },
    [createEdgeless]
  );

  const handleCreateOkr = useCallback(
    (e?: MouseEvent) => {
      const record = docsService.createDoc({
        primaryMode: 'edgeless',
        title: 'OKR Quarterly Plan',
        docProps: {
          onStoreLoad: (storeDoc, { surfaceId }) => {
            buildOkrBoard(storeDoc as never, surfaceId);
          },
        },
      });
      workbench.openDoc(record.id, { at: inferOpenMode(e) });
      track.$.navigationPanel.$.createDoc();
    },
    [docsService, workbench]
  );

  const handleImport = useCallback(() => {
    track.$.navigationPanel.importModal.open();
    workspaceDialogService.open(
      'import',
      undefined,
      (
        payload:
          | {
              docIds: string[];
              entryId?: string;
              isWorkspaceFile?: boolean;
            }
          | undefined
      ) => {
        if (!payload) return;
        const { docIds, entryId, isWorkspaceFile } = payload;
        if (isWorkspaceFile && entryId) {
          workbench.openDoc(entryId);
        } else if (docIds.length > 1) {
          workbench.openAll();
        } else if (docIds.length === 1) {
          workbench.openDoc(docIds[0]);
        }
      }
    );
  }, [workspaceDialogService, workbench]);

  const handleViewAll = useCallback(() => {
    workbench.openAll();
  }, [workbench]);

  const handleOpenDoc = useCallback(
    (docId: string) => {
      workbench.openDoc(docId);
    },
    [workbench]
  );

  const handleInvite = useCallback(() => {
    workspaceDialogService.open('setting', { activeTab: 'workspace:members' });
  }, [workspaceDialogService]);

  const quickStartItems: QuickStartItem[] = useMemo(
    () => [
      {
        id: 'ai-canvas',
        icon: <AiSparkIcon />,
        label: 'AI Canvas',
        hint: 'Generate with AI',
        color: ICON_COLORS.orange,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'board',
        icon: <EdgelessIcon />,
        label: 'Board',
        hint: 'Infinite canvas',
        color: ICON_COLORS.indigo,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'flowchart',
        icon: <FlowIcon />,
        label: 'Flowchart',
        hint: 'Connect ideas',
        color: ICON_COLORS.purple,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'kanban',
        icon: <ViewLayersIcon />,
        label: 'Kanban',
        hint: 'Track tasks',
        color: ICON_COLORS.pink,
        onClick: handleCreatePage,
      },
      {
        id: 'timeline',
        icon: <TimelineIcon />,
        label: 'Timeline',
        hint: 'Plan over time',
        color: ICON_COLORS.amber,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'document',
        icon: <PageIcon />,
        label: 'Document',
        hint: 'Rich text doc',
        color: ICON_COLORS.blue,
        onClick: handleCreatePage,
      },
      {
        id: 'table',
        icon: <DatabaseTableViewIcon />,
        label: 'Table',
        hint: 'Structured data',
        color: ICON_COLORS.green,
        onClick: handleCreatePage,
      },
      {
        id: 'import',
        icon: <ImportIcon />,
        label: 'Import',
        hint: 'Bring your files',
        color: ICON_COLORS.teal,
        onClick: handleImport,
      },
    ],
    [handleCreatePage, handleCreateEdgeless, handleImport]
  );

  const templateItems: TemplateItem[] = useMemo(
    () => [
      {
        id: 'product-strategy',
        icon: <EdgelessIcon />,
        title: 'Product Strategy',
        description: 'Vision, pillars and bets on one board',
        uses: '4.2k',
        color: ICON_COLORS.orange,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'sprint-planning',
        icon: <ViewLayersIcon />,
        title: 'Sprint Planning',
        description: 'Backlog, capacity and sprint goals',
        uses: '6.1k',
        color: ICON_COLORS.purple,
        onClick: handleCreatePage,
      },
      {
        id: 'research-synthesis',
        icon: <PageIcon />,
        title: 'Research Synthesis',
        description: 'Cluster findings into clear insights',
        uses: '2.8k',
        color: ICON_COLORS.blue,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'workshop-canvas',
        icon: <EdgelessIcon />,
        title: 'Workshop Canvas',
        description: 'Facilitate sessions with structure',
        uses: '3.5k',
        color: ICON_COLORS.pink,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'customer-journey',
        icon: <TimelineIcon />,
        title: 'Customer Journey Map',
        description: 'Map touchpoints, pains and moments',
        uses: '5.0k',
        color: ICON_COLORS.teal,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'ai-flow-builder',
        icon: <AiSparkIcon />,
        title: 'AI Flow Builder',
        description: 'Chain AI steps into a pipeline',
        uses: '1.9k',
        color: ICON_COLORS.amber,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'roadmap',
        icon: <TimelineIcon />,
        title: 'Roadmap',
        description: 'Quarters, themes and milestones',
        uses: '7.3k',
        color: ICON_COLORS.green,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'business-model',
        icon: <DatabaseTableViewIcon />,
        title: 'Business Model Canvas',
        description: 'Nine building blocks in one view',
        uses: '2.4k',
        color: ICON_COLORS.indigo,
        onClick: handleCreateEdgeless,
      },
    ],
    [handleCreatePage, handleCreateEdgeless]
  );

  const okrItems: TemplateItem[] = useMemo(
    () => [
      {
        id: 'okr-quarterly-plan',
        icon: <TargetIcon />,
        title: 'OKR Quarterly Plan',
        description: 'Objectives, key results & initiatives on one board',
        uses: '8.7k',
        color: ICON_COLORS.orange,
        onClick: handleCreateOkr,
      },
    ],
    [handleCreateOkr]
  );

  const spaceItems: SpaceItem[] = useMemo(
    () => [
      {
        id: 'product',
        name: 'Product',
        count: '24 boards',
        color: '#f15a29',
        onClick: handleViewAll,
      },
      {
        id: 'engineering',
        name: 'Engineering',
        count: '18 boards',
        color: '#3884FF',
        onClick: handleViewAll,
      },
      {
        id: 'strategy',
        name: 'Strategy',
        count: '9 boards',
        color: '#865EFF',
        onClick: handleViewAll,
      },
      {
        id: 'research',
        name: 'Research',
        count: '12 boards',
        color: '#2EB85C',
        onClick: handleViewAll,
      },
      {
        id: 'operations',
        name: 'Operations',
        count: '7 boards',
        color: '#00B8D4',
        onClick: handleViewAll,
      },
    ],
    [handleViewAll]
  );

  const aiRecItems: AiRecItem[] = useMemo(
    () => [
      {
        id: 'cluster',
        title: 'Cluster last workshop notes',
        hint: 'Group sticky notes into themes',
        prompt: 'Cluster my last workshop notes into clear themes.',
      },
      {
        id: 'roadmap',
        title: 'Generate roadmap from product board',
        hint: 'Turn your board into a timeline',
        prompt: 'Generate a roadmap from my product board.',
      },
      {
        id: 'insights',
        title: 'Convert research into insights',
        hint: 'Surface what matters most',
        prompt: 'Convert my research notes into prioritised insights.',
      },
      {
        id: 'summary',
        title: 'Prepare executive summary',
        hint: 'A crisp brief for leadership',
        prompt: 'Prepare an executive summary of this workspace.',
      },
    ],
    []
  );

  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeInner}>
        {/* Command-center header */}
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeText}>
            <span className={styles.eyebrow}>AI Innovation Canvas</span>
            <style>{
              "@font-face{font-family:'BridgeScript';src:url('/fonts/Kalam-Bold.woff2') format('woff2');font-display:swap;font-weight:700}"
            }</style>
            <h1 className={styles.welcomeTitle}>
              {(() => {
                const t = (workspaceName || 'BRIDGE Flow').trim();
                const i = t.lastIndexOf(' ');
                if (i === -1) return t;
                return (
                  <>
                    {t.slice(0, i)}{' '}
                    <span
                      style={{
                        color: '#f15a29',
                        fontFamily: "'BridgeScript','Segoe Print',cursive",
                        fontWeight: 700,
                      }}
                    >
                      {t.slice(i + 1)}
                    </span>
                  </>
                );
              })()}
            </h1>
            <p className={styles.welcomeSubtitle}>
              Write, draw, plan and build — together on one infinite canvas.
            </p>
          </div>
          <div className={styles.welcomeActions}>
            <button
              className={styles.primaryAction}
              onClick={handleCreateEdgeless}
            >
              <span className={styles.primaryActionIcon}>
                <PlusIcon />
              </span>
              New canvas
            </button>
            <button className={styles.secondaryAction} onClick={handleInvite}>
              Invite team
            </button>
          </div>
        </div>

        {/* Create new */}
        <div className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Create new</h2>
          </div>
          <div className={styles.quickStartGrid}>
            {quickStartItems.map(item => (
              <QuickStartCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* OKR */}
        <div className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>OKR</h2>
          </div>
          <div className={styles.templatesRow}>
            {okrItems.map(item => (
              <TemplateCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Templates */}
        <div className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Start from a template</h2>
            <button className={styles.sectionAction} onClick={handleViewAll}>
              Browse all
            </button>
          </div>
          <div className={styles.templatesRow}>
            {templateItems.map(item => (
              <TemplateCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Recent boards */}
        <div className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent boards</h2>
            {recentDocIds.length > 0 && (
              <button className={styles.sectionAction} onClick={handleViewAll}>
                View all
              </button>
            )}
          </div>
          {recentDocIds.length > 0 ? (
            <div className={styles.recentGrid}>
              {recentDocIds.map((docId: string) => (
                <RecentDocCard
                  key={docId}
                  docId={docId}
                  onClick={() => handleOpenDoc(docId)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <EdgelessIcon />
              </div>
              <p className={styles.emptyText}>
                No boards yet. Spin up your first canvas and invite your team.
              </p>
              <button
                className={styles.emptyAction}
                onClick={handleCreateEdgeless}
              >
                Create a board
              </button>
            </div>
          )}
        </div>

        {/* Spaces + AI recommendations */}
        <div className={styles.splitRow}>
          <div className={styles.sectionWrapper}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Spaces</h2>
            </div>
            <div className={styles.spacesGrid}>
              {spaceItems.map(item => (
                <SpaceCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className={styles.aiPanel}>
            <div className={styles.aiPanelHeader}>
              <span className={styles.aiPanelBadge} aria-hidden="true">
                <AiSparkIcon />
              </span>
              <div>
                <div className={styles.aiPanelTitle}>Workspace AI</div>
                <div className={styles.aiPanelSubtitle}>
                  Recommended for your workspace
                </div>
              </div>
            </div>
            <div className={styles.aiRecList}>
              {aiRecItems.map(item => (
                <AiRecCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
