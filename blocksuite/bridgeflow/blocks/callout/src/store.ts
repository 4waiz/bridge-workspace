import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { CalloutBlockSchemaExtension } from '@blocksuite/bridgeflow-model';

import { CalloutBlockMarkdownAdapterExtension } from './adapters/markdown';

export class CalloutStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-callout-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(CalloutBlockSchemaExtension);
    context.register(CalloutBlockMarkdownAdapterExtension);
  }
}
