import { ToolbarModuleExtension } from '@blocksuite/bridgeflow-shared/services';
import { BlockFlavourIdentifier } from '@blocksuite/std';

import { builtinInlineReferenceToolbarConfig } from './reference-node/configs/toolbar';

export const referenceNodeToolbar = ToolbarModuleExtension({
  id: BlockFlavourIdentifier('bridgeflow:reference'),
  config: builtinInlineReferenceToolbarConfig,
});
