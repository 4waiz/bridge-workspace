import type { ReactToLit } from '@bridgeflow/component';
import type { BridgeFlowReference } from '@blocksuite/bridgeflow/inlines/reference';
import { ReferenceNodeConfigExtension } from '@blocksuite/bridgeflow/inlines/reference';
import type { ExtensionType } from '@blocksuite/bridgeflow/store';

export type ReferenceReactRenderer = (
  reference: BridgeFlowReference
) => React.ReactElement;

export function patchReferenceRenderer(
  reactToLit: ReactToLit,
  reactRenderer: ReferenceReactRenderer
): ExtensionType {
  const customContent = (reference: BridgeFlowReference) => {
    const node = reactRenderer(reference);
    return reactToLit(node, true);
  };

  return ReferenceNodeConfigExtension({
    customContent,
    hidePopup: BUILD_CONFIG.isMobileEdition,
  });
}
