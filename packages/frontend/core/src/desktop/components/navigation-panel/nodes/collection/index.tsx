import {
  AnimatedCollectionsIcon,
  type DropTargetDropEvent,
  type DropTargetOptions,
  MenuItem,
  toast,
} from '@bridgeflow/component';
import {
  type Collection,
  CollectionService,
} from '@bridgeflow/core/modules/collection';
import { WorkspaceDialogService } from '@bridgeflow/core/modules/dialogs';
import { GlobalContextService } from '@bridgeflow/core/modules/global-context';
import { NavigationPanelService } from '@bridgeflow/core/modules/navigation-panel';
import type { BridgeFlowDNDData } from '@bridgeflow/core/types/dnd';
import { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { FilterMinusIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService, useServices } from '@kanban-studios/infra';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  NavigationPanelTreeNode,
  type NavigationPanelTreeNodeDropEffect,
} from '../../tree';
import type { NavigationPanelTreeNodeIcon } from '../../tree/node';
import { NavigationPanelDocNode } from '../doc';
import type { GenericNavigationPanelNode } from '../types';
import { Empty } from './empty';
import { useNavigationPanelCollectionNodeOperations } from './operations';

const CollectionIcon: NavigationPanelTreeNodeIcon = ({
  className,
  draggedOver,
  treeInstruction,
}) => (
  <AnimatedCollectionsIcon
    className={className}
    closed={!!draggedOver && treeInstruction?.type === 'make-child'}
  />
);

export const NavigationPanelCollectionNode = ({
  collectionId,
  onDrop,
  location,
  reorderable,
  operations: additionalOperations,
  canDrop,
  dropEffect,
  parentPath,
}: {
  collectionId: string;
} & GenericNavigationPanelNode) => {
  const t = useI18n();
  const { globalContextService, workspaceDialogService } = useServices({
    GlobalContextService,
    WorkspaceDialogService,
  });
  const navigationPanelService = useService(NavigationPanelService);
  const active =
    useLiveData(globalContextService.globalContext.collectionId.$) ===
    collectionId;
  const path = useMemo(
    () => [...(parentPath ?? []), `collection-${collectionId}`],
    [parentPath, collectionId]
  );
  const collapsed = useLiveData(navigationPanelService.collapsed$(path));
  const setCollapsed = useCallback(
    (value: boolean) => {
      navigationPanelService.setCollapsed(path, value);
    },
    [navigationPanelService, path]
  );

  const collectionService = useService(CollectionService);
  const collection = useLiveData(collectionService.collection$(collectionId));
  const name = useLiveData(collection?.name$);

  const dndData = useMemo(() => {
    return {
      draggable: {
        entity: {
          type: 'collection',
          id: collectionId,
        },
        from: location,
      },
      dropTarget: {
        at: 'navigation-panel:doc',
      },
    } satisfies BridgeFlowDNDData;
  }, [collectionId, location]);

  const handleRename = useCallback(
    (name: string) => {
      if (collection && collection.name$.value !== name) {
        collectionService.updateCollection(collectionId, {
          name,
        });

        track.$.navigationPanel.organize.renameOrganizeItem({
          type: 'collection',
        });
        toast(t['com.bridgeflow.toastMessage.rename']());
      }
    },
    [collection, collectionId, collectionService, t]
  );

  const handleAddDocToCollection = useCallback(
    (docId: string) => {
      if (!collection) {
        return;
      }
      if (collection.allowList$.value.includes(docId)) {
        toast(t['com.bridgeflow.collection.addPage.alreadyExists']());
      } else {
        collectionService.addDocToCollection(collection.id, docId);
      }
    },
    [collection, collectionService, t]
  );

  const handleDropOnCollection = useCallback(
    (data: DropTargetDropEvent<BridgeFlowDNDData>) => {
      if (collection && data.treeInstruction?.type === 'make-child') {
        if (data.source.data.entity?.type === 'doc') {
          handleAddDocToCollection(data.source.data.entity.id);
          track.$.navigationPanel.organize.createOrganizeItem({
            type: 'link',
            target: 'doc',
            control: 'drag',
          });
          track.$.navigationPanel.collections.drop({
            type: data.source.data.entity.type,
          });
        }
      } else {
        onDrop?.(data);
      }
    },
    [collection, onDrop, handleAddDocToCollection]
  );

  const handleDropEffectOnCollection =
    useCallback<NavigationPanelTreeNodeDropEffect>(
      data => {
        if (collection && data.treeInstruction?.type === 'make-child') {
          if (data.source.data.entity?.type === 'doc') {
            return 'link';
          }
        } else {
          return dropEffect?.(data);
        }
        return;
      },
      [collection, dropEffect]
    );

  const handleDropOnPlaceholder = useCallback(
    (data: DropTargetDropEvent<BridgeFlowDNDData>) => {
      if (collection && data.source.data.entity?.type === 'doc') {
        handleAddDocToCollection(data.source.data.entity.id);
        track.$.navigationPanel.organize.createOrganizeItem({
          type: 'collection',
          control: 'drag',
        });
      }
    },
    [collection, handleAddDocToCollection]
  );

  const handleOpenCollapsed = useCallback(() => {
    setCollapsed(false);
  }, [setCollapsed]);

  const handleEditCollection = useCallback(() => {
    if (!collection) {
      return;
    }
    workspaceDialogService.open('collection-editor', {
      collectionId: collection.id,
    });
  }, [collection, workspaceDialogService]);

  const collectionOperations = useNavigationPanelCollectionNodeOperations(
    collectionId,
    handleOpenCollapsed,
    handleEditCollection
  );

  const finalOperations = useMemo(() => {
    if (additionalOperations) {
      return [...additionalOperations, ...collectionOperations];
    }
    return collectionOperations;
  }, [collectionOperations, additionalOperations]);

  const handleCanDrop = useMemo<DropTargetOptions<BridgeFlowDNDData>['canDrop']>(
    () => args => {
      const entityType = args.source.data.entity?.type;
      return args.treeInstruction?.type !== 'make-child'
        ? ((typeof canDrop === 'function' ? canDrop(args) : canDrop) ?? true)
        : entityType === 'doc';
    },
    [canDrop]
  );

  if (!collection) {
    return null;
  }

  return (
    <NavigationPanelTreeNode
      icon={CollectionIcon}
      name={name || t['Untitled']()}
      dndData={dndData}
      onDrop={handleDropOnCollection}
      renameable
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      to={`/collection/${collection.id}`}
      active={active}
      canDrop={handleCanDrop}
      reorderable={reorderable}
      onRename={handleRename}
      childrenPlaceholder={<Empty onDrop={handleDropOnPlaceholder} />}
      operations={finalOperations}
      dropEffect={handleDropEffectOnCollection}
      data-testid={`navigation-panel-collection-${collectionId}`}
      explorerIconConfig={{
        where: 'collection',
        id: collectionId,
      }}
    >
      <NavigationPanelCollectionNodeChildren
        collection={collection}
        path={path}
      />
    </NavigationPanelTreeNode>
  );
};

