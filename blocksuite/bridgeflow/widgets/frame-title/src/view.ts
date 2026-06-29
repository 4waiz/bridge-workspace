import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';

import { frameTitleWidget } from './bridgeflow-frame-title-widget';
import { effects } from './effects';

export class FrameTitleViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-frame-title-widget';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    if (context.scope === 'edgeless') {
      context.register(frameTitleWidget);
    }
  }
}
