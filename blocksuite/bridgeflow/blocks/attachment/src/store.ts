import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { AttachmentBlockSchemaExtension } from '@blocksuite/bridgeflow-model';

import { AttachmentBlockAdapterExtensions } from './adapters/extension';

export class AttachmentStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-attachment-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(AttachmentBlockSchemaExtension);
    context.register(AttachmentBlockAdapterExtensions);
  }
}