const NavigationPanelCollectionNodeChildren = ({
  collection,
  path,
}: {
  collection: Collection;
  path: string[];
}) => {
  const t = useI18n();
  const { collectionService } = useServices({
    CollectionService,
  });

  const allowList = useLiveData(
    collection.allowList$.map(list => new Set(list))
  );

  const handleRemoveFromAllowList = useCallback(
    (id: string) => {
      track.$.navigationPanel.collections.removeOrganizeItem({ type: 'doc' });
      collectionService.removeDocFromCollection(collection.id, id);
      toast(t['com.bridgeflow.collection.removePage.success']());
    },
    [collection.id, collectionService, t]
  );

  const [filteredDocIds, setFilteredDocIds] = useState<string[]>([]);

  useEffect(() => {
    const subscription = collection.watch().subscribe(docIds => {
      setFilteredDocIds(docIds);
    });

    return () => subscription.unsubscribe();
  }, [collection]);

  return filteredDocIds.map(docId => (
    <NavigationPanelDocNode
      key={docId}
      docId={docId}
      reorderable={false}
      location={{
        at: 'navigation-panel:collection:filtered-docs',
        collectionId: collection.id,
      }}
      parentPath={path}
      operations={
        allowList.has(docId)
          ? [
              {
                index: 99,
                view: (
                  <MenuItem
                    prefixIcon={<FilterMinusIcon />}
                    onClick={() => handleRemoveFromAllowList(docId)}
                  >
                    {t['Remove special filter']()}
                  </MenuItem>
                ),
              },
            ]
          : []
      }
    />
  ));
};
