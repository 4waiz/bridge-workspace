import { createEmbedBlockHtmlAdapterMatcher } from '@blocksuite/bridgeflow-block-embed';
import { BookmarkBlockSchema } from '@blocksuite/bridgeflow-model';
import { BlockHtmlAdapterExtension } from '@blocksuite/bridgeflow-shared/adapters';

export const bookmarkBlockHtmlAdapterMatcher =
  createEmbedBlockHtmlAdapterMatcher(BookmarkBlockSchema.model.flavour);

export const BookmarkBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  bookmarkBlockHtmlAdapterMatcher
);
