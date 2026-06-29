import { Text, type Workspace } from '@blocksuite/bridgeflow/store';

import type { InitFn } from './utils.js';

export const embed: InitFn = (collection: Workspace, id: string) => {
  const doc = collection.getDoc(id) ?? collection.createDoc(id);
  const store = doc.getStore();
  doc.clear();

  doc.load(() => {
    // Add root block and surface block at root level
    const rootId = store.addBlock('bridgeflow:page', {
      title: new Text(),
    });

    const surfaceId = store.addBlock('bridgeflow:surface', {}, rootId);

    // Add note block inside root block
    const noteId = store.addBlock('bridgeflow:note', {}, rootId);
    // Add paragraph block inside note block
    store.addBlock('bridgeflow:paragraph', {}, noteId);

    store.addBlock(
      'bridgeflow:embed-github',
      {
        url: 'https://github.com/toeverything/BridgeFlow/pull/5453',
      },
      noteId
    );
    store.addBlock(
      'bridgeflow:embed-github',
      {
        url: 'https://www.github.com/toeverything/blocksuite/pull/5927',
        style: 'vertical',
        xywh: '[0, 400, 364, 390]',
      },
      surfaceId
    );
    store.addBlock(
      'bridgeflow:embed-github',
      {
        url: 'https://github.com/Milkdown/milkdown/pull/1215',
        xywh: '[500, 400, 752, 116]',
      },
      surfaceId
    );
    store.addBlock('bridgeflow:paragraph', {}, noteId);
  });

  store.resetHistory();
};

embed.id = 'embed';
embed.displayName = 'Example for embed blocks';
embed.description = 'Example for embed blocks';
