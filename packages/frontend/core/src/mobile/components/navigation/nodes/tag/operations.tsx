import {
  IconButton,
  MenuItem,
  MenuSeparator,
  toast,
  useConfirmModal,
} from '@bridgeflow/component';
import { usePageHelper } from '@bridgeflow/core/blocksuite/block-suite-page-list/utils';
import { IsFavoriteIcon } from '@bridgeflow/core/components/pure/icons';
import type { NodeOperation } from '@bridgeflow/core/desktop/components/navigation-panel';
import { WorkspaceDialogService } from '@bridgeflow/core/modules/dialogs';
import { DocsService } from '@bridgeflow/core/modules/doc';
import { FavoriteService } from '@bridgeflow/core/modules/favorite';
import { GlobalCacheService } from '@bridgeflow/core/modules/storage';
import { TagService } from '@bridgeflow/core/modules/tag';
import { WorkbenchService } from '@bridgeflow/core/modules/workbench';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import {
  DeleteIcon,
  FolderIcon,
  PlusIcon,
  SplitViewIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useServices } from '@kanban-studios/infra';
import { useCallback, useMemo } from 'react';

import { TagRenameSubMenu } from './dialog';

export const useNavigationPanelTagNodeOperations = (
  tagId: string,
  {
    openNodeCollapsed,
  }: {
    openNodeCollapsed: () => void;
  }
) => {
  const t = useI18n();
  const {
    workbenchService,
    workspaceService,
    tagService,
    favoriteService,
    workspaceDialogService,
    globalCacheService,
  } = useServices({
    WorkbenchService,
    WorkspaceService,
    TagService,
    DocsService,
    FavoriteService,
    WorkspaceDialogService,
    GlobalCacheService,
  });
  const { openConfirmModal } = useConfirmModal();

  const favorite = useLiveData(
    favoriteService.favoriteList.favorite$('tag', tagId)
  );
  const tagRecord = useLiveData(tagService.tagList.tagByTagId$(tagId));

  const { createPage } = usePageHelper(
    workspaceService.workspace.docCollection
  );

  const handleNewDoc = useCallback(() => {
    if (tagRecord) {
      const newDoc = createPage();
      tagRecord?.tag(newDoc.id);
      track.$.navigationPanel.tags.createDoc();
      openNodeCollapsed();
    }
  }, [createPage, openNodeCollapsed, tagRecord]);

  const handleMoveToTrash = useCallback(() => {
    tagService.tagList.deleteTag(tagId);
    track.$.navigationPanel.organize.deleteOrganizeItem({ type: 'tag' });
    toast(t['com.bridgeflow.tags.delete-tags.toast']());
  }, [t, tagId, tagService.tagList]);

  const handleOpenInSplitView = useCallback(() => {
    workbenchService.workbench.openTag(tagId, {
      at: 'beside',
    });
    track.$.navigationPanel.organize.openInSplitView({ type: 'tag' });
  }, [tagId, workbenchService]);

  const handleToggleFavoriteTag = useCallback(() => {
    favoriteService.favoriteList.toggle('tag', tagId);
    track.$.navigationPanel.organize.toggleFavorite({
      type: 'tag',
    });
  }, [favoriteService, tagId]);

  const handleOpenInNewTab = useCallback(() => {
    workbenchService.workbench.openTag(tagId, {
      at: 'new-tab',
    });
    track.$.navigationPanel.organize.openInNewTab({ type: 'tag' });
  }, [tagId, workbenchService]);

  const handleRename = useCallback(
    (newName: string) => {
      if (tagRecord && tagRecord.value$.value !== newName) {
        tagRecord.rename(newName);
        track.$.navigationPanel.organize.renameOrganizeItem({
          type: 'tag',
        });
      }
    },
    [tagRecord]
  );
  const handleChangeColor = useCallback(
    (color: string) => {
      if (tagRecord && tagRecord.color$.value !== color) {
        tagRecord.changeColor(color);
      }
    },
    [tagRecord]
  );
  const handleChangeNameOrColor = useCallback(
    (name?: string, color?: string) => {
      if (name !== undefined) {
        handleRename(name);
      }
      if (color !== undefined) {
        handleChangeColor(color);
      }
    },
    [handleChangeColor, handleRename]
  );
  const handleOpenDocSelector = useCallback(() => {
    const initialIds = tagRecord?.pageIds$.value;
    workspaceDialogService.open(
      'doc-selector',
      {
        init: initialIds ?? [],
        onBeforeConfirm(ids, cb) {
          const hasRemoved = initialIds?.some(id => !ids?.includes(id));
          if (
            hasRemoved &&
            globalCacheService.globalCache.get(
              'mobile:tags:will-be-removed-warning-read'
            ) !== true
          ) {
            openConfirmModal({
              title: t['com.bridgeflow.m.selector.remove-warning.title'](),
              description: t['com.bridgeflow.m.selector.remove-warning.message']({
                type: t['com.bridgeflow.m.selector.type-doc'](),
                where: t['com.bridgeflow.m.selector.where-tag'](),
              }),
              cancelText: t['com.bridgeflow.m.selector.remove-warning.cancel'](),
              confirmText: t['com.bridgeflow.m.selector.remove-warning.confirm'](),
              reverseFooter: true,
              onConfirm: () => {
                globalCacheService.globalCache.set(
                  'mobile:tags:will-be-removed-warning-read',
                  true
                );
                cb();
              },
            });
          } else {
            cb();
          }
        },
      },
      selectedIds => {
        if (selectedIds === undefined) {
          return;
        }
        const newIds = selectedIds.filter(id => !initialIds?.includes(id));
        const removedIds = initialIds?.filter(id => !selectedIds.includes(id));
        newIds.forEach(id => tagRecord?.tag(id));
        removedIds?.forEach(id => tagRecord?.untag(id));
      }
    );
  }, [
    tagRecord,
    workspaceDialogService,
    globalCacheService.globalCache,
    openConfirmModal,
    t,
  ]);

  return useMemo(
    () => ({
      favorite,
      handleNewDoc,
      handleMoveToTrash,
      handleOpenInSplitView,
      handleToggleFavoriteTag,
      handleOpenInNewTab,
      handleRename,
      handleChangeColor,
      handleChangeNameOrColor,
      handleOpenDocSelector,
    }),
    [
      favorite,
      handleChangeColor,
      handleChangeNameOrColor,
      handleMoveToTrash,
      handleNewDoc,
      handleOpenInNewTab,
      handleOpenInSplitView,
      handleRename,
      handleToggleFavoriteTag,
      handleOpenDocSelector,
    ]
  );
};
export const useNavigationPanelTagNodeOperationsMenu = (
  tagId: string,
  option: {
    openNodeCollapsed: () => void;
  }
): NodeOperation[] => {
  const t = useI18n();
  const {
    favorite,
    handleNewDoc,
    handleMoveToTrash,
    handleOpenInSplitView,
    handleToggleFavoriteTag,
    handleChangeNameOrColor,
    handleOpenDocSelector,
  } = useNavigationPanelTagNodeOperations(tagId, option);

  return useMemo(
    () => [
      {
        index: 0,
        inline: true,
        view: (
          <IconButton size="16" onClick={handleNewDoc}>
            <PlusIcon />
          </IconButton>
        ),
      },
      {
        index: 10,
        view: (
          <TagRenameSubMenu
            onConfirm={handleChangeNameOrColor}
            tagId={tagId}
            menuProps={{ triggerOptions: { 'data-testid': 'rename-tag' } }}
          />
        ),
      },
      {
        index: 11,
        view: <MenuSeparator />,
      },
      {
        index: 12,
        view: (
          <MenuItem prefixIcon={<FolderIcon />} onClick={handleOpenDocSelector}>
            {t['com.bridgeflow.m.explorer.tag.manage-docs']()}
          </MenuItem>
        ),
      },
      ...(BUILD_CONFIG.isElectron
        ? [
            {
              index: 100,
              view: (
                <MenuItem
                  prefixIcon={<SplitViewIcon />}
                  onClick={handleOpenInSplitView}
                >
                  {t['com.bridgeflow.workbench.split-view.page-menu-open']()}
                </MenuItem>
              ),
            },
          ]
        : []),
      {
        index: 199,
        view: (
          <MenuItem
            prefixIcon={<IsFavoriteIcon favorite={!!favorite} />}
            onClick={handleToggleFavoriteTag}
          >
            {favorite
              ? t['com.bridgeflow.favoritePageOperation.remove']()
              : t['com.bridgeflow.favoritePageOperation.add']()}
          </MenuItem>
        ),
      },
      {
        index: 9999,
        view: <MenuSeparator key="menu-separator" />,
      },
      {
        index: 10000,
        view: (
          <MenuItem
            type={'danger'}
            prefixIcon={<DeleteIcon />}
            onClick={handleMoveToTrash}
          >
            {t['Delete']()}
          </MenuItem>
        ),
      },
    ],
    [
      favorite,
      handleChangeNameOrColor,
      handleMoveToTrash,
      handleNewDoc,
      handleOpenDocSelector,
      handleOpenInSplitView,
      handleToggleFavoriteTag,
      t,
      tagId,
    ]
  );
};
