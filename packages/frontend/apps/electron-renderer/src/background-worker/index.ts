import '@bridgeflow/core/bootstrap/electron';

import { apis } from '@bridgeflow/electron-api';
import { broadcastChannelStorages } from '@bridgeflow/nbstore/broadcast-channel';
import { cloudStorages } from '@bridgeflow/nbstore/cloud';
import { bindNativeDBApis, sqliteStorages } from '@bridgeflow/nbstore/sqlite';
import {
  bindNativeDBV1Apis,
  sqliteV1Storages,
} from '@bridgeflow/nbstore/sqlite/v1';
import {
  StoreManagerConsumer,
  type WorkerManagerOps,
} from '@bridgeflow/nbstore/worker/consumer';
import { OpConsumer } from '@toeverything/infra/op';

// oxlint-disable-next-line no-non-null-assertion
bindNativeDBApis(apis!.nbstore);
// oxlint-disable-next-line no-non-null-assertion
bindNativeDBV1Apis(apis!.db);

const storeManager = new StoreManagerConsumer([
  ...sqliteStorages,
  ...sqliteV1Storages,
  ...broadcastChannelStorages,
  ...cloudStorages,
]);

window.addEventListener('message', ev => {
  if (ev.data.type === 'electron:worker-connect') {
    const port = ev.ports[0];

    const consumer = new OpConsumer<WorkerManagerOps>(port);
    storeManager.bindConsumer(consumer);
  }
});
