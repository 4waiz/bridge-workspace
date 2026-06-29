import { type DropTargetDropEvent, useDropTarget } from '@bridgeflow/component';
import type { BridgeFlowDNDData } from '@bridgeflow/core/types/dnd';
import { useI18n } from '@bridgeflow/i18n';

import { EmptyNodeChildren } from '../../layouts/empty-node-children';

export const Empty = ({
  onDrop,
  noAccessible = false,
}: {
  onDrop: (data: DropTargetDropEvent<BridgeFlowDNDData>) => void;
  noAccessible?: boolean;
}) => {
  const { dropTargetRef } = useDropTarget<BridgeFlowDNDData>(
    () => ({
      onDrop,
    }),
    [onDrop]
  );
  const t = useI18n();

  return (
    <EmptyNodeChildren ref={dropTargetRef}>
      {noAccessible
        ? t['com.bridgeflow.share-menu.option.permission.no-access']()
        : t['com.bridgeflow.rootAppSidebar.docs.no-subdoc']()}
    </EmptyNodeChildren>
  );
};
