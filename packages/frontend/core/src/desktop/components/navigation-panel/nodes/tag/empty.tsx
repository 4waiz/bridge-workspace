import { type DropTargetDropEvent, useDropTarget } from '@bridgeflow/component';
import type { BridgeFlowDNDData } from '@bridgeflow/core/types/dnd';
import { useI18n } from '@bridgeflow/i18n';

import { EmptyNodeChildren } from '../../layouts/empty-node-children';

export const Empty = ({
  onDrop,
}: {
  onDrop: (data: DropTargetDropEvent<BridgeFlowDNDData>) => void;
}) => {
  const { dropTargetRef } = useDropTarget(
    () => ({
      onDrop,
    }),
    [onDrop]
  );
  const t = useI18n();
  return (
    <EmptyNodeChildren ref={dropTargetRef}>
      {t['com.bridgeflow.rootAppSidebar.tags.no-doc']()}
    </EmptyNodeChildren>
  );
};
