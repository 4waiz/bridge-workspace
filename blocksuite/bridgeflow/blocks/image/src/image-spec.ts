import { ImageBlockSchema } from '@blocksuite/bridgeflow-model';
import { SlashMenuConfigExtension } from '@blocksuite/bridgeflow-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import type { ExtensionType } from '@blocksuite/store';
import { literal } from 'lit/static-html.js';

import { imageSlashMenuConfig } from './configs/slash-menu';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { ImageEdgelessBlockInteraction } from './image-edgeless-block';
import { ImageDropOption } from './image-service';

const flavour = ImageBlockSchema.model.flavour;

export const ImageBlockSpec: ExtensionType[] = [
  FlavourExtension(flavour),
  BlockViewExtension(flavour, model => {
    const parent = model.store.getParent(model.id);

    if (parent?.flavour === 'bridgeflow:surface') {
      return literal`bridgeflow-edgeless-image`;
    }

    return literal`bridgeflow-image`;
  }),
  ImageDropOption,
  ImageEdgelessBlockInteraction,
  createBuiltinToolbarConfigExtension(flavour),
  SlashMenuConfigExtension(flavour, imageSlashMenuConfig),
].flat();
