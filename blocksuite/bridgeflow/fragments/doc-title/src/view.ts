import { ViewExtensionProvider } from '@blocksuite/bridgeflow-ext-loader';

import { effects } from './effects';

export class DocTitleViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-doc-title-fragment';

  override effect() {
    super.effect();
    effects();
  }
}
