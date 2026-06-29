import {
  type DropTargetDropEvent,
  type DropTargetOptions,
  useDropTarget,
} from '@bridgeflow/component';
import type { BridgeFlowDNDData } from '@bridgeflow/core/types/dnd';
import { useI18n } from '@bridgeflow/i18n';

import { EmptyNodeChildren } from '../../layouts/empty-node-children';
import { draggedOverHighlight } from './empty.css';

export const FolderEmpty = ({
  canDrop,
  onDrop,
}: {
  onDrop?: (data: DropTargetDropEvent<BridgeFlowDNDData>) => void;
  canDrop?: DropTargetOptions<BridgeFlowDNDData>['canDrop'];
}) => {
  const { dropTargetRef } = useDropTarget(
    () => ({
      onDrop,
      canDrop,
    }),
    [onDrop, canDrop]
  );

  const t = useI18n();
  return (
    <EmptyNodeChildren ref={dropTargetRef} className={draggedOverHighlight}>
      {t['com.bridgeflow.rootAppSidebar.organize.empty-folder']()}
    </EmptyNodeChildren>
  );
};
