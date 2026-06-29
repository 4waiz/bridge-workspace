import type { Store } from '@blocksuite/bridgeflow/store';
import { Scope } from '@kanban-studios/infra';

import type { DocRecord } from '../entities/record';

export class DocScope extends Scope<{
  docId: string;
  record: DocRecord;
  blockSuiteDoc: Store;
}> {}
