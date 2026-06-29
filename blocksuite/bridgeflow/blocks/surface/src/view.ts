import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';

import { effects } from './effects';
import {
  EdgelessCRUDExtension,
  EdgelessLegacySlotExtension,
  EditPropsMiddlewareBuilder,
} from './extensions';
import { ExportManagerExtension } from './extensions/export-manager/export-manager';
import { DefaultTool } from './tool/default-tool';

export class SurfaceViewExtension extends ViewExtensionProvider {
  override name = 'bridgeflow-surface-block';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      FlavourExtension('bridgeflow:surface'),
      EdgelessCRUDExtension,
      EdgelessLegacySlotExtension,
      ExportManagerExtension,
    ]);
    if (this.isEdgeless(context.scope)) {
      context.register(DefaultTool);
      context.register(
        BlockViewExtension('bridgeflow:surface', literal`bridgeflow-surface`)
      );
      context.register(EditPropsMiddlewareBuilder);
    } else {
      context.register(
        BlockViewExtension('bridgeflow:surface', literal`bridgeflow-surface-void`)
      );
    }
  }
}
