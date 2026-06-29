import { EmbedFigmaBlockSchema } from '@blocksuite/bridgeflow-model';
import { BlockPlainTextAdapterExtension } from '@blocksuite/bridgeflow-shared/adapters';

import { createEmbedBlockPlainTextAdapterMatcher } from '../../common/adapters/plain-text.js';

export const embedFigmaBlockPlainTextAdapterMatcher =
  createEmbedBlockPlainTextAdapterMatcher(EmbedFigmaBlockSchema.model.flavour);

export const EmbedFigmaBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(embedFigmaBlockPlainTextAdapterMatcher);
