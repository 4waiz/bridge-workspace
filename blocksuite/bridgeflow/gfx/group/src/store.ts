import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';

import {
  groupToMarkdownAdapterMatcher,
  groupToPlainTextAdapterMatcher,
} from './adapter';
import { groupRelationWatcherExtension } from './group-watcher';

export class GroupStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-group-gfx';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(groupToPlainTextAdapterMatcher);
    context.register(groupToMarkdownAdapterMatcher);
    context.register(groupRelationWatcherExtension);
  }
}
