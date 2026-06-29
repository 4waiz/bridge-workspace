import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { DividerBlockSchemaExtension } from '@blocksuite/bridgeflow-model';

import { DividerBlockAdapterExtensions } from './adapters/extension';

export class DividerStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-divider-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(DividerBlockSchemaExtension);
    context.register(DividerBlockAdapterExtensions);
  }
}
