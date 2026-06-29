import { ViewExtensionProvider } from '@blocksuite/bridgeflow-ext-loader';

import { effects } from './effects';

export class OutlineViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-outline-fragment';

  override effect() {
    super.effect();
    effects();
  }
}
