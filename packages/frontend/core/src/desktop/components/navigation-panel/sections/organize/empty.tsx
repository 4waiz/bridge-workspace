import {
  AnimatedFolderIcon,
  type DropTargetDropEvent,
  Skeleton,
  useDropTarget,
} from '@bridgeflow/component';
import type { BridgeFlowDNDData } from '@bridgeflow/core/types/dnd';
import { useI18n } from '@bridgeflow/i18n';

import { NavigationPanelEmptySection } from '../../layouts/empty-section';
import { DropEffect } from '../../tree';
import { organizeEmptyDropEffect, organizeEmptyRootCanDrop } from './dnd';

interface RootEmptyProps {
  onClickCreate?: () => void;
  isLoading?: boolean;
  onDrop?: (data: DropTargetDropEvent<BridgeFlowDNDData>) => void;
}

export const RootEmptyLoading = () => {
  return <Skeleton />;
};

export const RootEmptyReady = ({
  onClickCreate,
  onDrop,
}: Omit<RootEmptyProps, 'isLoading'>) => {
  const t = useI18n();

  const { dropTargetRef, draggedOverDraggable, draggedOverPosition } =
    useDropTarget<BridgeFlowDNDData>(
      () => ({
        data: { at: 'navigation-panel:organize:root' },
        onDrop,
        canDrop: organizeEmptyRootCanDrop,
      }),
      [onDrop]
    );

  return (
    <NavigationPanelEmptySection
      ref={dropTargetRef}
      icon={<AnimatedFolderIcon open={!!draggedOverDraggable} />}
      message={t['com.bridgeflow.rootAppSidebar.organize.empty']()}
      messageTestId="slider-bar-organize-empty-message"
      actionText={t[
        'com.bridgeflow.rootAppSidebar.organize.empty.new-folders-button'
      ]()}
      onActionClick={onClickCreate}
    >
      {draggedOverDraggable && (
        <DropEffect
          position={draggedOverPosition}
          dropEffect={organizeEmptyDropEffect({
            source: draggedOverDraggable,
            treeInstruction: null,
          })}
        />
      )}
    </NavigationPanelEmptySection>
  );
};

export const RootEmpty = ({ isLoading, ...props }: RootEmptyProps) => {
  return isLoading ? <RootEmptyLoading /> : <RootEmptyReady {...props} />;
};
