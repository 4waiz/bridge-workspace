import { EmbedSyncedDocBlockSchema } from '@blocksuite/bridgeflow-model';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import type { ExtensionType } from '@blocksuite/store';
import { literal } from 'lit/static-html.js';

import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { HeightInitializationExtension } from './init-height-extension';

const flavour = EmbedSyncedDocBlockSchema.model.flavour;

export const EmbedSyncedDocViewExtensions: ExtensionType[] = [
  FlavourExtension(flavour),
  BlockViewExtension(flavour, model => {
    return model.parent?.flavour === 'bridgeflow:surface'
      ? literal`bridgeflow-embed-edgeless-synced-doc-block`
      : literal`bridgeflow-embed-synced-doc-block`;
  }),
  createBuiltinToolbarConfigExtension(flavour),
  HeightInitializationExtension,
].flat();
