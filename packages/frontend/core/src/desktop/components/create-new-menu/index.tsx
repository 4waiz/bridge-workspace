import { Menu } from '@bridgeflow/component';
import { usePageHelper } from '@bridgeflow/core/blocksuite/block-suite-page-list/utils';
import { WorkspaceDialogService } from '@bridgeflow/core/modules/dialogs';
import { WorkbenchService } from '@bridgeflow/core/modules/workbench';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { inferOpenMode } from '@bridgeflow/core/utils';
import track from '@bridgeflow/track';
import {
  ArrowDownSmallIcon,
  DatabaseTableViewIcon,
  EdgelessIcon,
  ImportIcon,
  PageIcon,
  PlusIcon,
  ViewLayersIcon,
} from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { memo, useCallback, useState } from 'react';

import * as styles from './styles.css';

// Per-item colors (Miro-style)
const ITEM_COLORS = {
  document: { bg: 'rgba(56, 132, 255, 0.12)', fg: '#3884FF' },
  whiteboard: { bg: 'rgba(255, 106, 49, 0.12)', fg: '#FF6A31' },
  kanban: { bg: 'rgba(134, 94, 255, 0.12)', fg: '#865EFF' },
  table: { bg: 'rgba(46, 184, 92, 0.12)', fg: '#2EB85C' },
  import: { bg: 'rgba(0, 184, 212, 0.12)', fg: '#00B8D4' },
} as const;

interface CreateMenuItem {
  id: string;
  icon: ReactNode;
  label: string;
  description?: string;
  color: { bg: string; fg: string };
  disabled?: boolean;
  onClick?: (e?: MouseEvent) => void;
}

interface CreateMenuSection {
  id: string;
  label?: string;
  items: CreateMenuItem[];
}

const CreateMenuItemComponent = ({
  item,
  onClose,
}: {
  item: CreateMenuItem;
  onClose: () => void;
}) => {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (item.disabled) return;
      item.onClick?.(e);
      onClose();
    },
    [item, onClose]
  );

  const iconStyle: CSSProperties = {
    background: item.color.bg,
    color: item.color.fg,
  };

  return (
    <button
      className={styles.menuItem}
      data-disabled={item.disabled}
      onClick={handleClick}
      tabIndex={0}
      role="menuitem"
    >
      <span className={styles.menuItemIcon} style={iconStyle}>
        {item.icon}
      </span>
      <span className={styles.menuItemContent}>
        <span className={styles.menuItemLabel}>{item.label}</span>
        {item.description && (
          <span className={styles.menuItemDescription}>{item.description}</span>
        )}
      </span>
    </button>
  );
};

const CreateMenuContent = ({ onClose }: { onClose: () => void }) => {
  const workspaceService = useService(WorkspaceService);
  const workbench = useService(WorkbenchService).workbench;
  const workspaceDialogService = useService(WorkspaceDialogService);

  const { createPage, createEdgeless } = usePageHelper(
    workspaceService.workspace.docCollection
  );

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

  const handleCreateDatabase = useCallback(
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

  const sections: CreateMenuSection[] = [
    {
      id: 'create',
      items: [
        {
          id: 'document',
          icon: <PageIcon />,
          label: 'Document',
          description: 'Rich text with blocks',
          color: ITEM_COLORS.document,
          onClick: handleCreatePage,
        },
        {
          id: 'whiteboard',
          icon: <EdgelessIcon />,
          label: 'Board / Whiteboard',
          description: 'Infinite canvas',
          color: ITEM_COLORS.whiteboard,
          onClick: handleCreateEdgeless,
        },
      ],
    },
    {
      id: 'data',
      label: 'Data views',
      items: [
        {
          id: 'kanban',
          icon: <ViewLayersIcon />,
          label: 'Kanban',
          description: 'Board-style task view',
          color: ITEM_COLORS.kanban,
          onClick: handleCreatePage,
        },
        {
          id: 'table',
          icon: <DatabaseTableViewIcon />,
          label: 'Table / Database',
          description: 'Structured data grid',
          color: ITEM_COLORS.table,
          onClick: handleCreateDatabase,
        },
      ],
    },
    {
      id: 'other',
      label: 'Other',
      items: [
        {
          id: 'import',
          icon: <ImportIcon />,
          label: 'Import',
          description: 'Markdown, HTML, or workspace file',
          color: ITEM_COLORS.import,
          onClick: handleImport,
        },
      ],
    },
  ];

  return (
    <div className={styles.menuContent} role="menu">
      {sections.map((section, sectionIndex) => (
        <div key={section.id} className={styles.menuSection}>
          {sectionIndex > 0 && <div className={styles.menuDivider} />}
          {section.label && (
            <div className={styles.menuSectionLabel}>{section.label}</div>
          )}
          {section.items.map(item => (
            <CreateMenuItemComponent
              key={item.id}
              item={item}
              onClose={onClose}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CreateNewButton = memo(function CreateNewButton() {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Menu
      rootOptions={{
        open,
        onOpenChange: setOpen,
      }}
      items={<CreateMenuContent onClose={handleClose} />}
      contentOptions={{
        side: 'bottom',
        align: 'start',
        sideOffset: 4,
        style: { padding: 0 },
      }}
    >
      <button
        className={styles.createNewButton}
        data-testid="create-new-button"
        aria-label="Create new"
      >
        <span className={styles.createNewButtonIcon}>
          <PlusIcon />
        </span>
        Create new
        <span className={styles.createNewButtonArrow}>
          <ArrowDownSmallIcon />
        </span>
      </button>
    </Menu>
  );
});
