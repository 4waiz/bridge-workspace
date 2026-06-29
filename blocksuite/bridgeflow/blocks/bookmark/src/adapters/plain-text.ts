import { createEmbedBlockPlainTextAdapterMatcher } from '@blocksuite/bridgeflow-block-embed';
import { BookmarkBlockSchema } from '@blocksuite/bridgeflow-model';
import { BlockPlainTextAdapterExtension } from '@blocksuite/bridgeflow-shared/adapters';

export const bookmarkBlockPlainTextAdapterMatcher =
  createEmbedBlockPlainTextAdapterMatcher(BookmarkBlockSchema.model.flavour);

export const BookmarkBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(bookmarkBlockPlainTextAdapterMatcher);
