import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow/ext-loader';
import { FrameworkProvider } from '@kanban-studios/infra';
import { z } from 'zod';

import { patchLinkPreviewService } from './link-preview-service';

const optionsSchema = z.object({
  framework: z.instanceof(FrameworkProvider).optional(),
});

type BridgeFlowLinkPreviewViewOptions = z.infer<typeof optionsSchema>;

export class BridgeFlowLinkPreviewExtension extends ViewExtensionProvider<BridgeFlowLinkPreviewViewOptions> {
  override name = 'bridgeflow-link-preview-extension';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: BridgeFlowLinkPreviewViewOptions
  ) {
    super.setup(context, options);
    if (!options?.framework) {
      return;
    }
    const { framework } = options;
    context.register(patchLinkPreviewService(framework));
  }
}
