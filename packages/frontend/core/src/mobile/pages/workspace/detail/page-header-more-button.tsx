import { IconButton, notify, toast, useConfirmModal } from '@bridgeflow/component';
import {
  MenuSeparator,
  MenuSub,
  MobileMenu,
  MobileMenuItem,
} from '@bridgeflow/component/ui/menu';
import { useFavorite } from '@bridgeflow/core/blocksuite/block-suite-header/favorite';
import { Guard, useGuard } from '@bridgeflow/core/components/guard';
import { IsFavoriteIcon } from '@bridgeflow/core/components/pure/icons';
import { DocInfoSheet } from '@bridgeflow/core/mobile/components';
import { MobileTocMenu } from '@bridgeflow/core/mobile/components/toc-menu';
import { DocService } from '@bridgeflow/core/modules/doc';
import { EditorService } from '@bridgeflow/core/modules/editor';
import { ViewService } from '@bridgeflow/core/modules/workbench/services/view';
import { preventDefault } from '@bridgeflow/core/utils';
import { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import {
  DeleteIcon,
  EdgelessIcon,
  InformationIcon,
  MoreHorizontalIcon,
  PageIcon,
  TocIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import { JournalConflictsMenuItem } from './menu/journal-conflicts';
import { JournalTodayActivityMenuItem } from './menu/journal-today-activity';
import { EditorModeSwitch } from './menu/mode-switch';
import * as styles from './page-header-more-button.css';

export const PageHeaderMenuButton = () => {
  const t = useI18n();

  const doc = useService(DocService).doc;
  const docId = doc?.id;
  const canEdit = useGuard('Doc_Update', docId);

  const editorService = useService(EditorService);
  const editorContainer = useLiveData(editorService.editor.editorContainer$);

  const [open, setOpen] = useState(false);
  const location = useLiveData(useService(ViewService).view.location$);

  const isInTrash = useLiveData(
    editorService.editor.doc.meta$.map(meta => meta.trash)
  );
  const primaryMode = useLiveData(editorService.editor.doc.primaryMode$);
  const title = useLiveData(editorService.editor.doc.title$);

  const { favorite, toggleFavorite } = useFavorite(docId);
  const { openConfirmModal } = useConfirmModal();

  const handleSwitchMode = useCallback(() => {
    const mode = primaryMode === 'page' ? 'edgeless' : 'page';
    // TODO(@JimmFly): remove setMode when there has view mode switch
    editorService.editor.setMode(mode);
    editorService.editor.doc.setPrimaryMode(mode);
    track.$.header.docOptions.switchPageMode({
      mode,
    });
    notify.success({
      title:
        primaryMode === 'page'
          ? t['com.bridgeflow.toastMessage.defaultMode.edgeless.title']()
          : t['com.bridgeflow.toastMessage.defaultMode.page.title'](),
      message:
        primaryMode === 'page'
          ? t['com.bridgeflow.toastMessage.defaultMode.edgeless.message']()
          : t['com.bridgeflow.toastMessage.defaultMode.page.message'](),
    });
  }, [primaryMode, editorService, t]);

  const handleMenuOpenChange = useCallback((open: boolean) => {
    if (open) {
      track.$.header.docOptions.open();
    }
    setOpen(open);
  }, []);

  useEffect(() => {
    // when the location is changed, close the menu
    handleMenuOpenChange(false);
  }, [handleMenuOpenChange, location.pathname]);

  const handleToggleFavorite = useCallback(() => {
    track.$.header.docOptions.toggleFavorite();
    toggleFavorite();
  }, [toggleFavorite]);

  const handleMoveToTrash = useCallback(() => {
    if (!doc) {
      return;
    }
    openConfirmModal({
      title: t['com.bridgeflow.moveToTrash.title'](),
      description: t['com.bridgeflow.moveToTrash.confirmModal.description']({
        title: doc.title$.value,
      }),
      confirmText: t['com.bridgeflow.moveToTrash.confirmModal.confirm'](),
      cancelText: t['com.bridgeflow.moveToTrash.confirmModal.cancel'](),
      confirmButtonOptions: {
        variant: 'error',
      },
      onConfirm() {
        doc.moveToTrash();
        track.$.navigationPanel.docs.deleteDoc({
          control: 'button',
        });
        toast(t['com.bridgeflow.toastMessage.movedTrash']());
        // navigate back
        history.back();
      },
    });
  }, [doc, openConfirmModal, t]);

  const EditMenu = (
    <>
      <EditorModeSwitch />
      <JournalTodayActivityMenuItem suffix={<MenuSeparator />} />
      <MobileMenuItem
        prefixIcon={primaryMode === 'page' ? <EdgelessIcon /> : <PageIcon />}
        data-testid="editor-option-menu-mode-switch"
        onSelect={handleSwitchMode}
        disabled={!canEdit}
      >
        {primaryMode === 'page'
          ? t['com.bridgeflow.editorDefaultMode.edgeless']()
          : t['com.bridgeflow.editorDefaultMode.page']()}
      </MobileMenuItem>
      <MobileMenuItem
        data-testid="editor-option-menu-favorite"
        onSelect={handleToggleFavorite}
        prefixIcon={<IsFavoriteIcon favorite={favorite} />}
      >
        {favorite
          ? t['com.bridgeflow.favoritePageOperation.remove']()
          : t['com.bridgeflow.favoritePageOperation.add']()}
      </MobileMenuItem>
      <MenuSeparator />
      <MenuSub
        triggerOptions={{
          prefixIcon: <InformationIcon />,
          onClick: preventDefault,
        }}
        title={title ?? t['unnamed']()}
        items={<DocInfoSheet docId={docId} />}
      >
        <span>{t['com.bridgeflow.page-properties.page-info.view']()}</span>
      </MenuSub>
      <MobileMenu
        title={t['com.bridgeflow.header.menu.toc']()}
        items={
          <div className={styles.outlinePanel}>
            <MobileTocMenu editor={editorContainer?.host ?? null} />
          </div>
        }
      >
        <MobileMenuItem prefixIcon={<TocIcon />} onClick={preventDefault}>
          <span>{t['com.bridgeflow.header.option.view-toc']()}</span>
        </MobileMenuItem>
      </MobileMenu>
      <JournalConflictsMenuItem />
      <Guard docId={docId} permission="Doc_Trash">
        {canMoveToTrash => (
          <MobileMenuItem
            prefixIcon={<DeleteIcon />}
            type="danger"
            disabled={!canMoveToTrash}
            onSelect={handleMoveToTrash}
          >
            {t['com.bridgeflow.moveToTrash.title']()}
          </MobileMenuItem>
        )}
      </Guard>
    </>
  );
  if (isInTrash) {
    return null;
  }
  return (
    <MobileMenu
      items={EditMenu}
      contentOptions={{
        align: 'center',
      }}
      rootOptions={{
        open,
        onOpenChange: handleMenuOpenChange,
      }}
    >
      <IconButton
        size={24}
        data-testid="detail-page-header-more-button"
        className={styles.iconButton}
      >
        <MoreHorizontalIcon />
      </IconButton>
    </MobileMenu>
  );
};
