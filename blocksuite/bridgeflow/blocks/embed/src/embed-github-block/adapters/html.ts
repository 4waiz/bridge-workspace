import { EmbedGithubBlockSchema } from '@blocksuite/bridgeflow-model';
import { BlockHtmlAdapterExtension } from '@blocksuite/bridgeflow-shared/adapters';

import { createEmbedBlockHtmlAdapterMatcher } from '../../common/adapters/html.js';

export const embedGithubBlockHtmlAdapterMatcher =
  createEmbedBlockHtmlAdapterMatcher(EmbedGithubBlockSchema.model.flavour);

export const EmbedGithubBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  embedGithubBlockHtmlAdapterMatcher
);
