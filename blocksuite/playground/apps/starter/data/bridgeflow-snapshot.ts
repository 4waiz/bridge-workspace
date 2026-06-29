import { BridgeFlowSchemas } from '@blocksuite/bridgeflow/schemas';
import { Schema, Text, type Workspace } from '@blocksuite/bridgeflow/store';
import { ZipTransformer } from '@blocksuite/bridgeflow/widgets/linked-doc';
export async function bridgeflowSnapshot(collection: Workspace, id: string) {
  const doc = collection.createDoc(id);
  doc.load();
  const store = doc.getStore();
  // Add root block and surface block at root level
  const rootId = store.addBlock('bridgeflow:page', {
    title: new Text('BridgeFlow Snapshot Test'),
  });
  store.addBlock('bridgeflow:surface', {}, rootId);

  const path = '/apps/starter/data/snapshots/bridgeflow-default.zip';
  const response = await fetch(path);
  const file = await response.blob();
  const schema = new Schema();
  schema.register(BridgeFlowSchemas);
  await ZipTransformer.importDocs(collection, schema, file);
}

bridgeflowSnapshot.id = 'bridgeflow-snapshot';
bridgeflowSnapshot.displayName = 'BridgeFlow Snapshot Test';
bridgeflowSnapshot.description = 'BridgeFlow Snapshot Test';
