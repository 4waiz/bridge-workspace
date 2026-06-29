import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';

import { DataViewBlockSchemaExtension } from './data-view-model';

export class DataViewStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-data-view-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(DataViewBlockSchemaExtension);
  }
}
