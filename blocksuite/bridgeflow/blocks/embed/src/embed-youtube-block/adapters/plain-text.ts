import { EmbedYoutubeBlockSchema } from '@blocksuite/bridgeflow-model';
import { BlockPlainTextAdapterExtension } from '@blocksuite/bridgeflow-shared/adapters';

import { createEmbedBlockPlainTextAdapterMatcher } from '../../common/adapters/plain-text.js';

export const embedYoutubeBlockPlainTextAdapterMatcher =
  createEmbedBlockPlainTextAdapterMatcher(
    EmbedYoutubeBlockSchema.model.flavour
  );

export const EmbedYoutubeBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(embedYoutubeBlockPlainTextAdapterMatcher);
