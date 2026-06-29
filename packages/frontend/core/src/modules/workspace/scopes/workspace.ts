import type { WorkerInitOptions } from '@bridgeflow/nbstore/worker/client';
import { Scope } from '@toeverything/infra';

import type { WorkspaceOpenOptions } from '../open-options';

export class WorkspaceScope extends Scope<{
  openOptions: WorkspaceOpenOptions;
  engineWorkerInitOptions: WorkerInitOptions;
}> {}
