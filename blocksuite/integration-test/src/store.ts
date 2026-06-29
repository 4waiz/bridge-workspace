import { StoreExtensionManager } from '@blocksuite/bridgeflow/ext-loader';
import { getInternalStoreExtensions } from '@blocksuite/bridgeflow/extensions/store';

const manager = new StoreExtensionManager(getInternalStoreExtensions());

export function getTestStoreManager() {
  return manager;
}
