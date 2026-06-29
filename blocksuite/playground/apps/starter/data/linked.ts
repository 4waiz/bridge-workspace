import { Text, type Workspace } from '@blocksuite/bridgeflow/store';

import type { InitFn } from './utils.js';

export const linked: InitFn = (collection: Workspace, id: string) => {
  const docA =
    collection.getDoc(id)?.getStore({ id }) ??
    collection.createDoc(id).getStore({ id });

  const docBId = 'doc:linked-page';
  const docB = collection.createDoc(docBId).getStore();

  const docCId = 'doc:linked-edgeless';
  const docC = collection.createDoc(docCId).getStore();

  docA.doc.clear();
  docB.doc.clear();
  docC.doc.clear();

  docB.load(() => {
    const rootId = docB.addBlock('bridgeflow:page', {
      title: new Text(''),
    });

    docB.addBlock('bridgeflow:surface', {}, rootId);

    // Add note block inside root block
    const noteId = docB.addBlock('bridgeflow:note', {}, rootId);
    // Add paragraph block inside note block
    docB.addBlock('bridgeflow:paragraph', {}, noteId);
  });

  docC.load(() => {
    const rootId = docC.addBlock('bridgeflow:page', {
      title: new Text(''),
    });

    docC.addBlock('bridgeflow:surface', {}, rootId);

    // Add note block inside root block
    const noteId = docC.addBlock('bridgeflow:note', {}, rootId);
    // Add paragraph block inside note block
    docC.addBlock('bridgeflow:paragraph', {}, noteId);
  });

  docA.load();
  // Add root block and surface block at root level
  const rootId = docA.addBlock('bridgeflow:page', {
    title: new Text('Doc A'),
  });

  docA.addBlock('bridgeflow:surface', {}, rootId);

  // Add note block inside root block
  const noteId = docA.addBlock('bridgeflow:note', {}, rootId);
  // Add paragraph block inside note block
  docA.addBlock('bridgeflow:paragraph', {}, noteId);

  docA.addBlock('bridgeflow:embed-linked-doc', { pageId: docBId }, noteId);

  docA.addBlock(
    'bridgeflow:embed-linked-doc',
    { pageId: 'doc:deleted-example' },
    noteId
  );

  docA.addBlock('bridgeflow:embed-linked-doc', { pageId: docCId }, noteId);

  docA.addBlock(
    'bridgeflow:embed-linked-doc',
    { pageId: 'doc:deleted-example-edgeless' },
    noteId
  );

  docA.resetHistory();
  docB.resetHistory();
  docC.resetHistory();
};

linked.id = 'linked';
linked.displayName = 'Linked Doc Editor';
linked.description = 'A demo with linked docs';
