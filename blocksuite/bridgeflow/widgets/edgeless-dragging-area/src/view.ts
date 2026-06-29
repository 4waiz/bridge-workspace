import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';

import { edgelessDraggingAreaWidget } from './edgeless-dragging-area-rect';
import { effects } from './effects';

export class EdgelessDraggingAreaViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-edgeless-dragging-area-widget';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    if (this.isEdgeless(context.scope)) {
      context.register(edgelessDraggingAreaWidget);
    }
  }
}
