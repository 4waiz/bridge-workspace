import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { BlockViewExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';

import { effects } from './effects';
import { DividerMarkdownExtension } from './markdown';

export class DividerViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-divider-block';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      BlockViewExtension('bridgeflow:divider', literal`bridgeflow-divider`),
      DividerMarkdownExtension,
    ]);
  }
}
