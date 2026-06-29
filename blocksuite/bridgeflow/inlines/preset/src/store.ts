import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';

import { InlineAdapterExtensions } from './adapters/extensions';

export class InlinePresetStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-inline-preset';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(InlineAdapterExtensions);
  }
}
