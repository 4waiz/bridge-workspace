import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';

import {
  referenceDeltaMarkdownAdapterMatch,
  referenceDeltaToHtmlAdapterMatcher,
  referenceDeltaToMarkdownAdapterMatcher,
} from './adapters';

export class ReferenceStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-reference-inline';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(referenceDeltaToHtmlAdapterMatcher);
    context.register(referenceDeltaToMarkdownAdapterMatcher);
    context.register(referenceDeltaMarkdownAdapterMatch);
  }
}
