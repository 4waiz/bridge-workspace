import {
  PreconditionStrategy,
  registerBridgeFlowCommand,
} from '@bridgeflow/core/commands';
import { useSharingUrl } from '@bridgeflow/core/components/hooks/bridgeflow/use-share-url';
import { useIsActiveView } from '@bridgeflow/core/modules/workbench';
import type { WorkspaceMetadata } from '@bridgeflow/core/modules/workspace';
import { track } from '@bridgeflow/track';
import { useEffect } from 'react';

export function useRegisterCopyLinkCommands({
  workspaceMeta,
  docId,
}: {
  workspaceMeta: WorkspaceMetadata;
  docId: string;
}) {
  const isActiveView = useIsActiveView();
  const workspaceId = workspaceMeta.id;
  const isCloud = workspaceMeta.flavour !== 'local';

  const { onClickCopyLink } = useSharingUrl({
    workspaceId,
    pageId: docId,
  });

  useEffect(() => {
    if (!isActiveView) {
      return;
    }
    const unsubs: Array<() => void> = [];

    unsubs.push(
      registerBridgeFlowCommand({
        id: `bridgeflow:share-private-link:${docId}`,
        category: 'bridgeflow:general',
        preconditionStrategy: PreconditionStrategy.Never,
        keyBinding: {
          binding: '$mod+Shift+c',
        },
        label: '',
        icon: null,
        run() {
          track.$.cmdk.general.copyShareLink();
          isActiveView && isCloud && onClickCopyLink();
        },
      })
    );
    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [docId, isActiveView, isCloud, onClickCopyLink]);
}
