import { ViewExtensionManager } from '@blocksuite/bridgeflow/ext-loader';
import { getInternalViewExtensions } from '@blocksuite/bridgeflow/extensions/view';

const manager = new ViewExtensionManager(getInternalViewExtensions());

export function getTestViewManager() {
  return manager;
}
