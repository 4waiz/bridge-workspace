import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { BookmarkBlockSchema } from '@blocksuite/bridgeflow-model';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';

import { BookmarkBlockInteraction } from './bookmark-edgeless-block';
import { BookmarkSlashMenuConfigExtension } from './configs/slash-menu';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { EdgelessClipboardBookmarkConfig } from './edgeless-clipboard-config';
import { effects } from './effects';

const flavour = BookmarkBlockSchema.model.flavour;

export class BookmarkViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-bookmark-block';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      FlavourExtension(flavour),
      BlockViewExtension(flavour, model => {
        return model.parent?.flavour === 'bridgeflow:surface'
          ? literal`bridgeflow-edgeless-bookmark`
          : literal`bridgeflow-bookmark`;
      }),
      BookmarkSlashMenuConfigExtension,
    ]);
    context.register(createBuiltinToolbarConfigExtension(flavour));
    const isEdgeless = this.isEdgeless(context.scope);
    if (isEdgeless) {
      context.register(EdgelessClipboardBookmarkConfig);
      context.register(BookmarkBlockInteraction);
    }
  }
}
