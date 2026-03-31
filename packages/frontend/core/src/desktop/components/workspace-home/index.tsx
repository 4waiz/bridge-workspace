import { usePageHelper } from '@affine/core/blocksuite/block-suite-page-list/utils';
import { WorkspaceDialogService } from '@affine/core/modules/dialogs';
import type { DocRecord } from '@affine/core/modules/doc';
import { DocsService } from '@affine/core/modules/doc';
import { DocDisplayMetaService } from '@affine/core/modules/doc-display-meta';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { inferOpenMode } from '@affine/core/utils';
import track from '@affine/track';
import {
  DatabaseTableViewIcon,
  EdgelessIcon,
  ImportIcon,
  PageIcon,
  SearchIcon,
  SettingsIcon,
  TagsIcon,
  TodayIcon,
  ViewLayersIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';

import * as styles from './styles.css';

// -- Color palette for Miro-style colorful icons --
const ICON_COLORS = {
  blue: { bg: 'rgba(56, 132, 255, 0.10)', fg: '#3884FF' },
  orange: { bg: 'rgba(255, 106, 49, 0.10)', fg: '#FF6A31' },
  purple: { bg: 'rgba(134, 94, 255, 0.10)', fg: '#865EFF' },
  green: { bg: 'rgba(46, 184, 92, 0.10)', fg: '#2EB85C' },
  pink: { bg: 'rgba(237, 74, 138, 0.10)', fg: '#ED4A8A' },
  teal: { bg: 'rgba(0, 184, 212, 0.10)', fg: '#00B8D4' },
  amber: { bg: 'rgba(245, 166, 35, 0.10)', fg: '#F5A623' },
  red: { bg: 'rgba(234, 67, 53, 0.10)', fg: '#EA4335' },
} as const;

interface QuickStartItem {
  id: string;
  icon: ReactNode;
  label: string;
  color: (typeof ICON_COLORS)[keyof typeof ICON_COLORS];
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
    </button>
  );
};

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

  if (!docRecord) return null;

  return (
    <button className={styles.recentCard} onClick={onClick} tabIndex={0}>
      <div className={styles.recentCardHeader}>
        <span className={styles.recentCardIcon}>
          <Icon />
        </span>
        <span className={styles.recentCardTitle}>{title || 'Untitled'}</span>
      </div>
      {timeAgo && (
        <div className={styles.recentCardMeta}>
          <span>{timeAgo}</span>
        </div>
      )}
    </button>
  );
});

interface TemplateItem {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  color: (typeof ICON_COLORS)[keyof typeof ICON_COLORS];
  onClick: (e?: MouseEvent) => void;
}

const TemplateCard = ({ item }: { item: TemplateItem }) => {
  const iconStyle: CSSProperties = {
    background: item.color.bg,
    color: item.color.fg,
  };
  return (
    <button className={styles.templateCard} onClick={item.onClick} tabIndex={0}>
      <span className={styles.templateCardIcon} style={iconStyle}>
        {item.icon}
      </span>
      <span className={styles.templateCardTitle}>{item.title}</span>
      <span className={styles.templateCardDescription}>{item.description}</span>
    </button>
  );
};

interface TipItem {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  color: (typeof ICON_COLORS)[keyof typeof ICON_COLORS];
  onClick: () => void;
}

