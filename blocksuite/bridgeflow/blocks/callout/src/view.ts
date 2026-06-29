import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { SlashMenuConfigExtension } from '@blocksuite/bridgeflow-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';

import { CalloutKeymapExtension } from './callout-keymap';
import { calloutSlashMenuConfig } from './configs/slash-menu';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { effects } from './effects';

export class CalloutViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-callout-block';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      FlavourExtension('bridgeflow:callout'),
      BlockViewExtension('bridgeflow:callout', literal`bridgeflow-callout`),
      CalloutKeymapExtension,
      SlashMenuConfigExtension('bridgeflow:callout', calloutSlashMenuConfig),
      ...createBuiltinToolbarConfigExtension('bridgeflow:callout'),
    ]);
  }
}
