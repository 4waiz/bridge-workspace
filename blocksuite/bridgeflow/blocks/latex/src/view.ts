import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { SlashMenuConfigExtension } from '@blocksuite/bridgeflow-widget-slash-menu';
import { BlockViewExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';

import { latexSlashMenuConfig } from './configs/slash-menu';
import { effects } from './effects';

export class LatexViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-latex-block';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      BlockViewExtension('bridgeflow:latex', literal`bridgeflow-latex`),
      SlashMenuConfigExtension('bridgeflow:latex', latexSlashMenuConfig),
    ]);
  }
}
