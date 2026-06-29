import { ViewExtensionProvider } from '@blocksuite/bridgeflow-ext-loader';

import { effects } from './effects';

export class FramePanelViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-frame-panel-fragment';

  override effect() {
    super.effect();
    effects();
  }
}
