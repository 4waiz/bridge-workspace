import { EmbedYoutubeBlockSchema } from '@blocksuite/bridgeflow-model';
import { BlockMarkdownAdapterExtension } from '@blocksuite/bridgeflow-shared/adapters';

import { createEmbedBlockMarkdownAdapterMatcher } from '../../common/adapters/markdown.js';

export const embedYoutubeBlockMarkdownAdapterMatcher =
  createEmbedBlockMarkdownAdapterMatcher(EmbedYoutubeBlockSchema.model.flavour);

export const EmbedYoutubeMarkdownAdapterExtension =
  BlockMarkdownAdapterExtension(embedYoutubeBlockMarkdownAdapterMatcher);
