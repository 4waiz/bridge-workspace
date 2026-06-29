import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { BookmarkBlockSchemaExtension } from '@blocksuite/bridgeflow-model';

import { BookmarkBlockAdapterExtensions } from './adapters/extension';

export class BookmarkStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-bookmark-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(BookmarkBlockSchemaExtension);
    context.register(BookmarkBlockAdapterExtensions);
  }
}
