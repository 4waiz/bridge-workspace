import { TestWorkspace } from '@blocksuite/bridgeflow/store/test';
import { getTestStoreManager } from '@blocksuite/integration-test/store';

export function createEmptyDoc() {
  const collection = new TestWorkspace();
  collection.storeExtensions = getTestStoreManager().get('store');
  collection.meta.initialize();
  const doc = collection.createDoc();
  const store = doc.getStore();

  return {
    doc,
    init() {
      doc.load();
      const rootId = store.addBlock('bridgeflow:page', {});
      store.addBlock('bridgeflow:surface', {}, rootId);
      const noteId = store.addBlock('bridgeflow:note', {}, rootId);
      store.addBlock('bridgeflow:paragraph', {}, noteId);
      return store;
    },
  };
}
