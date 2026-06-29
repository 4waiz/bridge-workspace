import { IconButton, usePromptModal } from '@bridgeflow/component';
import { CollectionService } from '@bridgeflow/core/modules/collection';
import { NavigationPanelService } from '@bridgeflow/core/modules/navigation-panel';
import { WorkbenchService } from '@bridgeflow/core/modules/workbench';
import { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { AddCollectionIcon } from '@blocksuite/icons/rc';
import { useLiveData, useServices } from '@kanban-studios/infra';
import { useCallback, useMemo } from 'react';

import { CollapsibleSection } from '../../layouts/collapsible-section';
import { NavigationPanelCollectionNode } from '../../nodes/collection';
import { NavigationPanelTreeRoot } from '../../tree';
import { RootEmpty } from './empty';
import * as styles from './index.css';

export const NavigationPanelCollections = () => {
  const t = useI18n();
  const { collectionService, workbenchService, navigationPanelService } =
    useServices({
      CollectionService,
      WorkbenchService,
      NavigationPanelService,
    });
  const collections = useLiveData(collectionService.collections$);
  const { openPromptModal } = usePromptModal();
  const path = useMemo(() => ['collections'], []);
  const handleCreateCollection = useCallback(() => {
    openPromptModal({
      title: t['com.bridgeflow.editCollection.saveCollection'](),
      label: t['com.bridgeflow.editCollectionName.name'](),
      inputOptions: {
        placeholder: t['com.bridgeflow.editCollectionName.name.placeholder'](),
      },
      children: (
        <div className={styles.createTips}>
          {t['com.bridgeflow.editCollectionName.createTips']()}
        </div>
      ),
      confirmText: t['com.bridgeflow.editCollection.save'](),
      cancelText: t['com.bridgeflow.editCollection.button.cancel'](),
      confirmButtonOptions: {
        variant: 'primary',
      },
      onConfirm(name) {
        const id = collectionService.createCollection({ name });
        track.$.navigationPanel.organize.createOrganizeItem({
          type: 'collection',
        });
        workbenchService.workbench.openCollection(id);
        navigationPanelService.setCollapsed(path, false);
      },
    });
  }, [
    collectionService,
    navigationPanelService,
    openPromptModal,
    path,
    t,
    workbenchService.workbench,
  ]);

  return (
    <CollapsibleSection
      path={path}
      testId="navigation-panel-collections"
      title={t['com.bridgeflow.rootAppSidebar.collections']()}
      actions={
        <IconButton
          data-testid="navigation-panel-bar-add-collection-button"
          onClick={handleCreateCollection}
          size="16"
          tooltip={t[
            'com.bridgeflow.rootAppSidebar.explorer.collection-section-add-tooltip'
          ]()}
        >
          <AddCollectionIcon />
        </IconButton>
      }
    >
      <NavigationPanelTreeRoot
        placeholder={<RootEmpty onClickCreate={handleCreateCollection} />}
      >
        {Array.from(collections.values()).map(collection => (
          <NavigationPanelCollectionNode
            key={collection.id}
            collectionId={collection.id}
            reorderable={false}
            location={{
              at: 'navigation-panel:collection:list',
            }}
            parentPath={path}
          />
        ))}
      </NavigationPanelTreeRoot>
    </CollapsibleSection>
  );
};
