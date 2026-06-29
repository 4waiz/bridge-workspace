import { ViewExtensionProvider } from '@blocksuite/bridgeflow-ext-loader';

import { effects } from './effects';

export class AdapterPanelViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-adapter-panel-fragment';

  override effect() {
    super.effect();
    effects();
  }
}
