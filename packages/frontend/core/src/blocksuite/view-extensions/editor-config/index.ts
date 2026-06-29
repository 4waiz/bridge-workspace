import { getEditorConfigExtension } from '@bridgeflow/core/blocksuite/view-extensions/editor-config/get-config';
import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow/ext-loader';
import { FrameworkProvider } from '@toeverything/infra';
import { z } from 'zod';

const optionsSchema = z.object({
  framework: z.instanceof(FrameworkProvider).optional(),
});

type BridgeFlowEditorConfigViewOptions = z.infer<typeof optionsSchema>;

export class BridgeFlowEditorConfigViewExtension extends ViewExtensionProvider<BridgeFlowEditorConfigViewOptions> {
  override name = 'bridgeflow-view-editor-config';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: BridgeFlowEditorConfigViewOptions
  ) {
    super.setup(context, options);
    const framework = options?.framework;
    if (!framework) {
      return;
    }

    if (context.scope === 'edgeless' || context.scope === 'page') {
      context.register(getEditorConfigExtension(framework));
    }
  }
}