const TipCard = ({ item }: { item: TipItem }) => {
  const iconStyle: CSSProperties = {
    background: item.color.bg,
    color: item.color.fg,
  };
  return (
    <button className={styles.tipCard} onClick={item.onClick} tabIndex={0}>
      <span className={styles.tipCardIcon} style={iconStyle}>
        {item.icon}
      </span>
      <div className={styles.tipCardContent}>
        <span className={styles.tipCardTitle}>{item.title}</span>
        <span className={styles.tipCardDescription}>{item.description}</span>
      </div>
    </button>
  );
};

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

  // Get recent docs (last 8 updated)
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
      .slice(0, 8)
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

  const handleCreateKanban = useCallback(
    (e?: MouseEvent) => {
      createPage('page', { at: inferOpenMode(e) });
      track.$.navigationPanel.$.createDoc();
    },
    [createPage]
  );

  const handleCreateTable = useCallback(
    (e?: MouseEvent) => {
      createPage('page', { at: inferOpenMode(e) });
      track.$.navigationPanel.$.createDoc();
    },
    [createPage]
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

  const handleOpenJournals = useCallback(() => {
    workbench.open('/journals');
  }, [workbench]);

  const handleOpenSearch = useCallback(() => {
    workbench.openAll();
  }, [workbench]);

  const handleOpenSettings = useCallback(() => {
    workspaceDialogService.open('setting', { activeTab: 'appearance' });
  }, [workspaceDialogService]);

  const quickStartItems: QuickStartItem[] = useMemo(
    () => [
      {
        id: 'document',
        icon: <PageIcon />,
        label: 'Document',
        color: ICON_COLORS.blue,
        onClick: handleCreatePage,
      },
      {
        id: 'whiteboard',
        icon: <EdgelessIcon />,
        label: 'Board',
        color: ICON_COLORS.orange,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'kanban',
        icon: <ViewLayersIcon />,
        label: 'Kanban',
        color: ICON_COLORS.purple,
        onClick: handleCreateKanban,
      },
      {
        id: 'table',
        icon: <DatabaseTableViewIcon />,
        label: 'Table',
        color: ICON_COLORS.green,
        onClick: handleCreateTable,
      },
      {
        id: 'import',
        icon: <ImportIcon />,
        label: 'Import',
        color: ICON_COLORS.teal,
        onClick: handleImport,
      },
    ],
    [
      handleCreatePage,
      handleCreateEdgeless,
      handleCreateKanban,
      handleCreateTable,
      handleImport,
    ]
  );

  const templateItems: TemplateItem[] = useMemo(
    () => [
      {
        id: 'meeting-notes',
        icon: <PageIcon />,
        title: 'Meeting Notes',
        description: 'Structured agenda, action items, and follow-ups',
        color: ICON_COLORS.blue,
        onClick: handleCreatePage,
      },
      {
        id: 'project-board',
        icon: <EdgelessIcon />,
        title: 'Project Board',
        description: 'Visual overview with tasks and milestones',
        color: ICON_COLORS.orange,
        onClick: handleCreateEdgeless,
      },
      {
        id: 'weekly-planner',
        icon: <TodayIcon />,
        title: 'Weekly Planner',
        description: 'Plan your week with daily goals and priorities',
        color: ICON_COLORS.green,
        onClick: handleCreatePage,
      },
      {
        id: 'brainstorm',
        icon: <EdgelessIcon />,
        title: 'Brainstorm Canvas',
        description: 'Freeform space for ideas and mind mapping',
        color: ICON_COLORS.pink,
        onClick: handleCreateEdgeless,
      },
    ],
    [handleCreatePage, handleCreateEdgeless]
  );

  const tipItems: TipItem[] = useMemo(
    () => [
      {
        id: 'search',
        icon: <SearchIcon />,
        title: 'Quick Search',
        description: 'Press Ctrl+K to find anything instantly',
        color: ICON_COLORS.blue,
        onClick: handleOpenSearch,
      },
      {
        id: 'journal',
        icon: <TodayIcon />,
        title: 'Daily Journal',
        description: 'Write daily notes organized by date',
        color: ICON_COLORS.amber,
        onClick: handleOpenJournals,
      },
      {
        id: 'organize',
        icon: <TagsIcon />,
        title: 'Tags & Folders',
        description: 'Organize docs with tags and nested folders',
        color: ICON_COLORS.purple,
        onClick: handleViewAll,
      },
      {
        id: 'settings',
        icon: <SettingsIcon />,
        title: 'Customize',
        description: 'Theme, language, and workspace preferences',
        color: ICON_COLORS.teal,
        onClick: handleOpenSettings,
      },
    ],
    [handleOpenSearch, handleOpenJournals, handleViewAll, handleOpenSettings]
  );

  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeInner}>
        {/* Welcome section */}
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            {workspaceName || 'Bridge Workspace'}
          </h1>
          <p className={styles.welcomeSubtitle}>
            Write, draw, plan, and organize — all in one place.
          </p>
        </div>

        {/* Quick start section */}
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

        {/* Templates section */}
        <div className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Start from a template</h2>
          </div>
          <div className={styles.templatesRow}>
            {templateItems.map(item => (
              <TemplateCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Recent documents section */}
        <div className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent</h2>
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
                <PageIcon />
              </div>
              <p className={styles.emptyText}>
                No documents yet. Create your first document to get started.
              </p>
              <button className={styles.emptyAction} onClick={handleCreatePage}>
                Create a document
              </button>
            </div>
          )}
        </div>

        {/* Tips & shortcuts section */}
        <div className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Explore your workspace</h2>
          </div>
          <div className={styles.tipCardsRow}>
            {tipItems.map(item => (
              <TipCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
