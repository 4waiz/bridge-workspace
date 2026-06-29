import { ToolbarModuleExtension } from '@blocksuite/bridgeflow-shared/services';
import { BlockFlavourIdentifier } from '@blocksuite/std';

import { builtinInlineLinkToolbarConfig } from './link-node/configs/toolbar.js';

export const linkToolbar = ToolbarModuleExtension({
  id: BlockFlavourIdentifier('bridgeflow:link'),
  config: builtinInlineLinkToolbarConfig,
});
