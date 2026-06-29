import '@bridgeflow/core/bootstrap/browser';

import { broadcastChannelStorages } from '@bridgeflow/nbstore/broadcast-channel';
import { cloudStorages } from '@bridgeflow/nbstore/cloud';
import { idbStorages } from '@bridgeflow/nbstore/idb';
import { idbV1Storages } from '@bridgeflow/nbstore/idb/v1';
import {
  StoreManagerConsumer,
  type WorkerManagerOps,
} from '@bridgeflow/nbstore/worker/consumer';
import { type MessageCommunicapable, OpConsumer } from '@kanban-studios/infra/op';

const consumer = new StoreManagerConsumer([
  ...idbStorages,
  ...idbV1Storages,
  ...broadcastChannelStorages,
  ...cloudStorages,
]);

if ('onconnect' in globalThis) {
  // if in shared worker

  (globalThis as any).onconnect = (event: MessageEvent) => {
    const port = event.ports[0];
    consumer.bindConsumer(new OpConsumer<WorkerManagerOps>(port));
  };
} else {
  // if in worker
  consumer.bindConsumer(
    new OpConsumer<WorkerManagerOps>(globalThis as MessageCommunicapable)
  );
}
