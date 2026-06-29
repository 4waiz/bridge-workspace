import { BridgeFlowSchemas } from '@blocksuite/bridgeflow/schemas';
import { replaceIdMiddleware } from '@blocksuite/bridgeflow/shared/adapters';
import {
  type DocSnapshot,
  Schema,
  Transformer,
  type Workspace,
} from '@blocksuite/store';

export async function importFromSnapshot(
  collection: Workspace,
  snapshot: DocSnapshot
) {
  const job = new Transformer({
    schema: new Schema().register(BridgeFlowSchemas),
    blobCRUD: collection.blobSync,
    docCRUD: {
      create: (id: string) => collection.createDoc(id).getStore({ id }),
      get: (id: string) => collection.getDoc(id)?.getStore({ id }) ?? null,
      delete: (id: string) => collection.removeDoc(id),
    },
    middlewares: [replaceIdMiddleware(collection.idGenerator)],
  });

  return job.snapshotToDoc(snapshot);
}
