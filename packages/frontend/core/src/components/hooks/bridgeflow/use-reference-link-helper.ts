import type { BridgeFlowTextAttributes } from '@blocksuite/bridgeflow/shared/types';
import {
  type DeltaInsert,
  Text,
  type Workspace,
} from '@blocksuite/bridgeflow/store';
import { useCallback } from 'react';

export function useReferenceLinkHelper(docCollection: Workspace) {
  const addReferenceLink = useCallback(
    (pageId: string, referenceId: string) => {
      const page = docCollection?.getDoc(pageId)?.getStore();
      if (!page) {
        return;
      }
      const text = new Text([
        {
          insert: ' ',
          attributes: {
            reference: {
              type: 'Subpage',
              pageId: referenceId,
            },
          },
        },
      ] as DeltaInsert<BridgeFlowTextAttributes>[]);
      const [frame] = page.getModelsByFlavour('bridgeflow:note');

      frame && page.addBlock('bridgeflow:paragraph', { text }, frame.id);
    },
    [docCollection]
  );

  return {
    addReferenceLink,
  };
}
