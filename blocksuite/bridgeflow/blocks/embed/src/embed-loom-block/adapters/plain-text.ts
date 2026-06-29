import { EmbedLoomBlockSchema } from '@blocksuite/bridgeflow-model';
import { BlockPlainTextAdapterExtension } from '@blocksuite/bridgeflow-shared/adapters';

import { createEmbedBlockPlainTextAdapterMatcher } from '../../common/adapters/plain-text.js';

export const embedLoomBlockPlainTextAdapterMatcher =
  createEmbedBlockPlainTextAdapterMatcher(EmbedLoomBlockSchema.model.flavour);

export const EmbedLoomBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(embedLoomBlockPlainTextAdapterMatcher);
