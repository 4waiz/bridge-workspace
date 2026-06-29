import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/bridgeflow/ext-loader';
import { z } from 'zod';

import { patchDatabaseBlockConfigService } from './database-block-config-service';

const optionsSchema = z.object({});

export type BridgeFlowDatabaseViewOptions = z.infer<typeof optionsSchema>;

export class BridgeFlowDatabaseViewExtension extends ViewExtensionProvider<BridgeFlowDatabaseViewOptions> {
  override name = 'bridgeflow-database-view';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: BridgeFlowDatabaseViewOptions
  ) {
    super.setup(context, options);

    context.register(patchDatabaseBlockConfigService());
  }
}
