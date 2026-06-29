import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { NoteBlockSchema } from '@blocksuite/bridgeflow-model';
import {
  ToolbarModuleExtension,
  ViewportElementExtension,
} from '@blocksuite/bridgeflow-shared/services';
import {
  BlockFlavourIdentifier,
  BlockViewExtension,
  FlavourExtension,
} from '@blocksuite/std';
import { literal } from 'lit/static-html.js';

import { PageClipboard, ReadOnlyClipboard } from './clipboard';
import { builtinToolbarConfig } from './configs/toolbar';
import { EdgelessClipboardController, EdgelessRootService } from './edgeless';
import { EdgelessElementToolbarExtension } from './edgeless/configs/toolbar';
import { EdgelessLocker } from './edgeless/edgeless-root-spec';
import { AltCloneExtension } from './edgeless/interact-extensions/clone-ext';
import { effects } from './effects';
import { fallbackKeymap } from './keyboard/keymap';

export class RootViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-root-block';

  override effect(): void {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      FlavourExtension('bridgeflow:page'),
      fallbackKeymap,
      ToolbarModuleExtension({
        id: BlockFlavourIdentifier(NoteBlockSchema.model.flavour),
        config: builtinToolbarConfig,
      }),
    ]);
    if (
      context.scope === 'preview-page' ||
      context.scope === 'preview-edgeless'
    ) {
      context.register(ReadOnlyClipboard);
    }
    if (this.isEdgeless(context.scope)) {
      this._setupEdgeless(context);
      return;
    }
    this._setupPage(context);
  }

  private readonly _setupPage = (context: ViewExtensionContext) => {
    context.register(ViewportElementExtension('.bridgeflow-page-viewport'));
    if (context.scope === 'preview-page') {
      context.register(
        BlockViewExtension('bridgeflow:page', literal`bridgeflow-preview-root`)
      );
      return;
    }
    context.register(
      BlockViewExtension('bridgeflow:page', literal`bridgeflow-page-root`)
    );
    context.register(PageClipboard);
  };

  private readonly _setupEdgeless = (context: ViewExtensionContext) => {
    context.register([
      EdgelessRootService,
      ViewportElementExtension('.bridgeflow-edgeless-viewport'),
    ]);
    if (context.scope === 'preview-edgeless') {
      context.register([
        BlockViewExtension(
          'bridgeflow:page',
          literal`bridgeflow-edgeless-root-preview`
        ),
        EdgelessLocker,
      ]);
      return;
    }
    context.register([
      BlockViewExtension('bridgeflow:page', literal`bridgeflow-edgeless-root`),
      EdgelessClipboardController,
      AltCloneExtension,
    ]);
    context.register(EdgelessElementToolbarExtension);
  };
}
