import {
  DomElementRendererExtension,
  type DomRenderer,
} from '@blocksuite/bridgeflow-block-surface';
import type { HighlighterElementModel } from '@blocksuite/bridgeflow-model';
import { DefaultTheme } from '@blocksuite/bridgeflow-model';

import { renderBrushLikeDom } from './shared';

export const HighlighterDomRendererExtension = DomElementRendererExtension(
  'highlighter',
  (
    model: HighlighterElementModel,
    domElement: HTMLElement,
    renderer: DomRenderer
  ) => {
    renderBrushLikeDom({
      model,
      domElement,
      renderer,
      color: renderer.getColorValue(
        model.color,
        DefaultTheme.hightlighterColor,
        true
      ),
    });
  }
);
