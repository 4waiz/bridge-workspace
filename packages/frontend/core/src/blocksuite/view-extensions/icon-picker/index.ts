import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow/ext-loader';
import { FrameworkProvider } from '@kanban-studios/infra';
import { z } from 'zod';

import { patchIconPickerService } from './icon-picker-service';

const optionsSchema = z.object({
  framework: z.instanceof(FrameworkProvider).optional(),
});

type BridgeFlowIconPickerViewOptions = z.infer<typeof optionsSchema>;

export class BridgeFlowIconPickerExtension extends ViewExtensionProvider<BridgeFlowIconPickerViewOptions> {
  override name = 'bridgeflow-icon-picker-extension';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: BridgeFlowIconPickerViewOptions
  ) {
    super.setup(context, options);
    if (!options?.framework) {
      return;
    }
    const { framework } = options;
    context.register(patchIconPickerService(framework));
  }
}
