import {
  DomElementRendererExtension,
  type DomRenderer,
} from '@blocksuite/bridgeflow-block-surface';
import type { BrushElementModel } from '@blocksuite/bridgeflow-model';
import { DefaultTheme } from '@blocksuite/bridgeflow-model';

import { renderBrushLikeDom } from './shared';

export const BrushDomRendererExtension = DomElementRendererExtension(
  'brush',
  (
    model: BrushElementModel,
    domElement: HTMLElement,
    renderer: DomRenderer
  ) => {
    renderBrushLikeDom({
      model,
      domElement,
      renderer,
      color: renderer.getColorValue(model.color, DefaultTheme.black, true),
    });
  }
);
