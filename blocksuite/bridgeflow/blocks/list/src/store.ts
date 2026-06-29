import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { ListBlockSchemaExtension } from '@blocksuite/bridgeflow-model';

import { ListBlockAdapterExtensions } from './adapters/extension';

export class ListStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-list-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(ListBlockSchemaExtension);
    context.register(ListBlockAdapterExtensions);
  }
}
