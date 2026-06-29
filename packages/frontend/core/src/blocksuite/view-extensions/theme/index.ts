import { getPreviewThemeExtension } from '@bridgeflow/core/blocksuite/view-extensions/theme/preview-theme';
import { getThemeExtension } from '@bridgeflow/core/blocksuite/view-extensions/theme/theme';
import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow/ext-loader';
import { FrameworkProvider } from '@toeverything/infra';
import { z } from 'zod';

const optionsSchema = z.object({
  framework: z.instanceof(FrameworkProvider).optional(),
});

type BridgeFlowThemeViewOptions = z.infer<typeof optionsSchema>;

export class BridgeFlowThemeViewExtension extends ViewExtensionProvider<BridgeFlowThemeViewOptions> {
  override name = 'bridgeflow-view-theme';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: BridgeFlowThemeViewOptions
  ) {
    super.setup(context, options);
    const framework = options?.framework;
    if (!framework) {
      return;
    }

    if (this.isPreview(context.scope)) {
      context.register(getPreviewThemeExtension(framework));
    } else {
      context.register(getThemeExtension(framework));
    }
  }
}
