import { Text, type Workspace } from '@blocksuite/bridgeflow/store';

import type { InitFn } from './utils.js';

export const empty: InitFn = (collection: Workspace, id: string) => {
  const doc = collection.getDoc(id) ?? collection.createDoc(id);
  const store = doc.getStore();
  doc.clear();

  doc.load(() => {
    // Add root block and surface block at root level
    const rootId = store.addBlock('bridgeflow:page', {
      title: new Text(),
    });

    store.addBlock('bridgeflow:surface', {}, rootId);

    // Add note block inside root block
    const noteId = store.addBlock('bridgeflow:note', {}, rootId);
    // Add paragraph block inside note block
    store.addBlock('bridgeflow:paragraph', {}, noteId);
  });

  store.resetHistory();
};

empty.id = 'empty';
empty.displayName = 'Empty Editor';
empty.description = 'Start from empty editor';
